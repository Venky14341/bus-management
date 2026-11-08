import { prisma } from '../db';
import { AppError } from '../middlewares/error.middleware';

export class CancellationService {
  /**
   * Calculates the refund breakdown according to configured cancellation rules
   */
  static async calculateRefund(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: {
          include: { bus: true, route: true }
        },
        passengers: true
      }
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status === 'CANCELLED') {
      throw new AppError('This booking is already cancelled', 400);
    }

    // Parse departure date and time
    // travelDate: "YYYY-MM-DD", departureTime: "HH:mm"
    const [depHours, depMins] = booking.trip.departureTime.split(':').map(Number);
    const departureDate = new Date(booking.trip.travelDate);
    departureDate.setHours(depHours, depMins, 0, 0);

    const now = new Date();
    const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Fetch active cancellation rules
    const rules = await prisma.cancellationRule.findMany({
      where: { active: true },
      orderBy: { minHoursBeforeDeparture: 'desc' }
    });

    let matchedRule = null;
    for (const rule of rules) {
      if (hoursUntilDeparture >= rule.minHoursBeforeDeparture) {
        if (rule.maxHoursBeforeDeparture === null || hoursUntilDeparture < rule.maxHoursBeforeDeparture) {
          matchedRule = rule;
          break;
        }
      }
    }

    // Default if no rule matched or departure already passed
    let refundPercentage = 0;
    let cancellationFeePercentage = 100;
    let ruleName = 'No Refund Window';

    if (hoursUntilDeparture <= 0) {
      refundPercentage = 0;
      cancellationFeePercentage = 100;
      ruleName = 'Trip already departed';
    } else if (matchedRule) {
      refundPercentage = matchedRule.refundPercentage;
      cancellationFeePercentage = matchedRule.cancellationFeePercentage;
      ruleName = matchedRule.name;
    }

    const refundAmount = Math.round(((booking.totalAmount * refundPercentage) / 100) * 100) / 100;
    const cancellationFee = Math.round(((booking.totalAmount * cancellationFeePercentage) / 100) * 100) / 100;

    return {
      bookingId: booking.id,
      pnr: booking.pnr,
      totalAmount: booking.totalAmount,
      hoursUntilDeparture: Math.round(hoursUntilDeparture * 10) / 10,
      appliedRule: ruleName,
      refundPercentage,
      cancellationFeePercentage,
      refundAmount,
      cancellationFee,
      departureTime: `${booking.trip.travelDate} ${booking.trip.departureTime}`
    };
  }

  /**
   * Executes atomic cancellation, releases seats back to inventory, and simulates refund
   */
  static async cancelBooking(bookingId: string, actorId: string, reason?: string) {
    const refundCalc = await this.calculateRefund(bookingId);

    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { passengers: true, trip: true, user: true }
      });

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.status === 'CANCELLED') {
        throw new AppError('Booking is already cancelled', 400);
      }

      const passengerSeats = booking.passengers.map(p => p.seatNumber);

      // 1. Release seats back to available inventory
      await tx.tripSeat.updateMany({
        where: {
          tripId: booking.tripId,
          seatNumber: { in: passengerSeats }
        },
        data: {
          isBooked: false,
          currentBookingId: null
        }
      });

      // 2. Update booking status and refund details
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          paymentStatus: refundCalc.refundAmount > 0 ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundAmount: refundCalc.refundAmount,
          cancellationFee: refundCalc.cancellationFee,
          cancelledAt: new Date(),
          cancellationReason: reason || 'Customer requested cancellation'
        },
        include: {
          passengers: true,
          trip: {
            include: {
              bus: { include: { operator: true } },
              route: true
            }
          }
        }
      });

      // 3. Create AuditLog entry
      await tx.auditLog.create({
        data: {
          actorId,
          actorRole: booking.user.role || 'PASSENGER',
          actorEmail: booking.user.email,
          action: 'BOOKING_CANCELLED',
          entityType: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            pnr: booking.pnr,
            releasedSeats: passengerSeats,
            refundAmount: refundCalc.refundAmount,
            cancellationFee: refundCalc.cancellationFee,
            appliedRule: refundCalc.appliedRule,
            reason: reason || 'Customer requested cancellation'
          })
        }
      });

      return {
        booking: updatedBooking,
        refundSummary: refundCalc
      };
    });
  }

  static async listCancellationRules() {
    return await prisma.cancellationRule.findMany({
      orderBy: { minHoursBeforeDeparture: 'desc' }
    });
  }

  static async updateCancellationRule(id: string, data: {
    name?: string;
    minHoursBeforeDeparture?: number;
    maxHoursBeforeDeparture?: number | null;
    refundPercentage?: number;
    cancellationFeePercentage?: number;
    active?: boolean;
  }) {
    const existing = await prisma.cancellationRule.findUnique({ where: { id } });
    if (!existing) throw new AppError('Cancellation rule not found', 404);

    return await prisma.cancellationRule.update({
      where: { id },
      data
    });
  }
}
