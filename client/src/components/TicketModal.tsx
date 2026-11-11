import React from 'react';
import { Booking } from '../types';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  Bus,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ArrowRight
} from 'lucide-react';

interface TicketModalProps {
  booking: Booking;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#F7F9FC] print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#101828]">BusGo Confirmed E-Ticket</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                isCancelled
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
              }`}
            >
              {booking.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-[#101828] hover:text-blue-600 bg-white rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-[#101828] rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <Bus className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#101828]">
                  Bus<span className="text-blue-600">Go</span> Mobility
                </h1>
                <p className="text-xs text-slate-500 font-semibold">Official Confirmed Journey Pass</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">
                PNR Number
              </span>
              <span className="text-xl font-mono font-black text-blue-600 tracking-wider">
                {booking.pnr}
              </span>
            </div>
          </div>

          {/* Cancellation Notice if Cancelled */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <span>Reservation Cancelled</span>
              </div>
              <p>Refund Amount Credited: ₹{booking.refundAmount.toLocaleString()}</p>
              {booking.cancellationReason && (
                <p className="italic">Reason: {booking.cancellationReason}</p>
              )}
            </div>
          )}

          {/* Route & Operator Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#F7F9FC] border border-slate-200">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Fleet Operator & Bus
              </div>
              <div className="text-sm font-extrabold text-[#101828]">
                {booking.trip.bus?.operator?.name || 'Bus Operator'}
              </div>
              <div className="text-xs text-slate-500">
                {booking.trip.bus?.model} ({booking.trip.bus?.busNumber})
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Travel Date
              </div>
              <div className="text-sm font-extrabold text-[#101828]">
                {booking.trip.travelDate}
              </div>
              <div className="text-xs text-[#FF8A3D] font-bold">
                {booking.trip.departureTime} ➔ {booking.trip.arrivalTime}
              </div>
            </div>
          </div>

          {/* Boarding and Dropping Stops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Pickup / Boarding Point</span>
              </div>
              <div className="text-sm font-extrabold text-[#101828]">{booking.boardingPoint}</div>
              <div className="text-xs text-slate-500">
                Departure: <span className="font-bold text-[#101828]">{booking.trip.departureTime}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Drop-off Destination</span>
              </div>
              <div className="text-sm font-extrabold text-[#101828]">{booking.droppingPoint}</div>
              <div className="text-xs text-slate-500">
                Arrival: <span className="font-bold text-[#101828]">{booking.trip.arrivalTime}</span>
              </div>
            </div>
          </div>

          {/* Passenger Table */}
          <div className="space-y-2">
            <div className="text-xs font-black text-[#101828] uppercase tracking-wider">
              Traveler Details ({booking.passengers.length} Passengers)
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9FC] text-slate-500 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Seat</th>
                    <th className="py-2.5 px-4">Passenger Name</th>
                    <th className="py-2.5 px-4">Age / Gender</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {booking.passengers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-black text-blue-600">{p.seatNumber}</td>
                      <td className="py-2.5 px-4 font-bold text-[#101828]">{p.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {p.age} yrs • {p.gender}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                          <CheckCircle className="w-3 h-3" />
                          <span>Confirmed</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Paid & Verification Barcode */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Fare Paid</div>
              <div className="text-2xl font-black text-blue-600">
                ₹{booking.totalAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Transaction (All Inclusive)</span>
              </div>
            </div>

            {/* Realistic Barcode Preview */}
            <div className="text-center">
              <div className="font-mono text-xl tracking-[0.25em] font-black text-slate-800 select-none">
                ||||| | |||| ||| ||||||| |
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                TKT-{booking.pnr.replace('-', '')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 py-3.5 bg-[#F7F9FC] border-t border-slate-200 text-center text-xs text-slate-500 font-medium print:hidden">
          Please arrive at your boarding location at least 15 minutes prior to scheduled departure.
        </div>
      </div>
    </div>
  );
};
