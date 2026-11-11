import React from 'react';
import { Trip, TripSeat } from '../../types';
import {
  Compass,
  Check,
  Lock,
  Eye,
  Sparkles,
  Shield,
  Layers,
  ArrowDown
} from 'lucide-react';
import { soundManager } from '../../utils/audioFeedback';

interface RealBusCabinProps {
  trip: Trip;
  currentDeckSeats: TripSeat[];
  activeDeck: 'LOWER' | 'UPPER';
  selectedSeats: string[];
  activePOVSeat: TripSeat | null;
  onSeatClick: (seat: TripSeat) => void;
  onPOVPreview: (seat: TripSeat) => void;
  onDeckChange: (deck: 'LOWER' | 'UPPER') => void;
  lowerCount: number;
  upperCount: number;
}

export const RealBusCabin: React.FC<RealBusCabinProps> = ({
  trip,
  currentDeckSeats,
  activeDeck,
  selectedSeats,
  activePOVSeat,
  onSeatClick,
  onPOVPreview,
  onDeckChange,
  lowerCount,
  upperCount
}) => {
  const isSleeper = trip.bus.busType === 'AC_SLEEPER';

  const handleSeatTap = (seat: TripSeat) => {
    onPOVPreview(seat);
    if (!seat.isBooked) {
      if (selectedSeats.includes(seat.seatNumber)) {
        soundManager.playSeatDeselect();
      } else {
        soundManager.playSeatSelect();
      }
      onSeatClick(seat);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Deck Switcher for Sleeper Multi-Axle Buses */}
      {isSleeper && (
        <div className="w-full max-w-sm mb-4 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDeckChange('LOWER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeDeck === 'LOWER'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lower Deck</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
              {lowerCount} Free
            </span>
          </button>

          <button
            type="button"
            onClick={() => onDeckChange('UPPER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeDeck === 'UPPER'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Upper Deck</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
              {upperCount} Free
            </span>
          </button>
        </div>
      )}

      {/* Real Bus Coach Chassis */}
      <div className="relative w-full max-w-md bg-white border-4 border-slate-300 rounded-[42px] p-4 sm:p-5 shadow-2xl overflow-hidden">
        {/* Exterior Chrome Rearview Mirrors */}
        <div className="absolute -left-3 top-16 w-3 h-8 bg-gradient-to-r from-slate-400 to-slate-300 rounded-l-md shadow border-y border-l border-slate-400" />
        <div className="absolute -right-3 top-16 w-3 h-8 bg-gradient-to-l from-slate-400 to-slate-300 rounded-r-md shadow border-y border-r border-slate-400" />

        {/* Bus Front Destination Marquee */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2 px-3 mb-3 text-center shadow-inner">
          <div className="text-[10px] font-mono tracking-widest text-orange-400 font-black uppercase truncate">
            {trip.route.sourceCity} ➔ {trip.route.destinationCity} • {trip.bus.model}
          </div>
        </div>

        {/* Aerodynamic Windshield Glass & Driver Cabin */}
        <div className="relative w-full bg-gradient-to-b from-slate-100 via-blue-50 to-slate-100 rounded-3xl p-3 border-2 border-slate-200 mb-5 shadow-inner">
          {/* Glass Glare Sheen */}
          <div className="absolute inset-x-4 top-1 h-3 bg-gradient-to-b from-white/70 to-transparent rounded-t-full pointer-events-none" />

          {/* Windshield Wipers */}
          <div className="flex items-center justify-around pb-2 opacity-40">
            <div className="w-12 h-0.5 bg-slate-600 transform rotate-12" />
            <div className="w-12 h-0.5 bg-slate-600 transform rotate-12" />
          </div>

          {/* Driver Cockpit & Entrance Door */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            {/* Passenger Entry Steps */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-400 text-[11px] text-emerald-600 font-extrabold shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>DOOR / ENTRY</span>
            </div>

            {/* Driver Steering Cockpit */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] text-slate-800 font-extrabold shadow-sm">
              <div className="w-6 h-6 rounded-full border-2 border-slate-400 flex items-center justify-center text-slate-800 shadow-inner">
                <Compass className="w-4 h-4 text-blue-600" />
              </div>
              <span>DRIVER</span>
            </div>
          </div>
        </div>

        {/* Cabin Saloon - Side Windows & Seats */}
        <div className="relative py-1">
          {/* Left & Right Bus Tinted Window Pillars */}
          <div className="absolute left-0 inset-y-0 w-1.5 bg-slate-200 rounded-full" />
          <div className="absolute right-0 inset-y-0 w-1.5 bg-slate-200 rounded-full" />

          {/* Central Walking Aisle Carpet Runner with Ambient Lights */}
          <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-8 bg-slate-100 rounded-lg border-x border-slate-200 pointer-events-none flex flex-col items-center justify-between py-6">
            <div className="w-1.5 h-3 rounded-full bg-blue-300" />
            <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            <div className="w-1.5 h-3 rounded-full bg-blue-300" />
            <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
            <div className="w-1.5 h-3 rounded-full bg-blue-300" />
          </div>

          {/* Seats Rendering */}
          {isSleeper ? (
            /* Sleeper Berth Layout (1 Berth on Left, 2 Berths on Right separated by Aisle) */
            <div className="space-y-3.5 relative z-10 px-1">
              {Array.from({ length: Math.ceil(currentDeckSeats.length / 3) }).map((_, rowIdx) => {
                const leftBerth = currentDeckSeats[rowIdx * 3];
                const rightBerth1 = currentDeckSeats[rowIdx * 3 + 1];
                const rightBerth2 = currentDeckSeats[rowIdx * 3 + 2];

                return (
                  <div key={rowIdx} className="grid grid-cols-12 gap-2 items-center">
                    {/* Left Solo Berth (Single Suite) */}
                    <div className="col-span-5">
                      {leftBerth && (
                        <BerthCard
                          seat={leftBerth}
                          isSelected={selectedSeats.includes(leftBerth.seatNumber)}
                          isPOVActive={activePOVSeat?.seatNumber === leftBerth.seatNumber}
                          baseFare={trip.baseFare}
                          onTap={() => handleSeatTap(leftBerth)}
                          onPOV={() => onPOVPreview(leftBerth)}
                        />
                      )}
                    </div>

                    {/* Central Walkway Gap */}
                    <div className="col-span-2 text-center text-[9px] font-mono font-bold text-slate-400 uppercase">
                      AISLE
                    </div>

                    {/* Right Double Berths (Companion Suite) */}
                    <div className="col-span-5 grid grid-cols-2 gap-1.5">
                      {rightBerth1 && (
                        <BerthCard
                          seat={rightBerth1}
                          isSelected={selectedSeats.includes(rightBerth1.seatNumber)}
                          isPOVActive={activePOVSeat?.seatNumber === rightBerth1.seatNumber}
                          baseFare={trip.baseFare}
                          onTap={() => handleSeatTap(rightBerth1)}
                          onPOV={() => onPOVPreview(rightBerth1)}
                        />
                      )}
                      {rightBerth2 && (
                        <BerthCard
                          seat={rightBerth2}
                          isSelected={selectedSeats.includes(rightBerth2.seatNumber)}
                          isPOVActive={activePOVSeat?.seatNumber === rightBerth2.seatNumber}
                          baseFare={trip.baseFare}
                          onTap={() => handleSeatTap(rightBerth2)}
                          onPOV={() => onPOVPreview(rightBerth2)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Seater 2+2 Layout (2 Seats Left, Walkway, 2 Seats Right) */
            <div className="space-y-3 relative z-10 px-1">
              {Array.from({ length: Math.ceil(currentDeckSeats.length / 4) }).map((_, rowIdx) => {
                const s1 = currentDeckSeats[rowIdx * 4];
                const s2 = currentDeckSeats[rowIdx * 4 + 1];
                const s3 = currentDeckSeats[rowIdx * 4 + 2];
                const s4 = currentDeckSeats[rowIdx * 4 + 3];

                return (
                  <div key={rowIdx} className="grid grid-cols-12 gap-1.5 items-center">
                    {/* Left 2 Seats (Window + Aisle) */}
                    <div className="col-span-5 grid grid-cols-2 gap-1.5">
                      {s1 && (
                        <SeatCard
                          seat={s1}
                          isSelected={selectedSeats.includes(s1.seatNumber)}
                          isPOVActive={activePOVSeat?.seatNumber === s1.seatNumber}
                          baseFare={trip.baseFare}
                          onTap={() => handleSeatTap(s1)}
                          onPOV={() => onPOVPreview(s1)}
                        />
                      )}
                      {s2 && (
                        <SeatCard
                          seat={s2}
                          isSelected={selectedSeats.includes(s2.seatNumber)}
                          isPOVActive={activePOVSeat?.seatNumber === s2.seatNumber}
                          baseFare={trip.baseFare}
                          onTap={() => handleSeatTap(s2)}
                          onPOV={() => onPOVPreview(s2)}
                        />
                      )}
                    </div>

                    {/* Central Walkway */}
                    <div className="col-span-2 text-center text-[9px] font-mono font-bold text-slate-400">
                      R{rowIdx + 1}
                    </div>

                    {/* Right 2 Seats (Aisle + Window) */}
                    <div className="col-span-5 grid grid-cols-2 gap-1.5">
                      {s3 && (
                        <SeatCard
                          seat={s3}
                          isSelected={selectedSeats.includes(s3.seatNumber)}
                          isPOVActive={activePOVSeat?.seatNumber === s3.seatNumber}
                          baseFare={trip.baseFare}
                          onTap={() => handleSeatTap(s3)}
                          onPOV={() => onPOVPreview(s3)}
                        />
                      )}
                      {s4 && (
                        <SeatCard
                          seat={s4}
                          isSelected={selectedSeats.includes(s4.seatNumber)}
                          isPOVActive={activePOVSeat?.seatNumber === s4.seatNumber}
                          baseFare={trip.baseFare}
                          onTap={() => handleSeatTap(s4)}
                          onPOV={() => onPOVPreview(s4)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bus Rear Chassis & Emergency Exit */}
        <div className="mt-6 pt-3 border-t-2 border-dashed border-slate-200 flex items-center justify-between px-2 text-slate-400">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>EMERGENCY EXIT</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-6 h-2 bg-red-500 rounded-sm shadow-sm" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Rear Bumper</span>
            <div className="w-6 h-2 bg-red-500 rounded-sm shadow-sm" />
          </div>
        </div>
      </div>

      {/* BusGo Master Seat Legend */}
      <div className="w-full max-w-md mt-4 p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-around text-xs font-bold text-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-white border-2 border-blue-600" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-blue-600 border-2 border-blue-700 shadow-sm" />
          <span className="text-blue-600">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-slate-100 border border-slate-200" />
          <span className="text-slate-400">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500">3D POV</span>
        </div>
      </div>
    </div>
  );
};

/* Real 3D-styled Ergonomic Seater Component */
interface SeatCardProps {
  seat: TripSeat;
  isSelected: boolean;
  isPOVActive: boolean;
  baseFare: number;
  onTap: () => void;
  onPOV: () => void;
}

const SeatCard: React.FC<SeatCardProps> = ({
  seat,
  isSelected,
  isPOVActive,
  baseFare,
  onTap,
  onPOV
}) => {
  return (
    <div className="relative group">
      <button
        type="button"
        disabled={seat.isBooked}
        onClick={onTap}
        className={`w-full h-16 rounded-xl border-2 flex flex-col items-center justify-between p-1.5 transition-all transform active:scale-95 ${
          seat.isBooked
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            : isSelected
            ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400 scale-[1.03]'
            : isPOVActive
            ? 'bg-blue-50 border-orange-500 text-slate-900 shadow-md ring-2 ring-orange-400'
            : 'bg-white border-blue-600 text-slate-900 hover:bg-blue-50 hover:border-blue-700'
        }`}
      >
        {/* Headrest Cushion with Linen Slipcover */}
        <div
          className={`w-7 h-2 rounded-t-md transition-all ${
            seat.isBooked
              ? 'bg-slate-200'
              : isSelected
              ? 'bg-white/80'
              : 'bg-blue-100 group-hover:bg-blue-200'
          }`}
        />

        {/* Seat Number & Indicator */}
        <div className="text-xs font-black tracking-tight flex items-center gap-0.5">
          <span>{seat.seatNumber}</span>
          {seat.seatNumber.endsWith('A') || seat.seatNumber.endsWith('D') ? (
            <span className={`text-[8px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>W</span>
          ) : null}
        </div>

        {/* Bottom Cushion / Price */}
        <div className="text-[9px] font-bold opacity-90 truncate max-w-full">
          {seat.isBooked ? (
            <span className="flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" /> Booked
            </span>
          ) : isSelected ? (
            <span className="flex items-center gap-0.5 font-bold">
              <Check className="w-2.5 h-2.5 stroke-[3]" /> Added
            </span>
          ) : (
            `₹${baseFare}`
          )}
        </div>
      </button>

      {/* Floating 3D POV Eye Button */}
      <button
        type="button"
        title={`View 3D POV from Seat ${seat.seatNumber}`}
        onClick={(e) => {
          e.stopPropagation();
          onPOV();
        }}
        className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-md z-20 ${
          isPOVActive
            ? 'bg-orange-500 text-white ring-2 ring-white scale-110'
            : 'bg-white border border-slate-300 text-slate-500 hover:text-white hover:bg-orange-500'
        }`}
      >
        <Eye className="w-3 h-3" />
      </button>
    </div>
  );
};

/* Real Luxury Sleeper Berth Component */
interface BerthCardProps {
  seat: TripSeat;
  isSelected: boolean;
  isPOVActive: boolean;
  baseFare: number;
  onTap: () => void;
  onPOV: () => void;
}

const BerthCard: React.FC<BerthCardProps> = ({
  seat,
  isSelected,
  isPOVActive,
  baseFare,
  onTap,
  onPOV
}) => {
  return (
    <div className="relative group">
      <button
        type="button"
        disabled={seat.isBooked}
        onClick={onTap}
        className={`w-full h-24 rounded-2xl border-2 flex flex-col justify-between p-2 text-left transition-all transform active:scale-95 ${
          seat.isBooked
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
            : isSelected
            ? 'bg-blue-600 border-blue-700 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-400 scale-[1.02]'
            : isPOVActive
            ? 'bg-blue-50 border-orange-500 text-slate-900 shadow-md ring-2 ring-orange-400'
            : 'bg-white border-blue-600 text-slate-900 hover:bg-blue-50 hover:border-blue-700'
        }`}
      >
        {/* Berth Header with Pillow */}
        <div className="flex items-center justify-between w-full">
          <div
            className={`w-7 h-3 rounded-lg border transition-all ${
              seat.isBooked
                ? 'bg-slate-200 border-slate-300'
                : isSelected
                ? 'bg-white/90 border-white'
                : 'bg-blue-100 border-blue-200'
            }`}
          />
          <span className="text-[10px] font-bold uppercase opacity-80">
            {seat.deck.charAt(0)} • BERTH
          </span>
        </div>

        {/* Quilted Mattress Center */}
        <div className="my-auto">
          <div className="text-sm font-black tracking-tight">{seat.seatNumber}</div>
          <div className={`text-[10px] font-semibold truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
            {seat.isBooked ? 'Reserved' : isSelected ? 'Selected' : `₹${baseFare}`}
          </div>
        </div>

        {/* Berth Foot Status */}
        <div className="text-[9px] font-bold flex items-center justify-between pt-1 border-t border-slate-200/50">
          <span>{seat.seatType}</span>
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </button>

      {/* Floating 3D POV Eye Button */}
      <button
        type="button"
        title={`View 3D POV from Berth ${seat.seatNumber}`}
        onClick={(e) => {
          e.stopPropagation();
          onPOV();
        }}
        className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-md z-20 ${
          isPOVActive
            ? 'bg-orange-500 text-white ring-2 ring-white scale-110'
            : 'bg-white border border-slate-300 text-slate-500 hover:text-white hover:bg-orange-500'
        }`}
      >
        <Eye className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
