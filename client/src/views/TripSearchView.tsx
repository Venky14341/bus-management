import React, { useState, useEffect } from 'react';
import { Trip, Booking } from '../types';
import { api } from '../services/api';
import { SeatMapModal } from '../components/SeatMapModal';
import { TicketModal } from '../components/TicketModal';
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  Star,
  Wifi,
  BatteryCharging,
  Coffee,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TripSearchView: React.FC = () => {
  const [origin, setOrigin] = useState('Bengaluru');
  const [destination, setDestination] = useState('Chennai');
  
  // Default to today in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];
  const [travelDate, setTravelDate] = useState(todayStr);

  const [busTypeFilter, setBusTypeFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(2000);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [activeSeatMapTrip, setActiveSeatMapTrip] = useState<Trip | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Popular route shortcuts
  const popularRoutes = [
    { from: 'Bengaluru', to: 'Chennai' },
    { from: 'Bengaluru', to: 'Hyderabad' },
    { from: 'Mumbai', to: 'Pune' },
    { from: 'Delhi', to: 'Jaipur' }
  ];

  const fetchTrips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (origin.trim()) params.origin = origin.trim();
      if (destination.trim()) params.destination = destination.trim();
      if (travelDate) params.travelDate = travelDate;
      if (busTypeFilter) params.busType = busTypeFilter;
      if (maxPriceFilter) params.maxPrice = maxPriceFilter;

      const res = await api.get('/trips/search', { params });
      setTrips(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search trips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrips();
  };

  const handleSelectPopularRoute = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    // Trigger immediate search
    setTimeout(() => {
      fetchTrips();
    }, 50);
  };

  const handleOpenSeatMap = async (tripId: string) => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setActiveSeatMapTrip(res.data.data);
    } catch (err: any) {
      alert('Failed to load trip details');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Search Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-rose-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ACID Guaranteed & Real-Time Seat Integrity</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Book Verified Intercity Bus Tickets
            </h1>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              Real-time seat mapping, instant PNR generation, and automated refund calculation.
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-3 text-slate-800"
          >
            {/* Origin */}
            <div className="sm:col-span-4 relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                From City
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-rose-500">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full text-xs font-bold bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="sm:col-span-4 relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                To City
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-rose-500">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs font-bold bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Travel Date */}
            <div className="sm:col-span-2 relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Date
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 focus-within:ring-2 focus-within:ring-rose-500">
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full text-xs font-bold bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 h-[42px]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Route Shortcut Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-semibold">Popular Routes:</span>
            {popularRoutes.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPopularRoute(r.from, r.to)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
              >
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Trips Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-rose-600" />
                Filter Trips
              </span>
              <button
                type="button"
                onClick={() => {
                  setBusTypeFilter('');
                  setMaxPriceFilter(2000);
                  setTimeout(fetchTrips, 10);
                }}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Bus Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Bus Type</label>
              <div className="space-y-1.5">
                {[
                  { label: 'All Bus Classes', value: '' },
                  { label: 'AC Sleeper (2+1)', value: 'AC_SLEEPER' },
                  { label: 'AC Seater (2+2)', value: 'AC_SEATER' },
                  { label: 'Non-AC Seater', value: 'NON_AC_SEATER' }
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="busType"
                      checked={busTypeFilter === item.value}
                      onChange={() => {
                        setBusTypeFilter(item.value);
                        setTimeout(fetchTrips, 10);
                      }}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Max Fare</span>
                <span className="text-rose-600">Up to ₹{maxPriceFilter}</span>
              </div>
              <input
                type="range"
                min={300}
                max={2500}
                step={50}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                onMouseUp={fetchTrips}
                onTouchEnd={fetchTrips}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>₹300</span>
                <span>₹2,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trips List Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900 font-extrabold">{trips.length}</span> verified trips on {travelDate}
            </span>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Querying live seat inventory...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Scheduled Trips Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No trips matching "{origin}" to "{destination}" on {travelDate}. Try searching for tomorrow or another route.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOrigin('Bengaluru');
                  setDestination('Chennai');
                  setTimeout(fetchTrips, 10);
                }}
                className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                Search Default Bengaluru → Chennai
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => {
                const available = trip.inventory.availableSeats;
                const total = trip.inventory.totalSeats;

                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Operator & Bus Details */}
                    <div className="space-y-1.5 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {trip.bus.operator?.name}
                        </span>
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-emerald-600 stroke-none" />
                          <span>{trip.bus.operator?.rating || 4.5}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span>{trip.bus.model}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                          {trip.bus.busType.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Amenities */}
                      <div className="flex items-center gap-3 pt-1 text-slate-400">
                        {trip.bus.hasWifi && (
                          <div className="flex items-center gap-1 text-[10px]" title="Free High-Speed Wi-Fi">
                            <Wifi className="w-3.5 h-3.5 text-blue-500" />
                            <span>Wi-Fi</span>
                          </div>
                        )}
                        {trip.bus.hasCharging && (
                          <div className="flex items-center gap-1 text-[10px]" title="Seat Charging Points">
                            <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Charging</span>
                          </div>
                        )}
                        {trip.bus.hasWaterBottle && (
                          <div className="flex items-center gap-1 text-[10px]" title="Complimentary Water">
                            <Coffee className="w-3.5 h-3.5 text-amber-500" />
                            <span>Water</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timings & Duration */}
                    <div className="flex items-center gap-4 text-center">
                      <div>
                        <div className="text-base font-extrabold text-slate-900">
                          {trip.departureTime}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400">
                          {trip.route.sourceCity}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400">
                          {trip.route.estimatedHours}h
                        </div>
                        <div className="w-16 h-0.5 bg-slate-200 relative flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                        </div>
                        <div className="text-[10px] text-slate-400">Non-Stop</div>
                      </div>

                      <div>
                        <div className="text-base font-extrabold text-slate-900">
                          {trip.arrivalTime}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400">
                          {trip.route.destinationCity}
                        </div>
                      </div>
                    </div>

                    {/* Fare & CTA */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-slate-400 font-semibold">Starts from</div>
                        <div className="text-xl font-black text-rose-600">
                          ₹{trip.baseFare.toLocaleString()}
                        </div>
                        <div className="text-[11px] font-bold mt-0.5">
                          {available > 5 ? (
                            <span className="text-emerald-600">{available} Seats Free</span>
                          ) : available > 0 ? (
                            <span className="text-amber-600">Only {available} Left!</span>
                          ) : (
                            <span className="text-rose-600">Sold Out</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={available === 0}
                        onClick={() => handleOpenSeatMap(trip.id)}
                        className="py-2 px-4 bg-slate-900 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Seat Map Modal */}
      {activeSeatMapTrip && (
        <SeatMapModal
          trip={activeSeatMapTrip}
          onClose={() => setActiveSeatMapTrip(null)}
          onBookingSuccess={(booking) => {
            setActiveSeatMapTrip(null);
            setConfirmedBooking(booking);
            fetchTrips(); // Refresh available inventory!
          }}
        />
      )}

      {/* Ticket Confirmation Modal */}
      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}
    </div>
  );
};
