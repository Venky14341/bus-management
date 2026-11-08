import { prisma } from '../db';
import { AppError } from '../middlewares/error.middleware';

export class OperatorService {
  // Operators
  static async listOperators() {
    return await prisma.operator.findMany({
      include: {
        _count: { select: { buses: true, users: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async createOperator(data: {
    name: string;
    code: string;
    contactEmail: string;
    contactPhone: string;
    address?: string;
  }) {
    const existing = await prisma.operator.findUnique({
      where: { code: data.code.toUpperCase() }
    });
    if (existing) {
      throw new AppError('An operator with this code already exists', 409);
    }

    return await prisma.operator.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        address: data.address
      }
    });
  }

  // Buses
  static async listBuses(operatorId?: string) {
    const where = operatorId ? { operatorId } : {};
    return await prisma.bus.findMany({
      where,
      include: {
        operator: true,
        _count: { select: { trips: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createBus(data: {
    operatorId: string;
    busNumber: string;
    model: string;
    busType: string;
    totalSeats: number;
    layoutType?: string;
    hasWifi?: boolean;
    hasCharging?: boolean;
    hasWaterBottle?: boolean;
  }) {
    const existing = await prisma.bus.findUnique({
      where: { busNumber: data.busNumber.toUpperCase() }
    });
    if (existing) {
      throw new AppError('A bus with this registration number already exists', 409);
    }

    return await prisma.bus.create({
      data: {
        operatorId: data.operatorId,
        busNumber: data.busNumber.toUpperCase(),
        model: data.model,
        busType: data.busType,
        totalSeats: data.totalSeats,
        layoutType: data.layoutType || (data.busType === 'AC_SLEEPER' ? '2+1_SLEEPER' : '2+2'),
        hasWifi: data.hasWifi ?? true,
        hasCharging: data.hasCharging ?? true,
        hasWaterBottle: data.hasWaterBottle ?? true
      }
    });
  }

  // Routes
  static async listRoutes() {
    return await prisma.route.findMany({
      include: {
        stops: { orderBy: { sequenceOrder: 'asc' } },
        _count: { select: { trips: true } }
      },
      orderBy: { sourceCity: 'asc' }
    });
  }

  static async createRoute(data: {
    sourceCity: string;
    destinationCity: string;
    distanceKm: number;
    estimatedHours: number;
    stops?: Array<{
      stopName: string;
      stopType: string;
      sequenceOrder: number;
      offsetMinutes: number;
    }>;
  }) {
    return await prisma.route.create({
      data: {
        sourceCity: data.sourceCity,
        destinationCity: data.destinationCity,
        distanceKm: data.distanceKm,
        estimatedHours: data.estimatedHours,
        stops: data.stops ? {
          create: data.stops
        } : undefined
      },
      include: {
        stops: true
      }
    });
  }

  // Trips management
  static async listOperatorTrips(operatorId?: string) {
    const where = operatorId ? { bus: { operatorId } } : {};
    const trips = await prisma.trip.findMany({
      where,
      include: {
        bus: { include: { operator: true } },
        route: true,
        seats: true,
        _count: { select: { bookings: true } }
      },
      orderBy: [{ travelDate: 'desc' }, { departureTime: 'asc' }]
    });

    return trips.map(t => {
      const totalSeats = t.seats.length;
      const bookedSeats = t.seats.filter(s => s.isBooked).length;
      return {
        id: t.id,
        travelDate: t.travelDate,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        baseFare: t.baseFare,
        status: t.status,
        busNumber: t.bus.busNumber,
        busModel: t.bus.model,
        busType: t.bus.busType,
        operatorName: t.bus.operator.name,
        route: `${t.route.sourceCity} -> ${t.route.destinationCity}`,
        totalSeats,
        bookedSeats,
        availableSeats: totalSeats - bookedSeats,
        occupancyRate: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0,
        bookingCount: t._count.bookings
      };
    });
  }

  static async updateTripStatus(tripId: string, status: string, actorId: string) {
    const validStatuses = ['SCHEDULED', 'ON_THE_WAY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'TRIP_STATUS_UPDATED',
        entityType: 'Trip',
        entityId: tripId,
        details: JSON.stringify({ newStatus: status })
      }
    });

    return trip;
  }
}
