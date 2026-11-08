import { Router } from 'express';
import {
  CancellationController,
  cancelBookingSchema,
  updateRuleSchema
} from '../controllers/cancellation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Preview refund before cancelling
router.get('/preview/:bookingId', authenticate, CancellationController.getRefundPreview);

// Execute cancellation
router.post(
  '/:bookingId',
  authenticate,
  validate(cancelBookingSchema),
  CancellationController.cancelBooking
);

// View cancellation rules
router.get('/rules', CancellationController.getRules);

// Admin updates cancellation rule
router.put(
  '/rules/:id',
  authenticate,
  requireRole(['ADMIN']),
  validate(updateRuleSchema),
  CancellationController.updateRule
);

export default router;
