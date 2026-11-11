import React, { useState } from 'react';
import { TripSeat, Trip } from '../../types';
import {
  Eye,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Wind,
  ShieldCheck,
  Check,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import { soundManager } from '../../utils/audioFeedback';

interface SeatViewPOVProps {
  seat: TripSeat | null;
  trip: Trip;
  isSelected: boolean;
  onToggleSelect: (seat: TripSeat) => void;
  onClose?: () => void;
}

export const SeatViewPOV: React.FC<SeatViewPOVProps> = ({
  seat,
  trip,
  isSelected,
  onToggleSelect,
  onClose
}) => {
  const [scenery, setScenery] = useState<'NIGHT' | 'SUNSET' | 'MOUNTAIN'>('NIGHT');
  const [reclineAngle, setReclineAngle] = useState<number>(
    trip.bus.busType === 'AC_SLEEPER' ? 180 : 125
  );
  const [readingLightOn, setReadingLightOn] = useState<boolean>(true);
  const [acIntensity, setAcIntensity] = useState<'HIGH' | 'MED' | 'OFF'>('HIGH');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted);

  if (!seat) {
    return (
      <div className="bg-[#101828] text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center min-h-[360px] relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
          <Eye className="w-8 h-8 text-blue-500 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          BusGo 3D Seat View & Passenger Simulator
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          Tap any seat or berth on the bus to step inside and experience the real passenger perspective, window scenery, and smart amenities!
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-[#FF8A3D]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Luxury Coach Viewport</span>
        </div>
      </div>
    );
  }

  const isSleeper = trip.bus.busType === 'AC_SLEEPER' || seat.seatType === 'SLEEPER';
  const isWindowSeat =
    seat.seatNumber.endsWith('A') ||
    seat.seatNumber.endsWith('D') ||
    seat.seatNumber.startsWith('L1') ||
    seat.seatNumber.startsWith('L4') ||
    seat.seatNumber.startsWith('U1') ||
    seat.seatNumber.startsWith('U4') ||
    seat.seatNumber.includes('W');

  const toggleSound = () => {
    soundManager.isMuted = !soundManager.isMuted;
    setIsMuted(soundManager.isMuted);
  };

  return (
    <div className="bg-[#101828] text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative transition-all">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
            {seat.seatNumber}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white truncate">
                Seat {seat.seatNumber} • Perspective View
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                {isSleeper ? 'Sleeper Berth' : isWindowSeat ? 'Window Seat' : 'Aisle Seat'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {seat.deck} Deck • {trip.bus.model}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#FF8A3D]" />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Virtual Perspective Viewport */}
      <div className="relative h-60 sm:h-72 w-full overflow-hidden flex items-center justify-center select-none bg-black">
        {/* Scenery Background Canvas */}
        {scenery === 'NIGHT' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0B0F19] to-[#101828]">
            <div className="absolute inset-0 opacity-80 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="absolute top-4 right-12 w-9 h-9 rounded-full bg-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.6)] flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-[#101828] translate-x-1 -translate-y-0.5" />
            </div>
            <svg
              className="absolute bottom-12 inset-x-0 w-full h-24 text-slate-950 opacity-90"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
            >
              <path
                d="M0,80 L200,20 L350,70 L500,10 L700,75 L900,15 L1100,60 L1200,30 L1200,120 L0,120 Z"
                fill="currentColor"
              />
            </svg>
            <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black via-slate-900 to-transparent flex items-end justify-between px-8 pb-1">
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                <span>🛣️ NH 44 Expressway</span>
              </div>
              <div className="text-[10px] text-[#FF8A3D] font-mono">
                {trip.route.sourceCity} ➔ {trip.route.destinationCity} ({trip.route.distanceKm} km)
              </div>
            </div>
          </div>
        )}

        {scenery === 'SUNSET' && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-orange-600 to-[#101828]">
            <div className="absolute top-6 left-1/3 w-16 h-16 rounded-full bg-gradient-to-b from-amber-200 to-yellow-500 shadow-[0_0_40px_rgba(245,158,11,0.8)] opacity-90" />
            <svg
              className="absolute bottom-8 inset-x-0 w-full h-28 text-[#101828] opacity-95"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
            >
              <path
                d="M0,60 L150,25 L350,85 L600,15 L850,70 L1050,30 L1200,50 L1200,120 L0,120 Z"
                fill="currentColor"
              />
            </svg>
            <div className="absolute bottom-0 inset-x-0 h-10 bg-black/60 flex items-center justify-between px-6 text-[10px] text-amber-200 font-medium">
              <span>Sunset Highway Corridor</span>
              <span>Speed: 85 km/h Cruise</span>
            </div>
          </div>
        )}

        {scenery === 'MOUNTAIN' && (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-teal-900 to-[#101828]">
            <svg
              className="absolute bottom-8 inset-x-0 w-full h-32 text-emerald-950 opacity-95"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
            >
              <path
                d="M0,90 Q300,10 600,60 T1200,30 L1200,120 L0,120 Z"
                fill="currentColor"
              />
            </svg>
            <div className="absolute top-4 left-6 text-[11px] font-bold text-teal-200 flex items-center gap-1.5">
              <span>🌲 Western Ghats Highway View</span>
            </div>
          </div>
        )}

        {readingLightOn && (
          <div className="absolute top-0 right-1/4 w-40 h-full bg-gradient-to-b from-amber-200/40 via-amber-100/15 to-transparent pointer-events-none transform -skew-x-12 blur-sm" />
        )}

        {isWindowSeat ? (
          <div className="absolute inset-2 border-8 sm:border-[12px] border-slate-950 rounded-3xl pointer-events-none shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transform rotate-12" />

            <div className="relative z-10 w-full h-6 bg-[#101828]/90 border-b border-slate-700 shadow-md flex items-center justify-center">
              <div className="text-[9px] tracking-widest uppercase font-bold text-blue-200">
                Panoramic Tinted Glass • UV Protected
              </div>
            </div>

            <div className="relative z-10 flex-1 flex justify-between pointer-events-none">
              <div className="w-8 sm:w-12 h-full bg-gradient-to-r from-[#101828] via-slate-800 to-transparent border-r border-slate-800 opacity-90 shadow-lg" />
              <div className="w-8 sm:w-12 h-full bg-gradient-to-l from-[#101828] via-slate-800 to-transparent border-l border-slate-800 opacity-90 shadow-lg" />
            </div>

            <div className="relative z-10 w-full h-7 bg-[#101828] border-t border-slate-700 flex items-center justify-between px-4 text-[10px] text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Window Seat {seat.seatNumber}</span>
              </span>
              <span className="font-mono text-[#FF8A3D]">BusGo Premium Cabin</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 bg-slate-950/40">
            <div className="mx-auto bg-[#101828]/90 border border-slate-700 rounded-xl px-4 py-1.5 shadow-lg flex items-center gap-2 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
              <span>Next Stop: Electronic City Toll • 18 mins away</span>
            </div>

            <div className="text-center bg-[#101828]/90 border border-slate-800 rounded-xl p-2.5 mx-auto max-w-sm">
              <div className="text-xs font-bold text-white mb-0.5">
                Spacious Aisle Seat Advantage
              </div>
              <div className="text-[11px] text-slate-400">
                Direct unrestricted access to walkway, zero trapped feeling, instant exit on arrival!
              </div>
            </div>
          </div>
        )}

        {/* Scenery Selector Floating Control */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setScenery('NIGHT')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              scenery === 'NIGHT'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Night</span>
          </button>
          <button
            type="button"
            onClick={() => setScenery('SUNSET')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              scenery === 'SUNSET'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Sunset</span>
          </button>
          <button
            type="button"
            onClick={() => setScenery('MOUNTAIN')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              scenery === 'MOUNTAIN'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌲 Hills</span>
          </button>
        </div>
      </div>

      {/* Interactive In-Seat Gadgets & Comfort Cockpit */}
      <div className="p-4 sm:p-5 space-y-4 bg-slate-950">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Recline Angle */}
          <div className="bg-[#101828] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>{isSleeper ? 'Berth' : 'Pushback'}</span>
              <span className="text-[#FF8A3D] font-mono">{reclineAngle}°</span>
            </div>
            <div className="text-xs font-bold text-white mb-2">
              {reclineAngle === 180
                ? 'Flat Bed'
                : reclineAngle >= 135
                ? 'Deep Sleep'
                : reclineAngle >= 120
                ? 'Relaxed'
                : 'Upright'}
            </div>
            <div className="flex items-center gap-1">
              {!isSleeper ? (
                <>
                  <button
                    type="button"
                    onClick={() => setReclineAngle(100)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold ${
                      reclineAngle === 100
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    100°
                  </button>
                  <button
                    type="button"
                    onClick={() => setReclineAngle(125)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold ${
                      reclineAngle === 125
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    125°
                  </button>
                  <button
                    type="button"
                    onClick={() => setReclineAngle(140)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold ${
                      reclineAngle === 140
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    140°
                  </button>
                </>
              ) : (
                <div className="w-full text-[10px] text-center font-semibold text-emerald-400 bg-emerald-950/40 py-1 rounded border border-emerald-500/30">
                  Full Flatbed 6.2ft
                </div>
              )}
            </div>
          </div>

          {/* 2. Reading Spotlight */}
          <div className="bg-[#101828] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Reading Lamp</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  readingLightOn ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-600'
                }`}
              />
            </div>
            <div className="text-xs font-bold text-white mb-2">
              {readingLightOn ? 'Warm Spotlight' : 'Lamp Switched Off'}
            </div>
            <button
              type="button"
              onClick={() => setReadingLightOn(!readingLightOn)}
              className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all ${
                readingLightOn
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {readingLightOn ? 'Turn Off' : 'Turn On'}
            </button>
          </div>

          {/* 3. AC Vent Airflow */}
          <div className="bg-[#101828] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Rotary AC Vent</span>
              <Wind className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xs font-bold text-white mb-2">
              {acIntensity === 'HIGH' ? 'Cool 18°C' : acIntensity === 'MED' ? 'Cozy 22°C' : 'Diffuser Off'}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAcIntensity('HIGH')}
                className={`flex-1 py-1 rounded text-[10px] font-bold ${
                  acIntensity === 'HIGH'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Max
              </button>
              <button
                type="button"
                onClick={() => setAcIntensity('MED')}
                className={`flex-1 py-1 rounded text-[10px] font-bold ${
                  acIntensity === 'MED'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Mild
              </button>
              <button
                type="button"
                onClick={() => setAcIntensity('OFF')}
                className={`flex-1 py-1 rounded text-[10px] font-bold ${
                  acIntensity === 'OFF'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Off
              </button>
            </div>
          </div>

          {/* 4. Power & Legroom */}
          <div className="bg-[#101828] border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Fast Charging</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-white mb-2">
              65W USB-C + 230V
            </div>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Surge Protected</span>
            </div>
          </div>
        </div>

        {/* Seat Reservation Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Seat Base Fare
            </div>
            <div className="text-lg font-black text-[#FF8A3D]">
              ₹{trip.baseFare}
              <span className="text-[11px] font-normal text-slate-400 ml-1">
                (incl. taxes & amenities)
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {seat.isBooked ? (
              <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs text-center border border-slate-700">
                Seat Already Booked
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onToggleSelect(seat)}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isSelected
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Seat {seat.seatNumber} Selected (Click to Remove)</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Select Seat {seat.seatNumber}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
