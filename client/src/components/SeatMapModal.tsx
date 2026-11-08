import React, { useState } from 'react';
import { Trip, TripSeat, Passenger } from '../types';
import { api } from '../services/api';
import { X, Check, AlertCircle, User, Compass, Coffee, Wifi, BatteryCharging } from 'lucide-react';

interface SeatMapModalProps {
  trip: Trip;
  onClose: () => void;
  onBookingSuccess: (booking: any) => void;
}

export const SeatMapModal: React.FC<SeatMapModalProps> = ({
  trip,
  onClose,
  onBookingSuccess
}) => {
  const isSleeper = trip.bus.busType === 'AC_SLEEPER';
  const [activeDeck, setActiveDeck] = useState<'LOWER' | 'UPPER'>('LOWER');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, Passenger>>({});
  
  const boardingPoints = trip.route.boardingPoints || [];
  const droppingPoints = trip.route.droppingPoints || [];

  const [selectedBoarding, setSelectedBoarding] = useState<string>(
    boardingPoints[0]?.stopName || 'Main Departure Terminal'
  );
  const [selectedDropping, setSelectedDropping] = useState<string>(
    droppingPoints[0]?.stopName || 'Main Arrival Station'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter seats for the active deck
  const lowerSeats = trip.seatMap?.lowerDeck || [];
  const upperSeats = trip.seatMap?.upperDeck || [];
  const currentDeckSeats = activeDeck === 'LOWER' ? lowerSeats : upperSeats;

  // Toggle seat selection
  const handleSeatClick = (seat: TripSeat) => {
    if (seat.isBooked) return;

    setErrorMessage(null);
    const seatNum = seat.seatNumber;

    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
      const nextPassengers = { ...passengers };
      delete nextPassengers[seatNum];
      setPassengers(nextPassengers);
    } else {
      if (selectedSeats.length >= 6) {
        setErrorMessage('Maximum 6 seats can be booked in a single reservation.');
        return;
      }
      setSelectedSeats(prev => [...prev, seatNum]);
      setPassengers(prev => ({
        ...prev,
        [seatNum]: {
          seatNumber: seatNum,
          name: '',
          age: 28,
          gender: 'MALE'
        }
      }));
    }
  };

  const handlePassengerChange = (seatNum: string, field: keyof Passenger, value: any) => {
    setPassengers(prev => ({
      ...prev,
      [seatNum]: {
        ...prev[seatNum],
        [field]: value
      }
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat to proceed.');
      return;
    }

    // Validate passenger names
    for (const seatNum of selectedSeats) {
      const p = passengers[seatNum];
      if (!p || !p.name.trim()) {
        setErrorMessage(`Please enter passenger name for seat ${seatNum}.`);
        return;
      }
      if (!p.age || p.age < 1 || p.age > 120) {
        setErrorMessage(`Please enter a valid age (1-120) for passenger on seat ${seatNum}.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        tripId: trip.id,
        boardingPoint: selectedBoarding,
        droppingPoint: selectedDropping,
        passengers: selectedSeats.map(seatNum => passengers[seatNum])
      };

      const res = await api.post('/bookings', payload);
      onBookingSuccess(res.data.data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to confirm booking. One of your selected seats may have been taken.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = trip.baseFare * selectedSeats.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {trip.bus.operator?.name || 'Bus Operator'}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                {trip.bus.busType.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {trip.route.sourceCity} → {trip.route.destinationCity} • {trip.travelDate} ({trip.departureTime} - {trip.arrivalTime})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Content Body: Two columns (Left: Visual Bus Layout, Right: Passenger Details & Summary) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Seat Map */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Deck Switcher for Sleeper */}
            {isSleeper && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-4 border border-slate-200 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => setActiveDeck('LOWER')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeDeck === 'LOWER'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Lower Deck ({lowerSeats.filter(s => !s.isBooked).length} Free)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeck('UPPER')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeDeck === 'UPPER'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Upper Deck ({upperSeats.filter(s => !s.isBooked).length} Free)
                </button>
              </div>
            )}

            {/* Bus Cabin Box */}
            <div className="w-full max-w-sm bg-slate-50/70 border-2 border-slate-300 rounded-3xl p-5 shadow-inner relative">
              {/* Bus Front Steering & Driver Indicator */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-300 mb-5 text-slate-400">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                  Front / Cabin
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-slate-200/70 rounded-full text-slate-600">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Driver</span>
                </div>
              </div>

              {/* Grid of Seats */}
              {isSleeper ? (
                // Sleeper Layout: 2 Berths on Left, 1 Berth on Right (or vice versa)
                <div className="grid grid-cols-3 gap-3">
                  {currentDeckSeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={seat.isBooked}
                        onClick={() => handleSeatClick(seat)}
                        className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center p-2 text-xs font-bold transition-all relative ${
                          seat.isBooked
                            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-rose-600 border-rose-700 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400 ring-offset-1'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-rose-400 hover:bg-rose-50/50'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-semibold opacity-80">
                          {seat.deck.charAt(0)}
                        </div>
                        <div className="text-sm font-extrabold">{seat.seatNumber}</div>
                        <div className="text-[10px] mt-1 font-medium">
                          {seat.isBooked ? 'Booked' : isSelected ? 'Selected' : `₹${trip.baseFare}`}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-white text-rose-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Seater 2+2 layout
                <div className="grid grid-cols-4 gap-2.5">
                  {currentDeckSeats.map((seat, idx) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isAisleGap = idx % 4 === 1; // gap after 2nd column
                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          type="button"
                          disabled={seat.isBooked}
                          onClick={() => handleSeatClick(seat)}
                          className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                            seat.isBooked
                              ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-rose-600 border-rose-700 text-white shadow-md shadow-rose-600/30'
                              : 'bg-white border-slate-300 text-slate-700 hover:border-rose-400 hover:bg-rose-50/50'
                          }`}
                        >
                          <span className="text-xs font-extrabold">{seat.seatNumber}</span>
                          <span className="text-[9px] font-medium opacity-80">
                            {seat.isBooked ? 'Taken' : `₹${trip.baseFare}`}
                          </span>
                        </button>
                        {isAisleGap && <div className="hidden" />}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-around text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-white border-2 border-slate-300" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-rose-600 border-2 border-rose-700" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-slate-200 border-2 border-slate-300" />
                  <span>Booked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Boarding, Dropping & Passenger Information */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <form onSubmit={handleBookingSubmit} className="space-y-5">
              {/* Boarding and Dropping Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Boarding Point
                  </label>
                  <select
                    value={selectedBoarding}
                    onChange={(e) => setSelectedBoarding(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {boardingPoints.map((bp) => (
                      <option key={bp.id} value={bp.stopName}>
                        {bp.stopName} (+{bp.offsetMinutes}m)
                      </option>
                    ))}
                    {boardingPoints.length === 0 && (
                      <option value="Main Boarding Station">Main Boarding Station</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dropping Point
                  </label>
                  <select
                    value={selectedDropping}
                    onChange={(e) => setSelectedDropping(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {droppingPoints.map((dp) => (
                      <option key={dp.id} value={dp.stopName}>
                        {dp.stopName} (+{dp.offsetMinutes}m)
                      </option>
                    ))}
                    {droppingPoints.length === 0 && (
                      <option value="Main Dropping Station">Main Dropping Station</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Passenger Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Passenger Details {selectedSeats.length > 0 && `(${selectedSeats.length} Seats)`}
                </label>

                {selectedSeats.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">Select seats from the layout to enter passenger details.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {selectedSeats.map((seatNum) => {
                      const passenger = passengers[seatNum] || {
                        seatNumber: seatNum,
                        name: '',
                        age: 28,
                        gender: 'MALE'
                      };

                      return (
                        <div
                          key={seatNum}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-800">
                              Seat <span className="text-rose-600">{seatNum}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold">
                              Fare: ₹{trip.baseFare}
                            </span>
                          </div>

                          <div className="grid grid-cols-12 gap-2">
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={passenger.name}
                              onChange={(e) =>
                                handlePassengerChange(seatNum, 'name', e.target.value)
                              }
                              className="col-span-6 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                              required
                            />

                            <input
                              type="number"
                              placeholder="Age"
                              min={1}
                              max={120}
                              value={passenger.age}
                              onChange={(e) =>
                                handlePassengerChange(seatNum, 'age', Number(e.target.value))
                              }
                              className="col-span-2 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-rose-500 focus:outline-none"
                              required
                            />

                            <select
                              value={passenger.gender}
                              onChange={(e) =>
                                handlePassengerChange(seatNum, 'gender', e.target.value)
                              }
                              className="col-span-4 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                            >
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price Breakdown & Confirm CTA */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Selected Seats</span>
                  <span className="font-bold text-slate-800">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800">Total Payable Fare</span>
                  <span className="text-xl font-extrabold text-rose-600">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || selectedSeats.length === 0}
                  className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Confirm & Book (₹{totalAmount.toLocaleString()})</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
