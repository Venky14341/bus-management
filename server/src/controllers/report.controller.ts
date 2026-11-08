import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  static async getManifest(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId } = req.params;
      const manifest = await ReportService.getPassengerManifest(tripId);
      return res.status(200).json({
        success: true,
        data: manifest
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorId = req.user?.role === 'OPERATOR' ? req.user.operatorId || undefined : undefined;
      const data = await ReportService.getDashboardMetrics(operatorId);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, action, page, limit } = req.query;
      const data = await ReportService.getAuditLogs({
        entityType: entityType ? String(entityType) : undefined,
        action: action ? String(action) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 30
      });
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}
