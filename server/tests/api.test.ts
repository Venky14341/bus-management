import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/db';

describe('Bus Booking Management System - Acceptance & Integration Tests', () => {
  let adminToken: string;
  let operatorToken: string;
  let passenger1Token: string;
  let passenger2Token: string;
  let testTripId: string;
  let testTripSeatNumber: string;

  beforeAll(async () => {
    // 1. Authenticate demo users to retrieve tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@algions.com', password: 'Password123!' });
    adminToken = adminRes.body.data.token;

    const opRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'operator@royalbus.com', password: 'Password123!' });
    operatorToken = opRes.body.data.token;

    const p1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'passenger@example.com', password: 'Password123!' });
    passenger1Token = p1Res.body.data.token;

    const p2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ananya@example.com', password: 'Password123!' });
    passenger2Token = p2Res.body.data.token;

    // Pick an available trip from database for testing
    const trip = await prisma.trip.findFirst({
      where: { status: 'SCHEDULED' },
      include: {
        seats: {
          where: { isBooked: false }
        }
      }
    });

    if (!trip || trip.seats.length < 5) {
      throw new Error('Test prerequisites not met: no trip with sufficient available seats found');
    }

    testTripId = trip.id;
    testTripSeatNumber = trip.seats[0].seatNumber;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Acceptance Test 1: Passenger can search valid trip
  describe('1. Trip Search & Discovery', () => {
    it('should search trips by origin and destination and return real-time available seat inventory', async () => {
      const res = await request(app)
        .get('/api/trips/search')
        .query({ origin: 'Bengaluru', destination: 'Chennai' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const trip = res.body.data[0];
      expect(trip).toHaveProperty('id');
      expect(trip).toHaveProperty('departureTime');
      expect(trip).toHaveProperty('arrivalTime');
      expect(trip).toHaveProperty('baseFare');
      expect(trip.inventory).toHaveProperty('availableSeats');
      expect(trip.inventory).toHaveProperty('totalSeats');
      expect(trip.route).toHaveProperty('boardingPoints');
      expect(trip.route).toHaveProperty('droppingPoints');
    });

    it('should retrieve full trip details with seat layout map', async () => {
      const res = await request(app).get(`/api/trips/${testTripId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.seatMap).toBeDefined();
      expect(res.body.data.seatMap.lowerDeck.length).toBeGreaterThan(0);
    });
  });

  // Acceptance Test 2 & 3: Concurrency protection & Valid PNR generation
  describe('2. Seat Booking, PNR Validation & Concurrency Protection', () => {
    it('CRITICAL CONCURRENCY TEST: Two users attempting to book the SAME seat simultaneously must result in 1 confirmation and 1 conflict rejection (HTTP 409)', async () => {
      // Pick a distinct seat for concurrency test
      const freshTrip = await prisma.trip.findUnique({
        where: { id: testTripId },
        include: { seats: { where: { isBooked: false } } }
      });
      const targetSeat = freshTrip!.seats[1].seatNumber;

      const bookingPayload1 = {
        tripId: testTripId,
        boardingPoint: 'Majestic Bus Stand',
        droppingPoint: 'Koyambedu CMBT',
        passengers: [
          { seatNumber: targetSeat, name: 'User One', age: 25, gender: 'MALE' }
        ]
      };

      const bookingPayload2 = {
        tripId: testTripId,
        boardingPoint: 'Majestic Bus Stand',
        droppingPoint: 'Koyambedu CMBT',
        passengers: [
          { seatNumber: targetSeat, name: 'User Two', age: 29, gender: 'FEMALE' }
        ]
      };

      // Fire both requests simultaneously using Promise.all
      const [res1, res2] = await Promise.all([
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${passenger1Token}`)
          .send(bookingPayload1),
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${passenger2Token}`)
          .send(bookingPayload2)
      ]);

      const statuses = [res1.status, res2.status].sort();
      // One request MUST succeed (201) and one MUST fail with conflict (409)
      expect(statuses).toEqual([201, 409]);

      const successRes = res1.status === 201 ? res1 : res2;
      const conflictRes = res1.status === 409 ? res1 : res2;

      // Validate success response has unique PNR
      expect(successRes.body.success).toBe(true);
      expect(successRes.body.data.pnr).toMatch(/^ALG-\d{6}$/);

      // Validate conflict response has clear conflict error
      expect(conflictRes.body.success).toBe(false);
      expect(conflictRes.body.message).toMatch(/already booked/i);
    });

    it('should reject a subsequent booking request for an already booked seat', async () => {
      // Attempt to book the targetSeat again
      const freshTrip = await prisma.trip.findUnique({
        where: { id: testTripId },
        include: { seats: { where: { isBooked: true } } }
      });
      const alreadyBookedSeat = freshTrip!.seats[0].seatNumber;

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passenger1Token}`)
        .send({
          tripId: testTripId,
          boardingPoint: 'Majestic Bus Stand',
          droppingPoint: 'Koyambedu CMBT',
          passengers: [
            { seatNumber: alreadyBookedSeat, name: 'Late Booker', age: 30, gender: 'MALE' }
          ]
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already booked/i);
    });

    it('Acceptance Criteria 3: PNR ticket includes correct passenger, route, date and seat details', async () => {
      // Find an available seat
      const trip = await prisma.trip.findUnique({
        where: { id: testTripId },
        include: { seats: { where: { isBooked: false } }, route: true }
      });
      const seat = trip!.seats[0].seatNumber;

      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passenger1Token}`)
        .send({
          tripId: testTripId,
          boardingPoint: 'Majestic Bus Stand',
          droppingPoint: 'Koyambedu CMBT',
          passengers: [
            { seatNumber: seat, name: 'Siddharth Rao', age: 31, gender: 'MALE' }
          ]
        });

      expect(bookRes.status).toBe(201);
      const pnr = bookRes.body.data.pnr;

      // Query by PNR
      const pnrRes = await request(app).get(`/api/bookings/pnr/${pnr}`);
      expect(pnrRes.status).toBe(200);
      const ticket = pnrRes.body.data;

      expect(ticket.pnr).toBe(pnr);
      expect(ticket.passengers[0].name).toBe('Siddharth Rao');
      expect(ticket.passengers[0].seatNumber).toBe(seat);
      expect(ticket.trip.travelDate).toBe(trip!.travelDate);
      expect(ticket.trip.route.sourceCity).toBe(trip!.route.sourceCity);
      expect(ticket.trip.route.destinationCity).toBe(trip!.route.destinationCity);
    });
  });

  // Acceptance Test 4: Cancellation and refund rules
  describe('3. Cancellation Rules, Refund Simulation & Seat Recovery', () => {
    let cancelBookingId: string;
    let cancelSeatNumber: string;

    beforeAll(async () => {
      const trip = await prisma.trip.findUnique({
        where: { id: testTripId },
        include: { seats: { where: { isBooked: false } } }
      });
      cancelSeatNumber = trip!.seats[0].seatNumber;

      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${passenger1Token}`)
        .send({
          tripId: testTripId,
          boardingPoint: 'Majestic Bus Stand',
          droppingPoint: 'Koyambedu CMBT',
          passengers: [
            { seatNumber: cancelSeatNumber, name: 'To Be Cancelled', age: 24, gender: 'FEMALE' }
          ]
        });

      cancelBookingId = bookRes.body.data.id;
    });

    it('should preview refund breakdown according to hours before departure', async () => {
      const res = await request(app)
        .get(`/api/cancellations/preview/${cancelBookingId}`)
        .set('Authorization', `Bearer ${passenger1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('refundPercentage');
      expect(res.body.data).toHaveProperty('cancellationFeePercentage');
      expect(res.body.data).toHaveProperty('refundAmount');
      expect(res.body.data).toHaveProperty('cancellationFee');
      expect(res.body.data.refundPercentage + res.body.data.cancellationFeePercentage).toBe(100);
    });

    it('Acceptance Criteria 4: Cancellation changes status to CANCELLED, processes refund, and restores seat to available', async () => {
      // 1. Verify seat is currently booked
      const seatBefore = await prisma.tripSeat.findUnique({
        where: {
          tripId_seatNumber: { tripId: testTripId, seatNumber: cancelSeatNumber }
        }
      });
      expect(seatBefore!.isBooked).toBe(true);

      // 2. Perform cancellation
      const cancelRes = await request(app)
        .post(`/api/cancellations/${cancelBookingId}`)
        .set('Authorization', `Bearer ${passenger1Token}`)
        .send({ reason: 'Emergency medical appointment' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.booking.status).toBe('CANCELLED');
      expect(cancelRes.body.data.booking.paymentStatus).toMatch(/REFUNDED/);

      // 3. Verify seat is immediately available again in database!
      const seatAfter = await prisma.tripSeat.findUnique({
        where: {
          tripId_seatNumber: { tripId: testTripId, seatNumber: cancelSeatNumber }
        }
      });
      expect(seatAfter!.isBooked).toBe(false);
      expect(seatAfter!.currentBookingId).toBeNull();

      // 4. Verify booking history preserves cancellation
      const historyRes = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${passenger1Token}`);

      const cancelledInHistory = historyRes.body.data.find((b: any) => b.id === cancelBookingId);
      expect(cancelledInHistory).toBeDefined();
      expect(cancelledInHistory.status).toBe('CANCELLED');
    });
  });

  // Acceptance Test 5: Operator Manifest and Occupancy Reconciliation
  describe('4. Operator Manifest & Occupancy Reconciliation', () => {
    it('Acceptance Criteria 5: Manifest and occupancy summaries reconcile with confirmed tickets', async () => {
      const res = await request(app)
        .get(`/api/reports/manifest/${testTripId}`)
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { reconciliation, manifest } = res.body.data;
      expect(reconciliation).toBeDefined();

      // Check mathematical reconciliation:
      // manifestPassengerCount MUST equal bookedSeats!
      expect(reconciliation.manifestPassengerCount).toBe(manifest.length);
      expect(reconciliation.isReconciled).toBe(true);
      expect(reconciliation.totalSeats).toBe(reconciliation.bookedSeats + reconciliation.availableSeats);
    });

    it('should retrieve operator dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overview).toHaveProperty('totalTrips');
      expect(res.body.data.overview).toHaveProperty('confirmedBookingsCount');
      expect(res.body.data.overview).toHaveProperty('totalRevenue');
      expect(res.body.data.upcomingTrips.length).toBeGreaterThan(0);
    });
  });

  // Security & RBAC Test
  describe('5. Server-Side RBAC Enforcement', () => {
    it('should reject a passenger attempting to create a trip with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${passenger1Token}`)
        .send({
          routeId: 'dummy-route',
          busId: 'dummy-bus',
          travelDate: '2026-11-20',
          departureTime: '10:00',
          arrivalTime: '15:00',
          baseFare: 500
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Forbidden/i);
    });

    it('should reject unauthenticated requests to protected endpoints with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/reports/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Authentication required/i);
    });
  });
});
