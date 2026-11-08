import { Router } from 'express';
import { BookingController, createBookingSchema } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Passenger / Authenticated user creates a booking
router.post('/', authenticate, validate(createBookingSchema), BookingController.createBooking);

// Passenger views their own bookings
router.get('/my-bookings', authenticate, BookingController.getMyBookings);

// Search booking by unique PNR reference (Public or Authenticated)
router.get('/pnr/:pnr', BookingController.getBookingByPnr);

// Admin & Operator can list all bookings
router.get('/', authenticate, requireRole(['ADMIN', 'OPERATOR']), BookingController.getAllBookings);

export default router;
