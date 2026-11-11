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
  XCircle,
  Bus,
  ArrowRight
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
      setSearchPnr('');
    } catch (err: any) {
      setPnrSearchError(err.response?.data?.message || 'PNR not found. Please check and try again.');
    } finally {
      setIsSearchingPnr(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header & PNR Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            <span>Traveler Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101828]">
            My Bookings & E-Tickets
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            View active reservations, download e-tickets, and manage cancellations
          </p>
        </div>

        {/* PNR Search Form */}
        <form onSubmit={handlePnrSearch} className="w-full md:w-auto">
          <div className="flex items-center bg-[#F7F9FC] border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-600">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search PNR (e.g. ALG-984021)"
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value)}
              className="text-xs font-bold text-[#101828] bg-transparent focus:outline-none w-48 sm:w-60 uppercase"
            />
            <button
              type="submit"
              disabled={isSearchingPnr || !searchPnr.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
            >
              {isSearchingPnr ? 'Searching...' : 'Find Ticket'}
            </button>
          </div>
          {pnrSearchError && (
            <p className="text-[11px] font-bold text-red-600 mt-1.5">{pnrSearchError}</p>
          )}
        </form>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-center text-xs text-red-600 font-bold">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-[#101828]">No reservations on file</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any booked trips under your account yet. Use the search tool to book your first journey!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Card Top: PNR & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">PNR:</span>
                    <span className="font-mono text-base font-black text-blue-600 tracking-wider">
                      {booking.pnr}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold">Total Fare:</span>
                    <span className="text-lg font-black text-[#101828] ml-2">
                      ₹{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Route & Timings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <div className="text-xs font-extrabold text-[#101828]">
                      {booking.trip.bus?.operator?.name || 'Bus Operator'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      {booking.trip.bus?.model} • {booking.trip.bus?.busNumber}
                    </div>
                  </div>

                  <div className="text-left sm:text-center">
                    <div className="text-sm font-black text-[#101828]">
                      {booking.trip.route?.sourceCity} ➔ {booking.trip.route?.destinationCity}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-start sm:justify-center gap-2 mt-0.5">
                      <span>{booking.trip.travelDate}</span>
                      <span>•</span>
                      <span className="font-bold text-[#FF8A3D]">
                        {booking.trip.departureTime} - {booking.trip.arrivalTime}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-slate-500">Seats Booked:</div>
                    <div className="text-sm font-black text-blue-600">
                      {booking.passengers.map((p) => p.seatNumber).join(', ')}
                    </div>
                  </div>
                </div>

                {/* Boarding and Dropping Stops */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F7F9FC] rounded-2xl text-xs">
                  <div>
                    <span className="font-bold text-slate-500">Pickup Point: </span>
                    <span className="font-extrabold text-[#101828]">{booking.boardingPoint}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Drop-off Point: </span>
                    <span className="font-extrabold text-[#101828]">{booking.droppingPoint}</span>
                  </div>
                </div>

                {/* Actions: View E-Ticket & Cancel Ticket */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(booking)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View / Print E-Ticket</span>
                  </button>

                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setCancellingBooking(booking)}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Cancel Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
          onCancellationSuccess={() => {
            setCancellingBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
