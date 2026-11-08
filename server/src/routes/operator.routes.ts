import { Router } from 'express';
import {
  OperatorController,
  createOperatorSchema,
  createBusSchema,
  createRouteSchema
} from '../controllers/operator.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Operators list & create
router.get('/', OperatorController.listOperators);
router.post(
  '/',
  authenticate,
  requireRole(['ADMIN']),
  validate(createOperatorSchema),
  OperatorController.createOperator
);

// Buses list & register
router.get('/buses', authenticate, requireRole(['ADMIN', 'OPERATOR']), OperatorController.listBuses);
router.post(
  '/buses',
  authenticate,
  requireRole(['ADMIN', 'OPERATOR']),
  validate(createBusSchema),
  OperatorController.createBus
);

// Routes list & create
router.get('/routes', OperatorController.listRoutes);
router.post(
  '/routes',
  authenticate,
  requireRole(['ADMIN']),
  validate(createRouteSchema),
  OperatorController.createRoute
);

// Operator Trips management
router.get('/trips', authenticate, requireRole(['ADMIN', 'OPERATOR']), OperatorController.listTrips);
router.patch(
  '/trips/:tripId/status',
  authenticate,
  requireRole(['ADMIN', 'OPERATOR']),
  OperatorController.updateTripStatus
);

export default router;
