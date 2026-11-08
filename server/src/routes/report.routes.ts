import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Passenger manifest with mathematical reconciliation
router.get(
  '/manifest/:tripId',
  authenticate,
  requireRole(['ADMIN', 'OPERATOR']),
  ReportController.getManifest
);

// Dashboard metrics
router.get(
  '/dashboard',
  authenticate,
  requireRole(['ADMIN', 'OPERATOR']),
  ReportController.getDashboard
);

// Audit logs
router.get(
  '/audit-logs',
  authenticate,
  requireRole(['ADMIN', 'OPERATOR']),
  ReportController.getAuditLogs
);

export default router;
