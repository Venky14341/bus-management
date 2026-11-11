import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowLeftRight,
  Gift,
  Tag,
  Bus,
  Sun,
  Moon,
  ChevronRight,
  Eye,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
  Copy
} from 'lucide-react';

interface TripSearchViewProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string;
}

export const TripSearchView: React.FC<TripSearchViewProps> = ({
  initialOrigin = 'Bengaluru',
  initialDestination = 'Chennai',
  initialDate
}) => {
  const formatOffsetDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatOffsetDate(0);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [travelDate, setTravelDate] = useState(initialDate || todayStr);

  useEffect(() => {
    if (initialOrigin) setOrigin(initialOrigin);
    if (initialDestination) setDestination(initialDestination);
    if (initialDate) setTravelDate(initialDate);
  }, [initialOrigin, initialDestination, initialDate]);
  const [returnDate, setReturnDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // Filters & Sorting
  const [busTypeFilter, setBusTypeFilter] = useState('');
  const [timeWindowFilter, setTimeWindowFilter] = useState('');
  const [sortBy, setSortBy] = useState('time_asc');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(2000);

  // Trips result
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [activeSeatMapTrip, setActiveSeatMapTrip] = useState<Trip | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // FAQ open item
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const popularRoutes = [
    { from: 'Bengaluru', to: 'Chennai', fare: '₹650', duration: '5h 45m', distance: '350 km', frequency: '22 daily' },
    { from: 'Bengaluru', to: 'Hyderabad', fare: '₹890', duration: '8h 45m', distance: '570 km', frequency: '20 daily' },
    { from: 'Bengaluru', to: 'Goa', fare: '₹1,450', duration: '11h 15m', distance: '560 km', frequency: '10 daily' },
    { from: 'Mumbai', to: 'Pune', fare: '₹350', duration: '3h 30m', distance: '150 km', frequency: '16 daily' },
    { from: 'Mumbai', to: 'Goa', fare: '₹1,300', duration: '12h 00m', distance: '580 km', frequency: '10 daily' },
    { from: 'Delhi', to: 'Jaipur', fare: '₹420', duration: '5h 15m', distance: '280 km', frequency: '16 daily' },
    { from: 'Delhi', to: 'Manali', fare: '₹1,550', duration: '12h 45m', distance: '540 km', frequency: '8 daily' },
    { from: 'Hyderabad', to: 'Vijayawada', fare: '₹520', duration: '4h 45m', distance: '275 km', frequency: '12 daily' }
  ];

  const calculateDuration = (depTime: string, arrTime: string, distanceKm?: number) => {
    if (depTime && arrTime) {
      const [depH, depM] = depTime.split(':').map(Number);
      const [arrH, arrM] = arrTime.split(':').map(Number);
      let diffMinutes = (arrH * 60 + arrM) - (depH * 60 + depM);
      if (diffMinutes <= 0) {
        diffMinutes += 24 * 60; // Overnight journey next day
      }
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h 00m`;
    }
    if (distanceKm) {
      const hoursDec = distanceKm / 55;
      const h = Math.floor(hoursDec);
      const m = Math.round((hoursDec - h) * 60);
      return m > 0 ? `${h}h ${m}m` : `${h}h 00m`;
    }
    return '5h 45m';
  };

  const isNextDay = (depTime: string, arrTime: string) => {
    if (!depTime || !arrTime) return false;
    const [depH, depM] = depTime.split(':').map(Number);
    const [arrH, arrM] = arrTime.split(':').map(Number);
    return (arrH * 60 + arrM) < (depH * 60 + depM);
  };

  const operators = [
    {
      name: 'VRL Travels',
      rating: 4.9,
      reviews: '128K+',
      fleet: 'Volvo 9600 & Scania Multi-Axle',
      desc: 'Karnataka & Pan-India Pioneer in luxury sleeper coaches.',
      badge: 'Platinum Partner'
    },
    {
      name: 'KSRTC Ambari Utsav',
      rating: 4.9,
      reviews: '210K+',
      fleet: 'Dream Class Volvo 15M Sleeper',
      desc: 'State-of-the-art government luxury sleeper service.',
      badge: 'State Flagship'
    },
    {
      name: 'Orange Tours and Travels',
      rating: 4.8,
      reviews: '95K+',
      fleet: 'Mercedes-Benz & Scania Metrolink',
      desc: 'Punctuality champions across Telangana & AP corridors.',
      badge: 'Super Fast'
    },
    {
      name: 'SRS Travels',
      rating: 4.7,
      reviews: '88K+',
      fleet: 'BharatBenz & Volvo Club Class',
      desc: 'Trusted intercity network with broad southern connectivity.',
      badge: 'Best Value'
    },
    {
      name: 'IntrCity SmartBus',
      rating: 4.8,
      reviews: '64K+',
      fleet: 'SmartBus Multi-Axle Lounge',
      desc: 'Lounge boarding, bus captains & sanitized washrooms.',
      badge: 'Smart Fleet'
    },
    {
      name: 'Zingbus Electric',
      rating: 4.7,
      reviews: '42K+',
      fleet: 'Green Long-Range Electric & AC',
      desc: 'Eco-friendly, zero carbon intercity travel network.',
      badge: 'Eco Green'
    }
  ];

  const destinations = [
    {
      name: 'Goa',
      state: 'Coastal Paradise',
      fare: 'From ₹950',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      tag: 'Beaches & Nightlife'
    },
    {
      name: 'Manali',
      state: 'Himachal Pradesh',
      fare: 'From ₹1,250',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
      tag: 'Snow Peaks'
    },
    {
      name: 'Jaipur',
      state: 'Rajasthan',
      fare: 'From ₹450',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80',
      tag: 'Royal Palaces'
    },
    {
      name: 'Bengaluru',
      state: 'Karnataka',
      fare: 'From ₹750',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
      tag: 'Silicon Valley Hub'
    },
    {
      name: 'Chennai',
      state: 'Tamil Nadu',
      fare: 'From ₹750',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
      tag: 'Marina Coastal'
    },
    {
      name: 'Hyderabad',
      state: 'Telangana',
      fare: 'From ₹850',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800&auto=format&fit=crop&q=80',
      tag: 'City of Pearls'
    }
  ];

  const faqs = [
    {
      q: 'How does BusGo ensure real-time seat locking without double bookings?',
      a: 'BusGo connects directly to the fleet database using ACID-compliant transactional locks. When you select a seat, our engine temporarily locks that seat inventory, ensuring no two travelers can ever book the same seat.'
    },
    {
      q: 'Can I view the actual bus interior and passenger window perspective before booking?',
      a: 'Yes! BusGo features an industry-first 3D Cabin POV simulator. Simply tap any seat on the real bus layout to preview the window scenery, pushback recline angle, reading light, and personal AC vent.'
    },
    {
      q: 'What is the BusGo cancellation and refund timeline?',
      a: 'If you cancel more than 24 hours prior to scheduled departure, you receive a guaranteed 90% instant refund. Between 12 to 24 hours, you receive a 50% refund. Refunds are processed immediately back to your original source payment.'
    },
    {
      q: 'How do intermediate boarding and dropping points work?',
      a: 'Every bus schedule lists verified boarding and dropping stops with calculated live offset timings (e.g. Silk Board Junction at +30m). You can select your most convenient pickup point directly during seat selection.'
    },
    {
      q: 'Are there any hidden convenience fees added at payment?',
      a: 'No. BusGo strictly adheres to transparent pricing. The fare shown on the bus card is the final total payable amount, with zero extra booking surcharges.'
    }
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
      if (timeWindowFilter) params.timeWindow = timeWindowFilter;
      if (sortBy) params.sortBy = sortBy;
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
  }, [timeWindowFilter, sortBy, busTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrips();
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSwapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSelectPopularRoute = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    setTimeout(() => {
      fetchTrips();
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenSeatMap = async (tripId: string) => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setActiveSeatMapTrip(res.data.data);
    } catch {
      alert('Failed to load trip details. Please try again.');
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-[36px] bg-[#101828] text-white overflow-hidden shadow-2xl border border-slate-800">
        {/* Background Travel Banner Image with Dark Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&auto=format&fit=crop&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101828] via-[#101828]/90 to-blue-900/40 pointer-events-none" />
        <div className="absolute top-0 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 sm:px-12 pt-12 sm:pt-16 pb-16 max-w-6xl mx-auto space-y-10">
          {/* Main Hero Headlines */}
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-orange-400">
              <Sparkles className="w-4 h-4" />
              <span>India's Verified Travel-Tech Intercity Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Your Journey <span className="text-[#FF8A3D]">Begins Here.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Discover comfortable rides, explore destinations, and book your next journey with confidence. Featuring Volvo 9600 Multi-Axle sleeper coaches and transparent boarding stops.
            </p>
          </div>

          {/* Floating Bus Search Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 text-slate-900">
            {/* Trip Type Selector */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer text-slate-900">
                <input
                  type="radio"
                  name="tripType"
                  checked={!isRoundTrip}
                  onChange={() => setIsRoundTrip(false)}
                  className="accent-blue-600"
                />
                <span>One Way Trip</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-900">
                <input
                  type="radio"
                  name="tripType"
                  checked={isRoundTrip}
                  onChange={() => setIsRoundTrip(true)}
                  className="accent-blue-600"
                />
                <span>Round Trip (Return Option)</span>
              </label>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* From City */}
                <div className="md:col-span-3 relative">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>From City</span>
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* City Swap Button */}
                <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    title="Swap Source and Destination"
                    className="w-10 h-10 rounded-2xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center border border-blue-200 shadow-sm transition-all transform active:rotate-180 duration-300"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* To City */}
                <div className="md:col-span-3 relative">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>To City</span>
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chennai"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Journey Date */}
                <div className="md:col-span-3 relative">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Journey Date</span>
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Passenger Count */}
                <div className="md:col-span-2 relative">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-700" />
                    <span>Passengers</span>
                  </label>
                  <select
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="w-full text-xs font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Seat' : 'Seats'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Return Date if Round Trip */}
              {isRoundTrip && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                  <div className="md:col-span-6 relative">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Return Journey Date (Optional)
                    </label>
                    <input
                      type="date"
                      min={travelDate}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* Fast Dates & Search CTA Button */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Fast Dates:</span>
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: '+2 Days', days: 2 },
                    { label: 'This Weekend', days: 3 }
                  ].map((item) => {
                    const targetDate = formatOffsetDate(item.days);
                    const isSelected = travelDate === targetDate;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setTravelDate(targetDate);
                          setTimeout(fetchTrips, 50);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search Buses</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 2. LIVE BUS SEARCH RESULTS & FILTER SECTION */}
      <div ref={resultsRef} className="space-y-6">
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Available Buses on Route: <span className="text-blue-600">{origin} → {destination}</span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              Travel Date: {travelDate} • {trips.length} Verified Schedules Available
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Seat Locking</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Filter Schedules</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBusTypeFilter('');
                    setTimeWindowFilter('');
                    setSortBy('time_asc');
                    setMaxPriceFilter(2000);
                    setTimeout(fetchTrips, 10);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Sort Results By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="time_asc">Departure: Earliest First</option>
                  <option value="price_asc">Price: Lowest to Highest</option>
                  <option value="price_desc">Price: Highest to Lowest</option>
                  <option value="rating_desc">Operator Rating: Highest First</option>
                  <option value="duration_asc">Duration: Fastest Route</option>
                </select>
              </div>

              {/* Bus Comfort Class */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Bus Class & Comfort
                </label>
                <div className="space-y-1.5">
                  {[
                    { label: 'All Bus Classes', value: '' },
                    { label: 'AC Sleeper (2+1 Berths)', value: 'AC_SLEEPER' },
                    { label: 'AC Seater (2+2 Luxury)', value: 'AC_SEATER' },
                    { label: 'Non-AC Express', value: 'NON_AC_SEATER' }
                  ].map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="busClass"
                        checked={busTypeFilter === item.value}
                        onChange={() => setBusTypeFilter(item.value)}
                        className="accent-blue-600"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departure Windows */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Departure Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Morning (6-12)', value: 'morning', icon: Sun },
                    { label: 'Afternoon (12-18)', value: 'afternoon', icon: Sun },
                    { label: 'Evening (18-23)', value: 'evening', icon: Moon },
                    { label: 'Night (23-6)', value: 'night', icon: Moon }
                  ].map((tw) => {
                    const Icon = tw.icon;
                    const active = timeWindowFilter === tw.value;
                    return (
                      <button
                        key={tw.value}
                        type="button"
                        onClick={() => setTimeWindowFilter(active ? '' : tw.value)}
                        className={`py-2 px-2.5 rounded-xl border text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                          active
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{tw.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-2">
                  <span>Max Ticket Price</span>
                  <span className="text-blue-600 font-extrabold">₹{maxPriceFilter}</span>
                </div>
                <input
                  type="range"
                  min={350}
                  max={2500}
                  step={50}
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  onMouseUp={fetchTrips}
                  onTouchEnd={fetchTrips}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4 shadow-sm"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-10 bg-slate-100 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Bus className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  No scheduled buses found for this date
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try searching another departure date, or pick one of our popular corridors like Bengaluru → Chennai, Mumbai → Goa, or Delhi → Jaipur.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('Bengaluru');
                    setDestination('Chennai');
                    setTravelDate(todayStr);
                    setTimeout(fetchTrips, 50);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/20 transition-all"
                >
                  View Bengaluru → Chennai Schedules
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => {
                  const available = trip.inventory.availableSeats;
                  const total = trip.inventory.totalSeats;
                  const boardingCount = trip.route.boardingPoints?.length || 4;
                  const droppingCount = trip.route.droppingPoints?.length || 3;

                  return (
                    <div
                      key={trip.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group"
                    >
                      {/* Operator & Bus Specs */}
                      <div className="space-y-2 min-w-[240px]">
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                            {trip.bus.operator?.name}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-black shadow-sm">
                            <Star className="w-3 h-3 fill-emerald-600 stroke-none" />
                            <span>{trip.bus.operator?.rating || 4.8}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                          <span className="truncate max-w-[190px]">{trip.bus.model}</span>
                          <span>•</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase border border-blue-200">
                            {trip.bus.busType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Amenities */}
                        <div className="flex items-center gap-3 pt-1 text-slate-500">
                          {trip.bus.hasWifi && (
                            <div className="flex items-center gap-1 text-[11px] font-bold" title="5G Wi-Fi">
                              <Wifi className="w-3.5 h-3.5 text-blue-600" />
                              <span>Wi-Fi</span>
                            </div>
                          )}
                          {trip.bus.hasCharging && (
                            <div className="flex items-center gap-1 text-[11px] font-bold" title="In-Seat Charging">
                              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Charging</span>
                            </div>
                          )}
                          {trip.bus.hasWaterBottle && (
                            <div className="flex items-center gap-1 text-[11px] font-bold" title="Complimentary Water">
                              <Coffee className="w-3.5 h-3.5 text-orange-500" />
                              <span>Water</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[11px] font-bold" title="Live Tracking">
                            <Zap className="w-3.5 h-3.5 text-purple-600" />
                            <span>GPS</span>
                          </div>
                        </div>

                        {/* Boarding / Dropping Count Pill */}
                        <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200">
                            📍 {boardingCount} Boarding Stops
                          </span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-slate-50 rounded-md border border-slate-200">
                            📍 {droppingCount} Dropping Stops
                          </span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <div className="text-xl font-black text-slate-900">
                            {trip.departureTime}
                          </div>
                          <div className="text-xs font-extrabold text-slate-500">
                            {trip.route.sourceCity}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs font-black text-slate-800">
                            {calculateDuration(trip.departureTime, trip.arrivalTime, trip.route.distanceKm)}
                          </div>
                          <div className="w-24 h-1 bg-slate-200 rounded-full relative flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-blue-600 shadow" />
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            {trip.route.distanceKm} km • Direct
                          </div>
                        </div>

                        <div>
                          <div className="text-xl font-black text-slate-900 flex items-center justify-center">
                            <span>{trip.arrivalTime}</span>
                            {isNextDay(trip.departureTime, trip.arrivalTime) && (
                              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-1 border border-blue-200">
                                +1D
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-extrabold text-slate-500">
                            {trip.route.destinationCity}
                          </div>
                        </div>
                      </div>

                      {/* Fare & View Seats Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Starting Fare
                          </div>
                          <div className="text-2xl font-black text-blue-600">
                            ₹{trip.baseFare.toLocaleString()}
                          </div>
                          <div className="text-[11px] font-bold mt-0.5">
                            {available > 10 ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                {available} Seats Free
                              </span>
                            ) : available > 0 ? (
                              <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-bold">
                                Only {available} Left!
                              </span>
                            ) : (
                              <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={available === 0}
                          onClick={() => handleOpenSeatMap(trip.id)}
                          className="py-3 px-5 bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-black rounded-2xl transition-all shadow-md flex items-center gap-2 transform active:scale-95 group/btn"
                        >
                          <Bus className="w-4 h-4 text-orange-400 group-hover/btn:text-white" />
                          <span>View Seats & 3D POV</span>
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
            fetchTrips();
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
