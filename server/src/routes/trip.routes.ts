import { Router } from 'express';
import { TripController, createTripSchema } from '../controllers/trip.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Public search and trip details
router.get('/search', TripController.searchTrips);
router.get('/:id', TripController.getTripDetails);

// Operator & Admin can schedule new trips
router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'OPERATOR']),
  validate(createTripSchema),
  TripController.createTrip
);

export default router;
