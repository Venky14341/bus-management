import { prisma } from '../db';
import { AppError } from '../middlewares/error.middleware';

export interface TripSearchParams {
  origin?: string;
  destination?: string;
  travelDate?: string;
  busType?: string;
  operatorId?: string;
  minPrice?: number;
  maxPrice?: number;
  timeWindow?: string; // 'morning' | 'afternoon' | 'evening' | 'night'
  sortBy?: string; // 'price_asc' | 'price_desc' | 'time_asc' | 'rating_desc'
}

export class TripService {
  static async searchTrips(params: TripSearchParams) {
    const where: any = {
      status: 'SCHEDULED'
    };

    if (params.travelDate) {
      where.travelDate = params.travelDate;
    }

    if (params.busType) {
      where.bus = {
        ...(where.bus || {}),
        busType: params.busType
      };
    }

    if (params.operatorId) {
      where.bus = {
        ...(where.bus || {}),
        operatorId: params.operatorId
      };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.baseFare = {};
      if (params.minPrice !== undefined) where.baseFare.gte = Number(params.minPrice);
      if (params.maxPrice !== undefined) where.baseFare.lte = Number(params.maxPrice);
    }

    // Filter by route cities (case-insensitive substring or match)
    if (params.origin || params.destination) {
      where.route = {};
      if (params.origin) {
        where.route.sourceCity = {
          contains: params.origin
        };
      }
      if (params.destination) {
        where.route.destinationCity = {
          contains: params.destination
        };
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        route: {
          include: {
            stops: {
              orderBy: { sequenceOrder: 'asc' }
            }
          }
        },
        bus: {
          include: {
            operator: true
          }
        },
        seats: {
          select: {
            id: true,
            seatNumber: true,
            isBooked: true,
            deck: true,
            seatType: true
          }
        }
      },
      orderBy: {
        departureTime: 'asc'
      }
    });

    // Map and calculate real-time available seat count for each trip
    let mapped = trips.map(t => {
      const totalSeats = t.seats.length;
      const bookedSeats = t.seats.filter(s => s.isBooked).length;
      const availableSeats = totalSeats - bookedSeats;

      const boardingPoints = t.route.stops.filter(
        s => s.stopType === 'BOARDING' || s.stopType === 'BOTH'
      );
      const droppingPoints = t.route.stops.filter(
        s => s.stopType === 'DROPPING' || s.stopType === 'BOTH'
      );

      return {
        id: t.id,
        travelDate: t.travelDate,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        baseFare: t.baseFare,
        status: t.status,
        bus: {
          id: t.bus.id,
          busNumber: t.bus.busNumber,
          model: t.bus.model,
          busType: t.bus.busType,
          layoutType: t.bus.layoutType,
          hasWifi: t.bus.hasWifi,
          hasCharging: t.bus.hasCharging,
          hasWaterBottle: t.bus.hasWaterBottle,
          operator: {
            id: t.bus.operator.id,
            name: t.bus.operator.name,
            code: t.bus.operator.code,
            rating: t.bus.operator.rating
          }
        },
        route: {
          id: t.route.id,
          sourceCity: t.route.sourceCity,
          destinationCity: t.route.destinationCity,
          distanceKm: t.route.distanceKm,
          estimatedHours: t.route.estimatedHours,
          boardingPoints,
          droppingPoints
        },
        inventory: {
          totalSeats,
          bookedSeats,
          availableSeats,
          occupancyPercentage: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0
        }
      };
    });

    // Filter by departure time window if specified
    if (params.timeWindow) {
      mapped = mapped.filter(t => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        if (params.timeWindow === 'morning') return hour >= 6 && hour < 12;
        if (params.timeWindow === 'afternoon') return hour >= 12 && hour < 18;
        if (params.timeWindow === 'evening') return hour >= 18 && hour < 23;
        if (params.timeWindow === 'night') return hour >= 23 || hour < 6;
        return true;
      });
    }

    // Apply sorting
    if (params.sortBy) {
      if (params.sortBy === 'price_asc') {
        mapped.sort((a, b) => a.baseFare - b.baseFare);
      } else if (params.sortBy === 'price_desc') {
        mapped.sort((a, b) => b.baseFare - a.baseFare);
      } else if (params.sortBy === 'rating_desc') {
        mapped.sort((a, b) => (b.bus.operator.rating || 0) - (a.bus.operator.rating || 0));
      } else if (params.sortBy === 'time_asc') {
        mapped.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      } else if (params.sortBy === 'duration_asc') {
        mapped.sort((a, b) => a.route.estimatedHours - b.route.estimatedHours);
      }
    }

    return mapped;
  }

  static async getTripDetails(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: {
          include: {
            stops: {
              orderBy: { sequenceOrder: 'asc' }
            }
          }
        },
        bus: {
          include: {
            operator: true
          }
        },
        seats: {
          orderBy: { seatNumber: 'asc' }
        }
      }
    });

    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const totalSeats = trip.seats.length;
    const bookedSeats = trip.seats.filter(s => s.isBooked).length;
    const availableSeats = totalSeats - bookedSeats;

    const lowerDeck = trip.seats.filter(s => s.deck === 'LOWER');
    const upperDeck = trip.seats.filter(s => s.deck === 'UPPER');

    return {
      ...trip,
      inventory: {
        totalSeats,
        bookedSeats,
        availableSeats,
        occupancyPercentage: totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0
      },
      seatMap: {
        layoutType: trip.bus.layoutType,
        lowerDeck,
        upperDeck
      }
    };
  }

  static async createTrip(data: {
    routeId: string;
    busId: string;
    travelDate: string;
    departureTime: string;
    arrivalTime: string;
    baseFare: number;
  }) {
    // Verify bus and route exist
    const bus = await prisma.bus.findUnique({ where: { id: data.busId } });
    if (!bus) throw new AppError('Bus not found', 404);

    const route = await prisma.route.findUnique({ where: { id: data.routeId } });
    if (!route) throw new AppError('Route not found', 404);

    // Create trip and its seats in a transaction
    return await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          routeId: data.routeId,
          busId: data.busId,
          travelDate: data.travelDate,
          departureTime: data.departureTime,
          arrivalTime: data.arrivalTime,
          baseFare: data.baseFare,
          status: 'SCHEDULED'
        }
      });

      // Generate seat inventory based on bus type
      const seats: Array<{ seatNumber: string; deck: string; seatType: string }> = [];
      if (bus.busType === 'AC_SLEEPER') {
        const half = Math.floor(bus.totalSeats / 2);
        for (let i = 1; i <= half; i++) {
          seats.push({ seatNumber: `L${i}`, deck: 'LOWER', seatType: 'SLEEPER' });
          seats.push({ seatNumber: `U${i}`, deck: 'UPPER', seatType: 'SLEEPER' });
        }
      } else {
        const cols = ['A', 'B', 'C', 'D'];
        const rows = Math.ceil(bus.totalSeats / 4);
        let count = 0;
        for (let r = 1; r <= rows; r++) {
          for (const col of cols) {
            if (count < bus.totalSeats) {
              seats.push({ seatNumber: `${r}${col}`, deck: 'LOWER', seatType: 'SEATER' });
              count++;
            }
          }
        }
      }

      await tx.tripSeat.createMany({
        data: seats.map(s => ({
          tripId: trip.id,
          seatNumber: s.seatNumber,
          deck: s.deck,
          seatType: s.seatType,
          isBooked: false
        }))
      });

      return trip;
    });
  }
}
