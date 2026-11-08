import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TripService } from '../services/trip.service';

export const createTripSchema = z.object({
  body: z.object({
    routeId: z.string().min(1, 'Route ID is required'),
    busId: z.string().min(1, 'Bus ID is required'),
    travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
    departureTime: z.string().regex(/^\d{2}:\d{2}$/, 'Departure time must be in HH:mm format'),
    arrivalTime: z.string().regex(/^\d{2}:\d{2}$/, 'Arrival time must be in HH:mm format'),
    baseFare: z.number().positive('Base fare must be positive')
  })
});

export class TripController {
  static async searchTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        origin,
        destination,
        travelDate,
        busType,
        operatorId,
        minPrice,
        maxPrice,
        timeWindow,
        sortBy
      } = req.query;

      const trips = await TripService.searchTrips({
        origin: origin ? String(origin) : undefined,
        destination: destination ? String(destination) : undefined,
        travelDate: travelDate ? String(travelDate) : undefined,
        busType: busType ? String(busType) : undefined,
        operatorId: operatorId ? String(operatorId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        timeWindow: timeWindow ? String(timeWindow) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined
      });

      return res.status(200).json({
        success: true,
        count: trips.length,
        data: trips
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTripDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trip = await TripService.getTripDetails(id);
      return res.status(200).json({
        success: true,
        data: trip
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.createTrip(req.body);
      return res.status(201).json({
        success: true,
        message: 'Trip scheduled successfully',
        data: trip
      });
    } catch (error) {
      next(error);
    }
  }
}
