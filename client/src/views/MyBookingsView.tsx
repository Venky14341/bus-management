import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TicketModal } from '../components/TicketModal';
import { CancelModal } from '../components/CancelModal';
import {
  Ticket,
  Search,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const MyBookingsView: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PNR Search input
  const [searchPnr, setSearchPnr] = useState('');
  const [pnrSearchError, setPnrSearchError] = useState<string | null>(null);
  const [isSearchingPnr, setIsSearchingPnr] = useState(false);

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handlePnrSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPnr.trim()) return;

    setIsSearchingPnr(true);
    setPnrSearchError(null);
    try {
      const res = await api.get(`/bookings/pnr/${searchPnr.trim()}`);
      setSelectedTicket(res.data.data);
    } catch (err: any) {
      setPnrSearchError(err.response?.data?.message || `PNR '${searchPnr}' not found.`);
    } finally {
      setIsSearchingPnr(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & PNR Search */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Bookings & Tickets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-bold text-slate-800">{user?.name}</span> ({user?.email})
          </p>
        </div>

        {/* PNR Quick Search Form */}
        <form onSubmit={handlePnrSearch} className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Enter PNR (e.g. ALG-984021)"
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value.toUpperCase())}
              className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 uppercase focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingPnr || !searchPnr.trim()}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            {isSearchingPnr ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Ticket</span>
              </>
            )}
          </button>
        </form>
      </div>

      {pnrSearchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{pnrSearchError}</span>
        </div>
      )}

      {/* Bookings List */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-4 px-1">
          Booking History ({bookings.length})
        </h2>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Retrieving your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <Ticket className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No Bookings Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't booked any bus trips yet. Go to Search & Book to reserve seats!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';
              const isCancelled = booking.status === 'CANCELLED';

              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                    isCancelled ? 'border-rose-200 bg-rose-50/20 opacity-80' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-base text-rose-600">
                        {booking.pnr}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="text-xs text-slate-400">Total:</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Route & Passenger Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Route & Schedule
                      </span>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {booking.trip.route.sourceCity} → {booking.trip.route.destinationCity}
                      </div>
                      <div className="text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{booking.trip.travelDate} ({booking.trip.departureTime})</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Boarding & Dropping Points
                      </span>
                      <div className="text-slate-700 font-medium">From: {booking.boardingPoint}</div>
                      <div className="text-slate-700 font-medium">To: {booking.droppingPoint}</div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Passengers & Seats ({booking.passengers.length})
                      </span>
                      <div className="font-bold text-slate-800">
                        Seats: {booking.passengers.map((p) => p.seatNumber).join(', ')}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate">
                        {booking.passengers.map((p) => p.name).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation info if cancelled */}
                  {isCancelled && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs flex items-center justify-between">
                      <div className="text-rose-800 font-medium">
                        Cancelled on {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleString() : 'N/A'}.
                        Reason: {booking.cancellationReason || 'User requested'}
                      </div>
                      <div className="font-bold text-emerald-700">
                        Refund: ₹{booking.refundAmount.toLocaleString()} (Fee: ₹
                        {booking.cancellationFee.toLocaleString()})
                      </div>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(booking)}
                      className="py-1.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View E-Ticket</span>
                    </button>

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setCancellingBooking(booking)}
                        className="py-1.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Cancel Modal */}
      {cancellingBooking && (
        <CancelModal
          booking={cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          onCancellationSuccess={(updatedBooking) => {
            setCancellingBooking(null);
            fetchBookings(); // Refresh list
          }}
        />
      )}
    </div>
  );
};
