import React, { useState, useEffect } from 'react';
import { Booking, RefundPreview } from '../types';
import { api } from '../services/api';
import { X, AlertTriangle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

interface CancelModalProps {
  booking: Booking;
  onClose: () => void;
  onCancellationSuccess: (updatedBooking: Booking) => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  booking,
  onClose,
  onCancellationSuccess
}) => {
  const [preview, setPreview] = useState<RefundPreview | null>(null);
  const [reason, setReason] = useState('Change of schedule / plan');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await api.get(`/cancellations/preview/${booking.id}`);
        setPreview(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load refund preview');
      } finally {
        setIsLoadingPreview(false);
      }
    }

    fetchPreview();
  }, [booking.id]);

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/cancellations/${booking.id}`, { reason });
      onCancellationSuccess(res.data.data.booking);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-red-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-extrabold text-[#101828]">
              Cancel Ticket & Calculate Refund
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#101828] rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Booking Mini Summary */}
          <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-slate-500">PNR Reference</span>
              <span className="font-mono text-blue-600">{booking.pnr}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-500">Route</span>
              <span className="text-[#101828]">
                {booking.trip.route?.sourceCity} ➔ {booking.trip.route?.destinationCity}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-500">Seats</span>
              <span className="text-[#101828]">{booking.passengers.map((p) => p.seatNumber).join(', ')}</span>
            </div>
          </div>

          {/* Refund Calculation Breakdown */}
          {isLoadingPreview ? (
            <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
              Calculating tiered refund policy based on scheduled departure...
            </div>
          ) : preview ? (
            <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>Departure in {preview.hoursUntilDeparture?.toFixed(1) || '0'} hours</span>
                </span>
                <span className="text-blue-600 font-extrabold">{preview.appliedRule}</span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Total Amount Paid</span>
                  <span>₹{preview.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Cancellation Fee ({preview.cancellationFeePercentage}%)</span>
                  <span>-₹{preview.cancellationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-600 pt-2 border-t border-slate-200">
                  <span>Estimated Refund Amount</span>
                  <span className="text-xl">₹{preview.refundAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Cancellation Form */}
          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#101828]">
                Reason for Cancellation
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs font-semibold bg-[#F7F9FC] border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Change of schedule / plan">Change of schedule / plan</option>
                <option value="Found alternative transport">Found alternative transport</option>
                <option value="Health or personal emergency">Health or personal emergency</option>
                <option value="Booked wrong bus or date">Booked wrong bus or date</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Keep Booking
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingPreview}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-extrabold shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Confirm Cancellation & Refund</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
