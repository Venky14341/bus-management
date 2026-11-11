import React, { useState, useMemo } from 'react';
import { Trip, TripSeat, Passenger, RouteStop } from '../types';
import { api } from '../services/api';
import { RealBusCabin } from './BusSeatMap/RealBusCabin';
import { SeatViewPOV } from './BusSeatMap/SeatViewPOV';
import { StopPicker } from './BusSeatMap/StopPicker';
import {
  getDefaultBoardingPoints,
  getDefaultDroppingPoints
} from '../utils/routeStopsHelper';
import {
  X,
  AlertCircle,
  User,
  Sparkles,
  Layers,
  Eye,
  CheckCircle2,
  Navigation,
  MapPin,
  Calendar,
  Clock,
  Bus,
  ShieldCheck,
  CreditCard,
  QrCode,
  Tag,
  Check,
  ArrowRight
} from 'lucide-react';

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

  // Active POV Seat to preview in 3D
  const lowerSeats = trip.seatMap?.lowerDeck || [];
  const upperSeats = trip.seatMap?.upperDeck || [];
  const initialSeat = lowerSeats[0] || upperSeats[0] || null;
  const [activePOVSeat, setActivePOVSeat] = useState<TripSeat | null>(initialSeat);

  // Left Column Tab: "BUS_CABIN" vs "POV_VIEW"
  const [leftTab, setLeftTab] = useState<'BUS_CABIN' | 'POV_VIEW'>('BUS_CABIN');

  // Checkout Multi-step: 'DETAILS' | 'PAYMENT'
  const [checkoutStep, setCheckoutStep] = useState<'DETAILS' | 'PAYMENT'>('DETAILS');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoAppliedMsg, setPromoAppliedMsg] = useState<string | null>(null);

  // Contact info
  const [contactEmail, setContactEmail] = useState('traveler@example.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');

  // Robust Boarding & Dropping Points resolution
  const stops = trip.route.stops || [];
  const boardingPoints = useMemo(() => {
    const list =
      trip.route.boardingPoints && trip.route.boardingPoints.length > 0
        ? trip.route.boardingPoints
        : stops.filter((s) => s.stopType === 'BOARDING' || s.stopType === 'BOTH');
    return list.length > 0 ? list : getDefaultBoardingPoints(trip.route.sourceCity);
  }, [trip, stops]);

  const droppingPoints = useMemo(() => {
    const list =
      trip.route.droppingPoints && trip.route.droppingPoints.length > 0
        ? trip.route.droppingPoints
        : stops.filter((s) => s.stopType === 'DROPPING' || s.stopType === 'BOTH');
    return list.length > 0
      ? list
      : getDefaultDroppingPoints(trip.route.destinationCity, trip.route.estimatedHours || 6);
  }, [trip, stops]);

  const [selectedBoarding, setSelectedBoarding] = useState<string>(
    boardingPoints[0]?.stopName || `${trip.route.sourceCity} Central Terminal`
  );
  const [selectedDropping, setSelectedDropping] = useState<string>(
    droppingPoints[0]?.stopName || `${trip.route.destinationCity} Central Station`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentDeckSeats = activeDeck === 'LOWER' ? lowerSeats : upperSeats;

  const handleSeatClick = (seat: TripSeat) => {
    if (seat.isBooked) return;

    setErrorMessage(null);
    if (selectedSeats.includes(seat.seatNumber)) {
      // Remove
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatNumber));
      const nextPassengers = { ...passengers };
      delete nextPassengers[seat.seatNumber];
      setPassengers(nextPassengers);
    } else {
      if (selectedSeats.length >= 6) {
        setErrorMessage('Maximum 6 seats allowed per booking reservation.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
      setPassengers({
        ...passengers,
        [seat.seatNumber]: {
          seatNumber: seat.seatNumber,
          name: '',
          age: 28,
          gender: 'MALE'
        }
      });
    }
  };

  const handlePOVPreview = (seat: TripSeat) => {
    setActivePOVSeat(seat);
  };

  const handlePassengerChange = (
    seatNum: string,
    field: keyof Passenger,
    value: string | number
  ) => {
    setPassengers({
      ...passengers,
      [seatNum]: {
        ...passengers[seatNum],
        [field]: value
      }
    });
  };

  const baseTotal = selectedSeats.length * trip.baseFare;
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'BUSGO200') {
      const disc = Math.min(200, baseTotal);
      setDiscountAmount(disc);
      setPromoAppliedMsg('₹200 Instant Discount Applied!');
    } else if (cleanCode === 'FESTIVE15') {
      const disc = Math.round(baseTotal * 0.15);
      setDiscountAmount(disc);
      setPromoAppliedMsg('15% Festive Saver Applied!');
    } else {
      setErrorMessage(`Invalid code "${promoCode}". Try BUSGO200 or FESTIVE15`);
      setDiscountAmount(0);
      setPromoAppliedMsg(null);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat before continuing.');
      return;
    }

    // Verify all selected seats have a passenger name
    for (const seatNum of selectedSeats) {
      const p = passengers[seatNum];
      if (!p || !p.name.trim()) {
        setErrorMessage(`Please enter the passenger name for seat ${seatNum}.`);
        return;
      }
    }

    if (!selectedBoarding) {
      setErrorMessage('Please select a boarding point.');
      return;
    }

    if (!selectedDropping) {
      setErrorMessage('Please select a dropping point.');
      return;
    }

    setCheckoutStep('PAYMENT');
  };

  const handleFinalBookingSubmit = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const passengerList = selectedSeats.map((seatNum) => passengers[seatNum]);

      const payload = {
        tripId: trip.id,
        seatNumbers: selectedSeats,
        passengers: passengerList,
        contactEmail,
        contactPhone,
        boardingPoint: selectedBoarding,
        droppingPoint: selectedDropping,
        totalAmount: finalTotal,
        paymentMethod
      };

      const res = await api.post('/bookings', payload);
      onBookingSuccess(res.data.data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to confirm booking. One of your selected seats may have been taken.';
      setErrorMessage(errorMsg);
      setCheckoutStep('DETAILS');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#F7F9FC] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-[#101828]">
                  {trip.bus.operator?.name || 'Bus Operator'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200">
                  {trip.bus.busType.replace(/_/g, ' ')}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                  {trip.bus.busNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-bold text-[#101828]">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  {trip.route.sourceCity} ➔ {trip.route.destinationCity}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {trip.travelDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#FF8A3D] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {trip.departureTime} - {trip.arrivalTime}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-[#101828] rounded-2xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-bold">{errorMessage}</div>
          </div>
        )}

        {/* Content Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Real Bus Seat Layout & Interactive 3D POV Viewer */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Viewport Switcher */}
            <div className="flex items-center justify-between bg-[#F7F9FC] p-1.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1 flex-1">
                <button
                  type="button"
                  onClick={() => setLeftTab('BUS_CABIN')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    leftTab === 'BUS_CABIN'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-500 hover:text-[#101828] hover:bg-white'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Real Bus Cabin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeftTab('POV_VIEW')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    leftTab === 'POV_VIEW'
                      ? 'bg-[#101828] text-white shadow-md'
                      : 'text-slate-500 hover:text-[#101828] hover:bg-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>
                    3D Seat View {activePOVSeat && `(${activePOVSeat.seatNumber})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Viewport Display */}
            {leftTab === 'BUS_CABIN' ? (
              <div className="flex flex-col items-center">
                <RealBusCabin
                  trip={trip}
                  currentDeckSeats={currentDeckSeats}
                  activeDeck={activeDeck}
                  selectedSeats={selectedSeats}
                  activePOVSeat={activePOVSeat}
                  onSeatClick={handleSeatClick}
                  onPOVPreview={(seat) => handlePOVPreview(seat)}
                  onDeckChange={setActiveDeck}
                  lowerCount={lowerSeats.filter((s) => !s.isBooked).length}
                  upperCount={upperSeats.filter((s) => !s.isBooked).length}
                />

                <div className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>
                    Tap any seat to select and preview its realistic window & cabin view!
                  </span>
                </div>

                {/* Embedded Live POV Mini-Dock */}
                {activePOVSeat && (
                  <div className="w-full mt-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-black text-[#101828] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Live Seat Perspective: Seat {activePOVSeat.seatNumber}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setLeftTab('POV_VIEW')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-extrabold underline"
                      >
                        Full 3D Mode ➔
                      </button>
                    </div>
                    <SeatViewPOV
                      seat={activePOVSeat}
                      trip={trip}
                      isSelected={selectedSeats.includes(activePOVSeat.seatNumber)}
                      onToggleSelect={handleSeatClick}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full space-y-4">
                <SeatViewPOV
                  seat={activePOVSeat}
                  trip={trip}
                  isSelected={
                    activePOVSeat ? selectedSeats.includes(activePOVSeat.seatNumber) : false
                  }
                  onToggleSelect={handleSeatClick}
                  onClose={() => setLeftTab('BUS_CABIN')}
                />

                <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold text-[#101828] mb-2 flex items-center justify-between">
                    <span>Switch Seat to View from Cabin:</span>
                    <button
                      type="button"
                      onClick={() => setLeftTab('BUS_CABIN')}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Back to Bus Layout ➔
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {currentDeckSeats.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActivePOVSeat(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          activePOVSeat?.seatNumber === s.seatNumber
                            ? 'bg-blue-600 text-white shadow-sm'
                            : selectedSeats.includes(s.seatNumber)
                            ? 'bg-[#101828] text-white'
                            : s.isBooked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-white text-[#101828] hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {s.seatNumber}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Checkout Workflow */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            {checkoutStep === 'DETAILS' ? (
              <form onSubmit={handleProceedToPayment} className="space-y-5">
                {/* Step 1: Interactive Boarding & Dropping Points */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black tracking-wide uppercase text-slate-700 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Boarding & Dropping Locations</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                      Live Timing Active
                    </span>
                  </div>

                  <StopPicker
                    boardingPoints={boardingPoints}
                    droppingPoints={droppingPoints}
                    selectedBoarding={selectedBoarding}
                    selectedDropping={selectedDropping}
                    departureTime={trip.departureTime}
                    onSelectBoarding={setSelectedBoarding}
                    onSelectDropping={setSelectedDropping}
                  />
                </div>

                {/* Step 2: Passenger Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black tracking-wide uppercase text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Passenger Information</span>
                    </label>
                    {selectedSeats.length > 0 && (
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
                      </span>
                    )}
                  </div>

                  {selectedSeats.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 bg-[#F7F9FC]">
                      <User className="w-8 h-8 mx-auto mb-2 text-slate-400 animate-bounce" />
                      <p className="text-xs font-bold text-[#101828]">No seats selected yet</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Click any available seat or berth on the bus layout to assign traveler names.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
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
                            className="p-3 bg-[#F7F9FC] border border-slate-200 rounded-2xl space-y-2 shadow-sm"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-[#101828] flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                                  {seatNum}
                                </span>
                                <span>Passenger for Seat {seatNum}</span>
                              </span>
                              <span className="text-[11px] text-blue-600 font-bold font-mono">
                                ₹{trip.baseFare}
                              </span>
                            </div>

                            <div className="grid grid-cols-12 gap-2">
                              <input
                                type="text"
                                placeholder="Full Name (as on ID)"
                                value={passenger.name}
                                onChange={(e) =>
                                  handlePassengerChange(seatNum, 'name', e.target.value)
                                }
                                className="col-span-6 text-xs bg-white text-[#101828] border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-blue-600 focus:outline-none placeholder-slate-400 font-semibold"
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
                                className="col-span-2 text-xs bg-white text-[#101828] border border-slate-200 rounded-xl px-2 py-1.5 text-center focus:ring-1 focus:ring-blue-600 focus:outline-none font-semibold"
                                required
                              />

                              <select
                                value={passenger.gender}
                                onChange={(e) =>
                                  handlePassengerChange(seatNum, 'gender', e.target.value)
                                }
                                className="col-span-4 text-xs bg-white text-[#101828] border border-slate-200 rounded-xl px-2 py-1.5 focus:ring-1 focus:ring-blue-600 focus:outline-none font-semibold"
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

                {/* Step 3: Fare Summary & Proceed to Pay CTA */}
                <div className="pt-3 border-t border-slate-200 space-y-3 bg-[#F7F9FC] rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Selected Seats</span>
                    <span className="font-extrabold text-[#101828]">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Boarding Pickup</span>
                    <span className="font-bold text-[#101828] truncate max-w-[180px]">
                      {selectedBoarding}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Dropping Drop-off</span>
                    <span className="font-bold text-[#101828] truncate max-w-[180px]">
                      {selectedDropping}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Total Base Amount
                      </div>
                      <div className="text-2xl font-black text-blue-600">
                        ₹{baseTotal.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-[10px] text-right text-slate-500 font-semibold">
                      <div>Instant Lock</div>
                      <div className="text-emerald-600 font-bold">Zero Hidden Charges</div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={selectedSeats.length === 0}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                  >
                    <span>Proceed to Review & Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Step 4: Checkout & Payment Stage */
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#101828]">
                      Payment & Confirmation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select your preferred payment gateway method
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('DETAILS')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    ← Edit Details
                  </button>
                </div>

                {/* Promo Code Input */}
                <div className="p-3.5 rounded-2xl bg-[#F7F9FC] border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-[#101828] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#FF8A3D]" />
                    <span>Have a Promo Code?</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BUSGO200"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 uppercase placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-[#101828] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {promoAppliedMsg && (
                    <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{promoAppliedMsg}</span>
                    </div>
                  )}
                </div>

                {/* Payment Gateway Options */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'UPI'
                          ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm ring-1 ring-blue-600'
                          : 'bg-[#F7F9FC] border-slate-200 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-bold">UPI / QR</div>
                      <div className="text-[9px] opacity-75">GPay, PhonePe</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'CARD'
                          ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm ring-1 ring-blue-600'
                          : 'bg-[#F7F9FC] border-slate-200 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-bold">Debit / Credit</div>
                      <div className="text-[9px] opacity-75">Visa, Mastercard</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'NETBANKING'
                          ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm ring-1 ring-blue-600'
                          : 'bg-[#F7F9FC] border-slate-200 text-slate-500 hover:bg-white'
                      }`}
                    >
                      <Building2Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-bold">Net Banking</div>
                      <div className="text-[9px] opacity-75">All Indian Banks</div>
                    </button>
                  </div>
                </div>

                {/* Fare Breakdown Card */}
                <div className="p-4 bg-[#F7F9FC] rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Fare ({selectedSeats.length} Seats)</span>
                    <span className="font-bold text-[#101828]">₹{baseTotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Convenience Fee & Taxes</span>
                    <span className="font-bold text-emerald-600">₹0 (Free)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-extrabold text-[#101828]">Total Payable Amount</span>
                    <span className="text-2xl font-black text-blue-600">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Final Confirm & Pay CTA */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleFinalBookingSubmit}
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Pay & Confirm Reservation (₹{finalTotal.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Building2Icon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);
