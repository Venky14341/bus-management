import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CancellationService } from '../services/cancellation.service';

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().optional()
  })
});

export const updateRuleSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    minHoursBeforeDeparture: z.number().int().nonnegative().optional(),
    maxHoursBeforeDeparture: z.number().int().positive().nullable().optional(),
    refundPercentage: z.number().min(0).max(100).optional(),
    cancellationFeePercentage: z.number().min(0).max(100).optional(),
    active: z.boolean().optional()
  })
});

export class CancellationController {
  static async getRefundPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const preview = await CancellationService.calculateRefund(bookingId);
      return res.status(200).json({
        success: true,
        data: preview
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const result = await CancellationService.cancelBooking(
        bookingId,
        req.user!.id,
        req.body?.reason
      );

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully and refund processed',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRules(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = await CancellationService.listCancellationRules();
      return res.status(200).json({
        success: true,
        data: rules
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await CancellationService.updateCancellationRule(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Cancellation rule updated',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
