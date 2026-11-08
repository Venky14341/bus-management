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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cancel Ticket & Calculate Refund
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {isLoadingPreview ? (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Applying cancellation policy rules...</span>
            </div>
          ) : preview ? (
            <form onSubmit={handleConfirmCancel} className="space-y-4">
              {/* Trip & PNR Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">PNR Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{booking.pnr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Route:</span>
                  <span className="font-bold text-slate-800">
                    {booking.trip.route.sourceCity} → {booking.trip.route.destinationCity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Departure Schedule:</span>
                  <span className="font-semibold text-slate-700">{preview.departureTime}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Hours until departure:
                  </span>
                  <span className="font-bold text-amber-700">{preview.hoursUntilDeparture} hrs</span>
                </div>
              </div>

              {/* Refund Breakdown Box */}
              <div className="p-4 border-2 border-rose-100 rounded-xl bg-gradient-to-br from-rose-50/40 to-slate-50 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Applied Rule:</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                    {preview.appliedRule}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Gross Ticket Value</span>
                  <span className="font-bold text-slate-800">₹{preview.totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-xs text-rose-600">
                  <span>Cancellation Fee ({preview.cancellationFeePercentage}%)</span>
                  <span className="font-bold">-₹{preview.cancellationFee.toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t border-rose-200 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-900">
                    Net Simulated Refund ({preview.refundPercentage}%)
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    ₹{preview.refundAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Cancellation Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="Change of schedule / plan">Change of schedule / plan</option>
                  <option value="Emergency medical reason">Emergency medical reason</option>
                  <option value="Booking error / duplicate booking">Booking error / duplicate booking</option>
                  <option value="Travelled by alternate transport">Travelled by alternate transport</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Confirming cancellation will immediately release your reserved seat(s) back into public inventory for other passengers.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Confirm & Release Seats</span>
                  )}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};
