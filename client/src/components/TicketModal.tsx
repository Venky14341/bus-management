import React from 'react';
import { Booking } from '../types';
import { X, Printer, CheckCircle, Bus, Calendar, Clock, MapPin, User, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">E-Ticket / Boarding Pass</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isCancelled
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {booking.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md">
                <Bus className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Algions Bus Express</h1>
                <p className="text-xs text-slate-500 font-medium">Official Journey Confirmation</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                PNR Reference
              </span>
              <span className="text-xl font-mono font-black text-rose-600 tracking-wider">
                {booking.pnr}
              </span>
            </div>
          </div>

          {/* Cancellation Notice if Cancelled */}
          {isCancelled && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-rose-800">Booking Cancelled</div>
              <div className="text-rose-700">
                Refund of ₹{booking.refundAmount.toLocaleString()} processed (Cancellation Fee: ₹
                {booking.cancellationFee.toLocaleString()}).
              </div>
            </div>
          )}

          {/* Journey Route & Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Departure
              </span>
              <div className="text-lg font-black text-slate-900">
                {booking.trip.route.sourceCity}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{booking.boardingPoint}</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{booking.trip.travelDate}</span>
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
                <span>{booking.trip.departureTime}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Destination
              </span>
              <div className="text-lg font-black text-slate-900">
                {booking.trip.route.destinationCity}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{booking.droppingPoint}</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ETA: {booking.trip.arrivalTime}</span>
              </div>
            </div>
          </div>

          {/* Operator & Bus Details */}
          <div className="flex flex-wrap items-center justify-between text-xs py-3 px-4 bg-white border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-400 font-medium">Operator: </span>
              <span className="font-bold text-slate-800">
                {booking.trip.bus.operator?.name || 'Bus Operator'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Bus Model: </span>
              <span className="font-bold text-slate-800">{booking.trip.bus.model}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Registration: </span>
              <span className="font-mono font-bold text-slate-800">
                {booking.trip.bus.busNumber}
              </span>
            </div>
          </div>

          {/* Passenger Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Passenger Manifest Details
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Seat</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Passenger Name</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">Age / Gender</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600">Fare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {booking.passengers.map((p, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-mono font-extrabold text-rose-600">
                        {p.seatNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.age} Yrs • {p.gender}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        ₹{booking.trip.baseFare.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total & Barcode */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified digital boarding pass • Valid ID required during travel</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Total Amount Paid</span>
              <span className="text-xl font-extrabold text-slate-900">
                ₹{booking.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Simulated Barcode */}
          <div className="pt-2 text-center">
            <div className="inline-block tracking-[8px] font-mono font-bold text-slate-400 text-sm select-none">
              ||| ||||| || |||| ||| ||||||| ||| ||||| |||| |||
            </div>
            <p className="text-[10px] text-slate-400 mt-1">PNR: {booking.pnr} • Algions Ticket Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};
