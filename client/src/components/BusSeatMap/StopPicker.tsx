import React, { useState } from 'react';
import { RouteStop } from '../../types';
import { calculateStopTime } from '../../utils/routeStopsHelper';
import { MapPin, Navigation, Clock, CheckCircle2, Search } from 'lucide-react';

interface StopPickerProps {
  boardingPoints: RouteStop[];
  droppingPoints: RouteStop[];
  selectedBoarding: string;
  selectedDropping: string;
  departureTime: string;
  onSelectBoarding: (stopName: string) => void;
  onSelectDropping: (stopName: string) => void;
}

export const StopPicker: React.FC<StopPickerProps> = ({
  boardingPoints,
  droppingPoints,
  selectedBoarding,
  selectedDropping,
  departureTime,
  onSelectBoarding,
  onSelectDropping
}) => {
  const [activeTab, setActiveTab] = useState<'BOARDING' | 'DROPPING'>('BOARDING');
  const [searchTerm, setSearchTerm] = useState('');

  const currentStops = activeTab === 'BOARDING' ? boardingPoints : droppingPoints;
  const currentSelected = activeTab === 'BOARDING' ? selectedBoarding : selectedDropping;
  const onSelectCurrent = activeTab === 'BOARDING' ? onSelectBoarding : onSelectDropping;

  const filteredStops = currentStops.filter((stop) =>
    stop.stopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
      {/* Header Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#F7F9FC] rounded-xl border border-slate-200/60">
        <button
          type="button"
          onClick={() => {
            setActiveTab('BOARDING');
            setSearchTerm('');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'BOARDING'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-[#101828] hover:bg-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="truncate">Boarding Point</span>
          {selectedBoarding && (
            <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-normal truncate max-w-[100px]">
              {selectedBoarding}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('DROPPING');
            setSearchTerm('');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'DROPPING'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-[#101828] hover:bg-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">Dropping Point</span>
          {selectedDropping && (
            <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-normal truncate max-w-[100px]">
              {selectedDropping}
            </span>
          )}
        </button>
      </div>

      {/* Selected Summary Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#F7F9FC] rounded-xl text-xs border border-slate-200/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {activeTab === 'BOARDING' ? 'Selected Boarding:' : 'Selected Dropping:'}
          </span>
          <span className="font-extrabold text-[#101828] truncate max-w-[180px] sm:max-w-[280px]">
            {currentSelected || 'None selected'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#FF8A3D]">
          <Clock className="w-3 h-3" />
          <span>
            {(() => {
              const matched = currentStops.find((s) => s.stopName === currentSelected);
              return matched
                ? calculateStopTime(departureTime, matched.offsetMinutes)
                : departureTime;
            })()}
          </span>
        </div>
      </div>

      {/* Search Input if > 3 stops */}
      {currentStops.length > 3 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()} places...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F7F9FC] border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#101828] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      )}

      {/* List of Stops */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {filteredStops.map((stop, idx) => {
          const isSelected = currentSelected === stop.stopName;
          const stopTime = calculateStopTime(departureTime, stop.offsetMinutes);

          return (
            <button
              key={stop.id || idx}
              type="button"
              onClick={() => onSelectCurrent(stop.stopName)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                isSelected
                  ? activeTab === 'BOARDING'
                    ? 'bg-blue-50 border-blue-600 text-[#101828] shadow-sm ring-1 ring-blue-600'
                    : 'bg-emerald-50 border-emerald-600 text-[#101828] shadow-sm ring-1 ring-emerald-600'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                    isSelected
                      ? activeTab === 'BOARDING'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold truncate text-[#101828]">{stop.stopName}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Estimated: {stopTime}</span>
                    {stop.offsetMinutes > 0 && (
                      <span className="text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-600">
                        +{stop.offsetMinutes}m
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isSelected && (
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'BOARDING' ? 'text-blue-600' : 'text-emerald-600'
                  }`}
                />
              )}
            </button>
          );
        })}

        {filteredStops.length === 0 && (
          <div className="py-4 text-center text-xs text-slate-400">
            No stops found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};
