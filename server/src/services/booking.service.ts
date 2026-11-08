import { prisma } from '../db';
import { AppError } from '../middlewares/error.middleware';

export interface PassengerInput {
  seatNumber: string;
  name: string;
  age: number;
  gender: string;
}

export interface CreateBookingDTO {
  userId: string;
  tripId: string;
  boardingPoint: string;
  droppingPoint: string;
  passengers: PassengerInput[];
}

export class BookingService {
  static async createBooking(dto: CreateBookingDTO) {
    if (!dto.passengers || dto.passengers.length === 0) {
      throw new AppError('At least one passenger and seat must be selected', 400);
    }

    const requestedSeats = dto.passengers.map(p => p.seatNumber.trim().toUpperCase());
    
    // Check for duplicate seat selections within the same request
    const uniqueSeats = new Set(requestedSeats);
    if (uniqueSeats.size !== requestedSeats.length) {
      throw new AppError('Duplicate seat numbers detected in the passenger list', 400);
    }

    // Verify trip exists and is active
    const trip = await prisma.trip.findUnique({
      where: { id: dto.tripId },
      include: {
        bus: { include: { operator: true } },
        route: true
      }
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    if (trip.status !== 'SCHEDULED') {
      throw new AppError(`Cannot book seats on a trip with status: ${trip.status}`, 400);
    }

    const totalAmount = trip.baseFare * requestedSeats.length;

    // Execute atomic transaction with concurrency-safe locking
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch requested seats
      const seatRecords = await tx.tripSeat.findMany({
        where: {
          tripId: dto.tripId,
          seatNumber: { in: requestedSeats }
        }
      });

      if (seatRecords.length !== requestedSeats.length) {
        throw new AppError('One or more selected seats do not exist on this bus', 400);
      }

      // 2. Check if already booked (Conflict check)
      const bookedSeats = seatRecords.filter(s => s.isBooked);
      if (bookedSeats.length > 0) {
        throw new AppError(
          `Seat(s) ${bookedSeats.map(s => s.seatNumber).join(', ')} already booked by another passenger. Please select alternative seats.`,
          409
        );
      }

      // 3. Atomically claim the seats using optimistic condition
      const updateResult = await tx.tripSeat.updateMany({
        where: {
          tripId: dto.tripId,
          seatNumber: { in: requestedSeats },
          isBooked: false
        },
        data: {
          isBooked: true
        }
      });

      if (updateResult.count !== requestedSeats.length) {
        throw new AppError('One or more selected seats were just claimed by another passenger. Transaction cancelled.', 409);
      }

      // 4. Generate unique PNR
      let pnr = '';
      let isUnique = false;
      while (!isUnique) {
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        pnr = `ALG-${randomCode}`;
        const existing = await tx.booking.findUnique({ where: { pnr } });
        if (!existing) isUnique = true;
      }

      // 5. Create Booking and Passenger records
      const booking = await tx.booking.create({
        data: {
          pnr,
          tripId: dto.tripId,
          userId: dto.userId,
          boardingPoint: dto.boardingPoint,
          droppingPoint: dto.droppingPoint,
          totalAmount,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          passengers: {
            create: dto.passengers.map(p => ({
              seatNumber: p.seatNumber.trim().toUpperCase(),
              name: p.name.trim(),
              age: Number(p.age),
              gender: p.gender.toUpperCase()
            }))
          }
        },
        include: {
          passengers: true,
          trip: {
            include: {
              bus: { include: { operator: true } },
              route: true
            }
          },
          user: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      });

      // 6. Link currentBookingId to the seats
      await tx.tripSeat.updateMany({
        where: {
          tripId: dto.tripId,
          seatNumber: { in: requestedSeats }
        },
        data: {
          currentBookingId: booking.id
        }
      });

      // 7. Audit log creation
      await tx.auditLog.create({
        data: {
          actorId: dto.userId,
          actorRole: booking.user.email ? 'PASSENGER' : 'USER',
          actorEmail: booking.user.email,
          action: 'BOOKING_CREATED',
          entityType: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            pnr: booking.pnr,
            tripId: booking.tripId,
            seats: requestedSeats,
            totalAmount,
            passengerCount: dto.passengers.length
          })
        }
      });

      return booking;
    });
  }

  static async getBookingByPnr(pnr: string) {
    const booking = await prisma.booking.findUnique({
      where: { pnr: pnr.trim().toUpperCase() },
      include: {
        passengers: true,
        trip: {
          include: {
            bus: { include: { operator: true } },
            route: {
              include: {
                stops: { orderBy: { sequenceOrder: 'asc' } }
              }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!booking) {
      throw new AppError(`Booking with PNR '${pnr}' not found`, 404);
    }

    return booking;
  }

  static async getUserBookings(userId: string) {
    return await prisma.booking.findMany({
      where: { userId },
      include: {
        passengers: true,
        trip: {
          include: {
            bus: { include: { operator: true } },
            route: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAllBookings(options: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) {
      where.status = options.status;
    }
    if (options.search) {
      where.OR = [
        { pnr: { contains: options.search } },
        { user: { name: { contains: options.search } } },
        { user: { email: { contains: options.search } } }
      ];
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          passengers: true,
          trip: {
            include: {
              bus: { include: { operator: true } },
              route: true
            }
          },
          user: {
            select: { id: true, name: true, email: true, phone: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bookings
    };
  }
}
