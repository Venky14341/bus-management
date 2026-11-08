import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OperatorService } from '../services/operator.service';

export const createOperatorSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(10),
    contactEmail: z.string().email(),
    contactPhone: z.string().min(5),
    address: z.string().optional()
  })
});

export const createBusSchema = z.object({
  body: z.object({
    operatorId: z.string().min(1),
    busNumber: z.string().min(3),
    model: z.string().min(2),
    busType: z.enum(['AC_SLEEPER', 'AC_SEATER', 'NON_AC_SEATER', 'LUXURY_MULTI_AXLE']),
    totalSeats: z.number().int().min(10).max(60),
    layoutType: z.string().optional(),
    hasWifi: z.boolean().optional(),
    hasCharging: z.boolean().optional(),
    hasWaterBottle: z.boolean().optional()
  })
});

export const createRouteSchema = z.object({
  body: z.object({
    sourceCity: z.string().min(2),
    destinationCity: z.string().min(2),
    distanceKm: z.number().positive(),
    estimatedHours: z.number().positive(),
    stops: z.array(
      z.object({
        stopName: z.string().min(1),
        stopType: z.enum(['BOARDING', 'DROPPING', 'BOTH']),
        sequenceOrder: z.number().int(),
        offsetMinutes: z.number().int().nonnegative()
      })
    ).optional()
  })
});

export class OperatorController {
  static async listOperators(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OperatorService.listOperators();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createOperator(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OperatorService.createOperator(req.body);
      return res.status(201).json({ success: true, message: 'Operator created', data });
    } catch (error) {
      next(error);
    }
  }

  static async listBuses(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorId = req.user?.role === 'OPERATOR' ? req.user.operatorId || undefined : undefined;
      const data = await OperatorService.listBuses(operatorId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createBus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OperatorService.createBus(req.body);
      return res.status(201).json({ success: true, message: 'Bus registered', data });
    } catch (error) {
      next(error);
    }
  }

  static async listRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OperatorService.listRoutes();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OperatorService.createRoute(req.body);
      return res.status(201).json({ success: true, message: 'Route created', data });
    } catch (error) {
      next(error);
    }
  }

  static async listTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorId = req.user?.role === 'OPERATOR' ? req.user.operatorId || undefined : undefined;
      const data = await OperatorService.listOperatorTrips(operatorId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateTripStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId } = req.params;
      const { status } = req.body;
      const data = await OperatorService.updateTripStatus(tripId, status, req.user!.id);
      return res.status(200).json({ success: true, message: 'Trip status updated', data });
    } catch (error) {
      next(error);
    }
  }
}
