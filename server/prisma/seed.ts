import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Bus Booking Management System database...');

  // Clean existing data in reverse order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.tripSeat.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.user.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.cancellationRule.deleteMany();

  // 1. Password hashing
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 2. Cancellation Rules
  console.log('Creating cancellation rules...');
  await prisma.cancellationRule.createMany({
    data: [
      {
        name: 'Flexible (> 24 Hours)',
        minHoursBeforeDeparture: 24,
        maxHoursBeforeDeparture: null,
        refundPercentage: 90.0,
        cancellationFeePercentage: 10.0,
        active: true
      },
      {
        name: 'Standard (12 to 24 Hours)',
        minHoursBeforeDeparture: 12,
        maxHoursBeforeDeparture: 24,
        refundPercentage: 50.0,
        cancellationFeePercentage: 50.0,
        active: true
      },
      {
        name: 'Late Window (< 12 Hours)',
        minHoursBeforeDeparture: 0,
        maxHoursBeforeDeparture: 12,
        refundPercentage: 0.0,
        cancellationFeePercentage: 100.0,
        active: true
      }
    ]
  });

  // 3. Operators
  console.log('Creating bus operators...');
  const royalOperator = await prisma.operator.create({
    data: {
      name: 'Royal Express Travels',
      code: 'ROYAL',
      contactEmail: 'support@royalexpress.com',
      contactPhone: '+91 98765 43210',
      address: 'Indiranagar, Bengaluru, Karnataka 560038',
      rating: 4.8
    }
  });

  const greenlineOperator = await prisma.operator.create({
    data: {
      name: 'GreenLine Superfast Eco',
      code: 'GREEN',
      contactEmail: 'ops@greenlinebus.in',
      contactPhone: '+91 98450 11223',
      address: 'Guindy, Chennai, Tamil Nadu 600032',
      rating: 4.7
    }
  });

  const kaveriOperator = await prisma.operator.create({
    data: {
      name: 'Kaveri Intercity Lines',
      code: 'KAVERI',
      contactEmail: 'contact@kaveritravels.com',
      contactPhone: '+91 91234 56789',
      address: 'Hitech City, Hyderabad, Telangana 500081',
      rating: 4.6
    }
  });

  // 4. Users (Admin, Operators, Passengers)
  console.log('Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@algions.com',
      passwordHash,
      role: 'ADMIN',
      phone: '+91 99000 00001'
    }
  });

  const operatorUser1 = await prisma.user.create({
    data: {
      name: 'Vikram Sharma (Royal Ops)',
      email: 'operator@royalbus.com',
      passwordHash,
      role: 'OPERATOR',
      phone: '+91 99000 00002',
      operatorId: royalOperator.id
    }
  });

  const operatorUser2 = await prisma.user.create({
    data: {
      name: 'Priya Nair (GreenLine Ops)',
      email: 'operator@greenline.com',
      passwordHash,
      role: 'OPERATOR',
      phone: '+91 99000 00003',
      operatorId: greenlineOperator.id
    }
  });

  const passengerUser1 = await prisma.user.create({
    data: {
      name: 'Rahul Mehta',
      email: 'passenger@example.com',
      passwordHash,
      role: 'PASSENGER',
      phone: '+91 98765 00001'
    }
  });

  const passengerUser2 = await prisma.user.create({
    data: {
      name: 'Ananya Iyer',
      email: 'ananya@example.com',
      passwordHash,
      role: 'PASSENGER',
      phone: '+91 98765 00002'
    }
  });

  // 5. Buses
  console.log('Creating buses...');
  const bus1 = await prisma.bus.create({
    data: {
      operatorId: royalOperator.id,
      busNumber: 'KA-01-MJ-9901',
      model: 'Volvo 9600 Multi-Axle AC Sleeper',
      busType: 'AC_SLEEPER',
      totalSeats: 30,
      layoutType: '2+1_SLEEPER',
      hasWifi: true,
      hasCharging: true,
      hasWaterBottle: true
    }
  });

  const bus2 = await prisma.bus.create({
    data: {
      operatorId: royalOperator.id,
      busNumber: 'KA-04-AK-5522',
      model: 'Scania Metrolink HD Semi-Sleeper',
      busType: 'AC_SEATER',
      totalSeats: 40,
      layoutType: '2+2',
      hasWifi: true,
      hasCharging: true,
      hasWaterBottle: false
    }
  });

  const bus3 = await prisma.bus.create({
    data: {
      operatorId: greenlineOperator.id,
      busNumber: 'TN-09-CB-1234',
      model: 'BharatBenz Premium AC Sleeper',
      busType: 'AC_SLEEPER',
      totalSeats: 30,
      layoutType: '2+1_SLEEPER',
      hasWifi: true,
      hasCharging: true,
      hasWaterBottle: true
    }
  });

  const bus4 = await prisma.bus.create({
    data: {
      operatorId: kaveriOperator.id,
      busNumber: 'TS-07-EA-7788',
      model: 'Ashok Leyland Multi-Axle Intercity',
      busType: 'NON_AC_SEATER',
      totalSeats: 40,
      layoutType: '2+2',
      hasWifi: false,
      hasCharging: true,
      hasWaterBottle: false
    }
  });

  // 6. Routes and Stops
  console.log('Creating routes and intermediate stops...');
  const route1 = await prisma.route.create({
    data: {
      sourceCity: 'Bengaluru',
      destinationCity: 'Chennai',
      distanceKm: 350,
      estimatedHours: 6.0,
      stops: {
        create: [
          { stopName: 'Majestic Bus Stand', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
          { stopName: 'Silk Board Junction', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 30 },
          { stopName: 'Electronic City Toll', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 50 },
          { stopName: 'Hosur Bypass', stopType: 'BOARDING', sequenceOrder: 4, offsetMinutes: 80 },
          { stopName: 'Vellore Toll Plaza', stopType: 'BOTH', sequenceOrder: 5, offsetMinutes: 200 },
          { stopName: 'Sriperumbudur Bus Stop', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 300 },
          { stopName: 'Koyambedu CMBT', stopType: 'DROPPING', sequenceOrder: 7, offsetMinutes: 360 }
        ]
      }
    }
  });

  const route2 = await prisma.route.create({
    data: {
      sourceCity: 'Bengaluru',
      destinationCity: 'Hyderabad',
      distanceKm: 570,
      estimatedHours: 8.5,
      stops: {
        create: [
          { stopName: 'Majestic Bus Stand', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
          { stopName: 'Hebbal Flyover', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 25 },
          { stopName: 'Devanahalli Toll', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 50 },
          { stopName: 'Anantapur Food Court', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 220 },
          { stopName: 'Kurnool Bypass', stopType: 'BOTH', sequenceOrder: 5, offsetMinutes: 340 },
          { stopName: 'Shamshabad Airport Circle', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 470 },
          { stopName: 'Gachibowli Outer Ring Road', stopType: 'DROPPING', sequenceOrder: 7, offsetMinutes: 510 }
        ]
      }
    }
  });

  const route3 = await prisma.route.create({
    data: {
      sourceCity: 'Mumbai',
      destinationCity: 'Pune',
      distanceKm: 150,
      estimatedHours: 3.5,
      stops: {
        create: [
          { stopName: 'Dadar TT Circle', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
          { stopName: 'Vashi Plaza', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 40 },
          { stopName: 'Panvel Kalamboli', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 70 },
          { stopName: 'Lonavala Express Highway', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 130 },
          { stopName: 'Wakad Bridge', stopType: 'DROPPING', sequenceOrder: 5, offsetMinutes: 180 },
          { stopName: 'Swargate Bus Station', stopType: 'DROPPING', sequenceOrder: 6, offsetMinutes: 210 }
        ]
      }
    }
  });

  const route4 = await prisma.route.create({
    data: {
      sourceCity: 'Delhi',
      destinationCity: 'Jaipur',
      distanceKm: 280,
      estimatedHours: 5.0,
      stops: {
        create: [
          { stopName: 'Kashmere Gate ISBT', stopType: 'BOARDING', sequenceOrder: 1, offsetMinutes: 0 },
          { stopName: 'Dhaula Kuan Metro', stopType: 'BOARDING', sequenceOrder: 2, offsetMinutes: 35 },
          { stopName: 'IFFCO Chowk Gurgaon', stopType: 'BOARDING', sequenceOrder: 3, offsetMinutes: 65 },
          { stopName: 'Kotputli Midway', stopType: 'BOTH', sequenceOrder: 4, offsetMinutes: 160 },
          { stopName: 'Sindhi Camp Jaipur', stopType: 'DROPPING', sequenceOrder: 5, offsetMinutes: 300 }
        ]
      }
    }
  });

  // Helper to generate seat map records
  function generateSeats(busType: string) {
    const seats: Array<{ seatNumber: string; deck: string; seatType: string }> = [];
    if (busType === 'AC_SLEEPER') {
      // 30 berths: 15 Lower (L1 to L15), 15 Upper (U1 to U15)
      for (let i = 1; i <= 15; i++) {
        seats.push({ seatNumber: `L${i}`, deck: 'LOWER', seatType: 'SLEEPER' });
      }
      for (let i = 1; i <= 15; i++) {
        seats.push({ seatNumber: `U${i}`, deck: 'UPPER', seatType: 'SLEEPER' });
      }
    } else {
      // 40 Seater: 10 rows of 4 seats (A, B aisle C, D)
      const cols = ['A', 'B', 'C', 'D'];
      for (let row = 1; row <= 10; row++) {
        for (const col of cols) {
          seats.push({ seatNumber: `${row}${col}`, deck: 'LOWER', seatType: 'SEATER' });
        }
      }
    }
    return seats;
  }

  // 7. Trips for Today, Tomorrow, and Next 5 Days
  console.log('Creating trips and initializing seat inventories...');
  const today = new Date();
  const formatOffsetDate = (daysAhead: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const dates = [
    formatOffsetDate(0), // Today
    formatOffsetDate(1), // Tomorrow
    formatOffsetDate(2),
    formatOffsetDate(3),
    formatOffsetDate(4),
    formatOffsetDate(5)
  ];

  let sampleTripForBooking: any = null;

  for (const travelDate of dates) {
    // Bengaluru -> Chennai (Night Sleeper)
    const trip1 = await prisma.trip.create({
      data: {
        routeId: route1.id,
        busId: bus1.id,
        departureTime: '22:30',
        arrivalTime: '04:30',
        travelDate,
        baseFare: 850.0,
        status: 'SCHEDULED'
      }
    });

    const seatsTrip1 = generateSeats(bus1.busType).map(s => ({
      tripId: trip1.id,
      seatNumber: s.seatNumber,
      deck: s.deck,
      seatType: s.seatType,
      isBooked: false
    }));
    await prisma.tripSeat.createMany({ data: seatsTrip1 });

    if (travelDate === dates[0]) {
      sampleTripForBooking = trip1;
    }

    // Bengaluru -> Chennai (Day AC Seater)
    const trip2 = await prisma.trip.create({
      data: {
        routeId: route1.id,
        busId: bus2.id,
        departureTime: '06:30',
        arrivalTime: '12:30',
        travelDate,
        baseFare: 550.0,
        status: 'SCHEDULED'
      }
    });
    const seatsTrip2 = generateSeats(bus2.busType).map(s => ({
      tripId: trip2.id,
      seatNumber: s.seatNumber,
      deck: s.deck,
      seatType: s.seatType,
      isBooked: false
    }));
    await prisma.tripSeat.createMany({ data: seatsTrip2 });

    // Bengaluru -> Hyderabad (Night Sleeper)
    const trip3 = await prisma.trip.create({
      data: {
        routeId: route2.id,
        busId: bus3.id,
        departureTime: '21:00',
        arrivalTime: '05:30',
        travelDate,
        baseFare: 1100.0,
        status: 'SCHEDULED'
      }
    });
    const seatsTrip3 = generateSeats(bus3.busType).map(s => ({
      tripId: trip3.id,
      seatNumber: s.seatNumber,
      deck: s.deck,
      seatType: s.seatType,
      isBooked: false
    }));
    await prisma.tripSeat.createMany({ data: seatsTrip3 });

    // Mumbai -> Pune (Morning Express)
    const trip4 = await prisma.trip.create({
      data: {
        routeId: route3.id,
        busId: bus2.id,
        departureTime: '07:00',
        arrivalTime: '10:30',
        travelDate,
        baseFare: 380.0,
        status: 'SCHEDULED'
      }
    });
    const seatsTrip4 = generateSeats(bus2.busType).map(s => ({
      tripId: trip4.id,
      seatNumber: s.seatNumber,
      deck: s.deck,
      seatType: s.seatType,
      isBooked: false
    }));
    await prisma.tripSeat.createMany({ data: seatsTrip4 });

    // Delhi -> Jaipur (Evening Non-AC Seater)
    const trip5 = await prisma.trip.create({
      data: {
        routeId: route4.id,
        busId: bus4.id,
        departureTime: '16:00',
        arrivalTime: '21:00',
        travelDate,
        baseFare: 420.0,
        status: 'SCHEDULED'
      }
    });
    const seatsTrip5 = generateSeats(bus4.busType).map(s => ({
      tripId: trip5.id,
      seatNumber: s.seatNumber,
      deck: s.deck,
      seatType: s.seatType,
      isBooked: false
    }));
    await prisma.tripSeat.createMany({ data: seatsTrip5 });
  }

  // 8. Create a pre-seeded confirmed booking for reviewer demonstration
  if (sampleTripForBooking) {
    console.log('Creating initial demo booking and manifest entries...');
    const booking1 = await prisma.booking.create({
      data: {
        pnr: 'ALG-984021',
        tripId: sampleTripForBooking.id,
        userId: passengerUser1.id,
        boardingPoint: 'Majestic Bus Stand',
        droppingPoint: 'Koyambedu CMBT',
        totalAmount: 1700.0,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        passengers: {
          create: [
            {
              seatNumber: 'L1',
              name: 'Rahul Mehta',
              age: 28,
              gender: 'MALE'
            },
            {
              seatNumber: 'L2',
              name: 'Sneha Mehta',
              age: 26,
              gender: 'FEMALE'
            }
          ]
        }
      }
    });

    // Mark seats as booked
    await prisma.tripSeat.updateMany({
      where: {
        tripId: sampleTripForBooking.id,
        seatNumber: { in: ['L1', 'L2'] }
      },
      data: {
        isBooked: true,
        currentBookingId: booking1.id
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: passengerUser1.id,
        actorRole: 'PASSENGER',
        actorEmail: passengerUser1.email,
        action: 'BOOKING_CREATED',
        entityType: 'Booking',
        entityId: booking1.id,
        details: JSON.stringify({
          pnr: booking1.pnr,
          seats: ['L1', 'L2'],
          amount: 1700.0,
          tripId: sampleTripForBooking.id
        })
      }
    });

    // Also create a sample cancelled booking to demonstrate cancellation history & refund calculation
    const cancelledBooking = await prisma.booking.create({
      data: {
        pnr: 'ALG-812044',
        tripId: sampleTripForBooking.id,
        userId: passengerUser2.id,
        boardingPoint: 'Silk Board Junction',
        droppingPoint: 'Koyambedu CMBT',
        totalAmount: 850.0,
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
        refundAmount: 765.0, // 90%
        cancellationFee: 85.0, // 10%
        cancelledAt: new Date(),
        cancellationReason: 'Travel plans postponed',
        passengers: {
          create: [
            {
              seatNumber: 'L3',
              name: 'Ananya Iyer',
              age: 25,
              gender: 'FEMALE'
            }
          ]
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        actorId: passengerUser2.id,
        actorRole: 'PASSENGER',
        actorEmail: passengerUser2.email,
        action: 'BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: cancelledBooking.id,
        details: JSON.stringify({
          pnr: cancelledBooking.pnr,
          refundAmount: 765.0,
          fee: 85.0,
          reason: 'Travel plans postponed'
        })
      }
    });
  }

  console.log('Database seeding successfully completed!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('Admin:     admin@algions.com / Password123!');
  console.log('Operator:  operator@royalbus.com / Password123!');
  console.log('Passenger: passenger@example.com / Password123!');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
