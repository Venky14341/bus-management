import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  ShieldCheck,
  Star,
  Eye,
  Bus,
  Clock,
  Tag,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Zap,
  Coffee,
  BatteryCharging,
  Wifi,
  Phone,
  Gift,
  HelpCircle,
  Smartphone
} from 'lucide-react';

interface HomeViewProps {
  onSearch: (origin: string, destination: string, travelDate: string) => void;
  onOpenSeatPOV?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSearch, onOpenSeatPOV }) => {
  const formatOffsetDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatOffsetDate(0);
  const [origin, setOrigin] = useState('Bengaluru');
  const [destination, setDestination] = useState('Chennai');
  const [travelDate, setTravelDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(origin, destination, travelDate);
  };

  const handleQuickRoute = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    onSearch(from, to, travelDate);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const popularRoutes = [
    { from: 'Bengaluru', to: 'Chennai', fare: '₹650', duration: '5h 45m', distance: '350 km', frequency: '22 daily buses', tag: 'Fastest Corridor', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80' },
    { from: 'Bengaluru', to: 'Hyderabad', fare: '₹890', duration: '8h 45m', distance: '570 km', frequency: '20 daily buses', tag: 'Luxury Sleepers', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=600&auto=format&fit=crop&q=80' },
    { from: 'Bengaluru', to: 'Goa', fare: '₹1,450', duration: '11h 15m', distance: '560 km', frequency: '10 daily buses', tag: 'Night Lounge', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80' },
    { from: 'Mumbai', to: 'Pune', fare: '₹350', duration: '3h 30m', distance: '150 km', frequency: '16 daily buses', tag: 'Super Express', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80' },
    { from: 'Delhi', to: 'Jaipur', fare: '₹420', duration: '5h 15m', distance: '280 km', frequency: '16 daily buses', tag: 'Royal NH48', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80' },
    { from: 'Delhi', to: 'Manali', fare: '₹1,550', duration: '12h 45m', distance: '540 km', frequency: '8 daily buses', tag: 'Himalayan Luxury', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80' },
    { from: 'Mumbai', to: 'Goa', fare: '₹1,300', duration: '12h 00m', distance: '580 km', frequency: '10 daily buses', tag: 'Coastal Line', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80' },
    { from: 'Hyderabad', to: 'Vijayawada', fare: '₹520', duration: '4h 45m', distance: '275 km', frequency: '12 daily buses', tag: 'Highway Shuttle', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80' }
  ];

  const destinations = [
    {
      name: 'Goa',
      state: 'Coastal Paradise',
      fare: 'From ₹950',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      tag: 'Beaches & Nightlife',
      from: 'Bengaluru'
    },
    {
      name: 'Manali',
      state: 'Himachal Pradesh',
      fare: 'From ₹1,250',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
      tag: 'Snow Peaks & Valleys',
      from: 'Delhi'
    },
    {
      name: 'Jaipur',
      state: 'Rajasthan',
      fare: 'From ₹420',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop&q=80',
      tag: 'Pink City & Forts',
      from: 'Delhi'
    },
    {
      name: 'Bengaluru',
      state: 'Karnataka',
      fare: 'From ₹650',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
      tag: 'Silicon Valley Hub',
      from: 'Chennai'
    },
    {
      name: 'Chennai',
      state: 'Tamil Nadu',
      fare: 'From ₹650',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
      tag: 'Marina Coastal Line',
      from: 'Bengaluru'
    },
    {
      name: 'Hyderabad',
      state: 'Telangana',
      fare: 'From ₹890',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=800&auto=format&fit=crop&q=80',
      tag: 'City of Pearls',
      from: 'Bengaluru'
    }
  ];

  const operators = [
    {
      name: 'VRL Travels',
      rating: 4.9,
      reviews: '128K+',
      fleet: 'Volvo 9600 & Scania Multi-Axle',
      desc: 'Karnataka & Pan-India Pioneer in luxury sleeper coaches.',
      badge: 'Platinum Partner',
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'KSRTC Ambari Utsav',
      rating: 4.9,
      reviews: '210K+',
      fleet: 'Dream Class Volvo 15M Sleeper',
      desc: 'State-of-the-art government luxury sleeper service.',
      badge: 'State Flagship',
      photo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Orange Tours & Travels',
      rating: 4.8,
      reviews: '95K+',
      fleet: 'Mercedes-Benz & Scania Metrolink',
      desc: 'Punctuality champions across Telangana & AP corridors.',
      badge: 'Super Fast',
      photo: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'IntrCity SmartBus',
      rating: 4.8,
      reviews: '64K+',
      fleet: 'SmartBus Multi-Axle Lounge',
      desc: 'Lounge boarding, bus captains & sanitized washrooms.',
      badge: 'Smart Fleet',
      photo: 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Zingbus Electric',
      rating: 4.7,
      reviews: '42K+',
      fleet: 'Green Long-Range Electric & AC',
      desc: 'Eco-friendly, zero carbon intercity travel network.',
      badge: 'Eco Green',
      photo: 'https://images.unsplash.com/photo-1525962898597-a4ae6402826e?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Royal Express Luxury',
      rating: 4.8,
      reviews: '52K+',
      fleet: 'Diamond Class Volvo Lounge',
      desc: 'High-speed overnight sleepers with personal entertainment.',
      badge: 'Luxury Suite',
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const faqs = [
    {
      q: 'How does BusGo ensure real-time seat locking without double bookings?',
      a: 'BusGo connects directly to our transactional engine using ACID-compliant locks. When you tap a seat, our system temporarily locks that inventory, preventing any two users from booking the same seat simultaneously.'
    },
    {
      q: 'Can I view the actual bus interior and passenger window perspective before booking?',
      a: 'Yes! BusGo features an industry-first 3D Cabin POV simulator. Simply tap any seat to preview the window scenery, pushback recline angle, reading lamp spotlight, and rotary AC vent in 3D.'
    },
    {
      q: 'What is the BusGo cancellation and refund policy?',
      a: 'If you cancel more than 24 hours prior to departure, you receive a guaranteed 90% instant refund. Between 12 to 24 hours, you receive a 50% refund. Refunds are simulated and processed immediately back to your original payment.'
    },
    {
      q: 'How are bus travel durations calculated?',
      a: 'All durations are realistically calculated based on verified highway route distances (e.g., 350 km between Bengaluru and Chennai takes ~5h 45m). We display accurate arrival times including next-day indicators for overnight journeys.'
    },
    {
      q: 'Are there any hidden convenience fees added at payment?',
      a: 'None! BusGo strictly enforces transparent pricing. The fare shown on the bus card is the exact final total payable amount, with zero extra booking surcharges.'
    }
  ];

  return (
    <div className="space-y-20 pb-24 animate-in fade-in duration-300">
      {/* 1. HERO SECTION WITH SEARCH WIDGET */}
      <section className="relative rounded-[36px] bg-[#101828] text-white overflow-hidden shadow-2xl border border-slate-800">
        {/* Background Travel Banner Image with Dark Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#FF8A3D]">
              <Sparkles className="w-4 h-4" />
              <span>India's Verified Travel-Tech Intercity Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Your Journey <span className="text-[#FF8A3D]">Begins Here.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
              Discover ultra-comfortable rides, explore scenic Indian destinations, and book verified sleeper & seater coaches with live 3D window perspective previews.
            </p>
          </div>

          {/* Large Floating Bus Search Widget */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 text-[#101828] shadow-2xl border border-slate-100">
            {/* Quick Trip Type Tabs */}
            <div className="flex items-center gap-6 mb-6 border-b border-slate-100 pb-4 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  checked={!isRoundTrip}
                  onChange={() => setIsRoundTrip(false)}
                  className="accent-blue-600"
                />
                <span className={!isRoundTrip ? 'text-blue-600 font-black' : 'text-slate-500'}>
                  One Way Journey
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tripType"
                  checked={isRoundTrip}
                  onChange={() => setIsRoundTrip(true)}
                  className="accent-blue-600"
                />
                <span className={isRoundTrip ? 'text-blue-600 font-black' : 'text-slate-500'}>
                  Round Trip
                </span>
                <span className="text-[10px] bg-orange-100 text-[#FF8A3D] px-2 py-0.5 rounded-full font-black">
                  SAVE 15%
                </span>
              </label>
            </div>

            {/* Input Fields Grid */}
            <form onSubmit={handleSearchSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* From City */}
                <div className="md:col-span-3 bg-[#F7F9FC] border border-slate-200 rounded-2xl p-3 hover:border-blue-600 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>From City</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-[#101828] focus:outline-none pt-1"
                  />
                </div>

                {/* City Swap Button */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleSwap}
                    title="Swap Source and Destination"
                    className="w-10 h-10 rounded-2xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center border border-blue-200 shadow-sm transition-all transform active:rotate-180 duration-300"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* To City */}
                <div className="md:col-span-3 bg-[#F7F9FC] border border-slate-200 rounded-2xl p-3 hover:border-blue-600 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8A3D]" />
                    <span>To City</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-[#101828] focus:outline-none pt-1"
                  />
                </div>

                {/* Journey Date */}
                <div className="md:col-span-3 bg-[#F7F9FC] border border-slate-200 rounded-2xl p-3 hover:border-blue-600 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Departure Date</span>
                  </div>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-[#101828] focus:outline-none pt-1"
                  />
                </div>

                {/* Passengers */}
                <div className="md:col-span-2 bg-[#F7F9FC] border border-slate-200 rounded-2xl p-3 hover:border-blue-600 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Passengers</span>
                  </div>
                  <select
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold text-[#101828] focus:outline-none pt-1"
                  >
                    <option value={1}>1 Traveler</option>
                    <option value={2}>2 Travelers</option>
                    <option value={3}>3 Travelers</option>
                    <option value={4}>4 Travelers</option>
                    <option value={5}>5 Travelers</option>
                    <option value={6}>6 Travelers</option>
                  </select>
                </div>
              </div>

              {/* Action Button & Fast Date Selector Pills */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">Fast Date:</span>
                  <button
                    type="button"
                    onClick={() => setTravelDate(formatOffsetDate(0))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                      travelDate === formatOffsetDate(0)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#F7F9FC] text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelDate(formatOffsetDate(1))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                      travelDate === formatOffsetDate(1)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#F7F9FC] text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelDate(formatOffsetDate(2))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                      travelDate === formatOffsetDate(2)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-[#F7F9FC] text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    Day After
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Buses</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Route Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 text-xs">
            <span className="font-bold text-slate-400">Popular Corridors:</span>
            {popularRoutes.slice(0, 5).map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                onClick={() => handleQuickRoute(r.from, r.to)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition-all text-[11px] font-semibold flex items-center gap-1.5"
              >
                <span>{r.from} ➔ {r.to}</span>
                <span className="text-[#FF8A3D] font-bold">{r.fare}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. EXCLUSIVE OFFERS & PROMO CAROUSEL */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
              <Gift className="w-4 h-4 text-[#FF8A3D]" />
              <span>Special Perks & Travel Coupons</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
              Exclusive Discounts on Top Corridors
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coupon 1 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                FIRST RIDE
              </span>
              <span className="text-xs font-bold text-orange-200">Save ₹200</span>
            </div>
            <div>
              <div className="text-2xl font-black">₹200 Instant Off</div>
              <p className="text-xs text-blue-100 mt-1">
                Valid on all Volvo 9600 & Scania Multi-Axle sleepers across India.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="font-mono text-sm font-black tracking-widest bg-black/20 px-3 py-1 rounded-lg">
                BUSGO200
              </span>
              <button
                type="button"
                onClick={() => handleCopy('BUSGO200')}
                className="px-3 py-1 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-all flex items-center gap-1 shadow-sm"
              >
                {copiedCoupon === 'BUSGO200' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoupon === 'BUSGO200' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Coupon 2 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#101828] to-slate-800 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-orange-500/20 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-orange-500/30 text-[#FF8A3D] text-[10px] font-black uppercase">
                FESTIVE SPECIAL
              </span>
              <span className="text-xs font-bold text-[#FF8A3D]">Save 15%</span>
            </div>
            <div>
              <div className="text-2xl font-black">15% Festive Saver</div>
              <p className="text-xs text-slate-300 mt-1">
                Discount on intercity weekend bookings across Bangalore, Chennai & Hyderabad.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="font-mono text-sm font-black tracking-widest bg-black/40 px-3 py-1 rounded-lg text-[#FF8A3D]">
                FESTIVE15
              </span>
              <button
                type="button"
                onClick={() => handleCopy('FESTIVE15')}
                className="px-3 py-1 rounded-xl bg-[#FF8A3D] text-white text-xs font-bold hover:bg-orange-600 transition-all flex items-center gap-1 shadow-sm"
              >
                {copiedCoupon === 'FESTIVE15' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoupon === 'FESTIVE15' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Coupon 3 */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                PEACE OF MIND
              </span>
              <span className="text-xs font-bold text-emerald-100">90% Refund</span>
            </div>
            <div>
              <div className="text-2xl font-black">Zero Cancel Penalty</div>
              <p className="text-xs text-emerald-100 mt-1">
                Guaranteed instant 90% simulated refund if cancelled 24 hours prior.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="font-mono text-sm font-black tracking-widest bg-black/20 px-3 py-1 rounded-lg">
                FLEXI90
              </span>
              <button
                type="button"
                onClick={() => handleCopy('FLEXI90')}
                className="px-3 py-1 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-1 shadow-sm"
              >
                {copiedCoupon === 'FLEXI90' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoupon === 'FLEXI90' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRENDING DESTINATIONS WITH PHOTOS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Explore India's Top Getaways</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
              Trending Travel Destinations
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => (
            <div
              key={d.name}
              onClick={() => handleQuickRoute(d.from, d.name)}
              className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200 cursor-pointer bg-white"
            >
              <div className="h-60 w-full overflow-hidden relative">
                <img
                  src={d.image}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold border border-white/25">
                  {d.tag}
                </span>
                <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black shadow-md">
                  {d.fare}
                </span>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-2xl font-black">{d.name}</h3>
                  <div className="text-xs text-slate-300 font-medium flex items-center justify-between mt-1">
                    <span>{d.state}</span>
                    <span className="text-orange-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Buses</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. POPULAR INTERCITY CORRIDORS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
              <Bus className="w-4 h-4 text-blue-600" />
              <span>High-Frequency Routes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
              Popular Intercity Routes & Fares
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularRoutes.map((r) => (
            <div
              key={`${r.from}-${r.to}`}
              onClick={() => handleQuickRoute(r.from, r.to)}
              className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {r.tag}
                  </span>
                  <span className="text-sm font-black text-[#101828]">{r.fare}</span>
                </div>

                <div className="text-base font-black text-[#101828] group-hover:text-blue-600 transition-colors">
                  {r.from} ➔ {r.to}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{r.duration}</span>
                  </span>
                  <span>•</span>
                  <span>{r.distance}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-blue-600">
                <span>{r.frequency}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE 3D BUS CABIN FEATURE HIGHLIGHT */}
      <section className="rounded-3xl bg-[#101828] text-white p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 text-[#FF8A3D] border border-orange-500/30 text-xs font-bold">
              <Eye className="w-4 h-4" />
              <span>Industry-First Innovation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Real Bus Cabin & <span className="text-blue-400">3D Window Perspective</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Never guess your seat location again. With BusGo, step inside the virtual coach before you book. Preview actual window views (expressway, sunset, mountains), test 180° flatbed recline angles, control rotary reading lamps, and inspect charging ports.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FF8A3D]" />
                <span>3D Viewport</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>65W Fast Charge</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>ACID Seat Locks</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => onSearch('Bengaluru', 'Chennai', travelDate)}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>Select a Bus & Experience 3D Seats</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border-2 border-slate-700 bg-slate-900 p-4 shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"
                alt="Bus Cabin Simulator"
                className="w-full h-64 object-cover rounded-2xl shadow-inner"
              />
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <div className="text-xs font-black text-[#FF8A3D]">Volvo 9600 Sleeper Saloon</div>
                  <div className="text-[11px] text-slate-300">Live Scenery Simulator • Pushback Berth Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECOMMENDED FLEET OPERATORS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Fleet Partners</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
              Recommended Bus Operators
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operators.map((op) => (
            <div
              key={op.name}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {op.badge}
                  </span>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-black border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{op.rating}</span>
                    <span className="text-slate-400 font-normal">({op.reviews})</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-[#101828]">{op.name}</h3>
                <div className="text-xs font-bold text-blue-600">{op.fleet}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{op.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Wifi className="w-3.5 h-3.5" />
                  <BatteryCharging className="w-3.5 h-3.5" />
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => onSearch('Bengaluru', 'Chennai', travelDate)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Find Buses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHY CHOOSE BUSGO VALUE PROPOSITIONS */}
      <section className="rounded-3xl bg-[#F7F9FC] border border-slate-200 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black">
            <span>THE BUSGO STANDARD</span>
          </div>
          <h2 className="text-3xl font-black text-[#101828]">
            Why Millions Trust BusGo
          </h2>
          <p className="text-xs text-slate-500">
            Engineered from ground up to solve the real frustrations of intercity bus travelers across India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              🔒
            </div>
            <h3 className="text-sm font-black text-[#101828]">ACID Seat Locking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zero double bookings. Instant temporary inventory reservations guarantee your selected berth is strictly reserved.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8A3D] flex items-center justify-center font-black">
              💰
            </div>
            <h3 className="text-sm font-black text-[#101828]">Zero Hidden Charges</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              What you see is what you pay. No surprise convenience fees, internet handling charges, or mandatory seat surcharges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              ⚡
            </div>
            <h3 className="text-sm font-black text-[#101828]">Instant Tiered Refund</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transparent cancellation rules. Cancel up to 24 hours prior for a guaranteed 90% instant simulated refund.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              📍
            </div>
            <h3 className="text-sm font-black text-[#101828]">Live Stop Offsets</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exact pickup timings calculated for intermediate highway stops like Silk Board, Vellore, and Panvel.
            </p>
          </div>
        </div>
      </section>

      {/* 8. TRAVEL EXPERIENCE GALLERY */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-[#FF8A3D] text-xs font-black">
            <span>JOURNEY MOMENTS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
            Experience Travel Like Never Before
          </h2>
          <p className="text-xs text-slate-500">
            A glimpse into the comfort and memories created every night across 500+ Indian corridors.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-3xl overflow-hidden shadow-md h-52 group relative">
            <img
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80"
              alt="Luxury Coach"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3.5 text-white text-xs font-bold">
              Volvo 9600 Luxury Sleeper
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-md h-52 group relative">
            <img
              src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80"
              alt="Sunset Goa"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3.5 text-white text-xs font-bold">
              Sunset Coastal Roads
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-md h-52 group relative">
            <img
              src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80"
              alt="Mountain View"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3.5 text-white text-xs font-bold">
              Himalayan Scenic Route
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-md h-52 group relative">
            <img
              src="https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80"
              alt="Jaipur Palace"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3.5 text-white text-xs font-bold">
              Heritage Express
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 space-y-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div key={faq.q} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4"
                >
                  <span className="text-sm font-extrabold text-[#101828] hover:text-blue-600 transition-colors">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. APP DOWNLOAD BANNER */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black">
            BUSGO MOBILE EXPERIENCE
          </span>
          <h2 className="text-3xl font-black">
            Book Fast on the Go with BusGo
          </h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Instant mobile seat locking, boarding notifications, live bus radar GPS tracking, and offline e-ticket wallet.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center font-mono font-black text-slate-900 text-[10px] text-center p-2">
            [QR CODE] SCAN ME
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-extrabold text-white">Scan to Open Web App</div>
            <div className="text-[11px] text-blue-200">Available on Android & iOS</div>
            <div className="text-[10px] text-[#FF8A3D] font-bold">100% Secure & Verified</div>
          </div>
        </div>
      </section>
    </div>
  );
};
