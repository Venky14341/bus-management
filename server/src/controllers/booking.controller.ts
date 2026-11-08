import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BookingService } from '../services/booking.service';

export const createBookingSchema = z.object({
  body: z.object({
    tripId: z.string().min(1, 'Trip ID is required'),
    boardingPoint: z.string().min(1, 'Boarding point is required'),
    droppingPoint: z.string().min(1, 'Dropping point is required'),
    passengers: z.array(
      z.object({
        seatNumber: z.string().min(1, 'Seat number is required'),
        name: z.string().min(1, 'Passenger name is required'),
        age: z.number().int().min(1).max(120, 'Age must be between 1 and 120'),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER'])
      })
    ).min(1, 'At least one passenger must be selected')
  })
});

export class BookingController {
  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await BookingService.createBooking({
        userId: req.user!.id,
        tripId: req.body.tripId,
        boardingPoint: req.body.boardingPoint,
        droppingPoint: req.body.droppingPoint,
        passengers: req.body.passengers
      });

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBookingByPnr(req: Request, res: Response, next: NextFunction) {
    try {
      const { pnr } = req.params;
      const booking = await BookingService.getBookingByPnr(pnr);
      return res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const bookings = await BookingService.getUserBookings(req.user!.id);
      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await BookingService.getAllBookings({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
