import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { TripSearchView } from './views/TripSearchView';
import { MyBookingsView } from './views/MyBookingsView';
import { OffersView } from './views/OffersView';
import { ContactView } from './views/ContactView';
import { OperatorPortalView } from './views/OperatorPortalView';
import { AdminPortalView } from './views/AdminPortalView';
import {
  Bus,
  ShieldCheck,
  Heart,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchParams, setSearchParams] = useState({
    origin: 'Bengaluru',
    destination: 'Chennai',
    travelDate: ''
  });
  const { user } = useAuth();

  const handleHomeSearch = (origin: string, destination: string, travelDate: string) => {
    setSearchParams({ origin, destination, travelDate });
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#172033]">
      {/* Sticky Commercial Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'home' && <HomeView onSearch={handleHomeSearch} />}
        {activeTab === 'search' && (
          <TripSearchView
            initialOrigin={searchParams.origin}
            initialDestination={searchParams.destination}
            initialDate={searchParams.travelDate}
          />
        )}
        {activeTab === 'my-bookings' && <MyBookingsView />}
        {activeTab === 'offers' && (
          <OffersView
            onBookNow={() => {
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {activeTab === 'contact' && <ContactView />}
        {activeTab === 'operator' && (user?.role === 'OPERATOR' || user?.role === 'ADMIN') && (
          <OperatorPortalView />
        )}
        {activeTab === 'admin' && user?.role === 'ADMIN' && <AdminPortalView />}
      </main>

      {/* Premium Commercial Travel Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 font-black text-xl text-[#101828]">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Bus className="w-4 h-4" />
                </div>
                <span>
                  Bus<span className="text-blue-600">Go</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                India's verified intercity luxury bus network. Connecting travelers across Karnataka, Tamil Nadu, Maharashtra, Telangana, Delhi, and Goa with guaranteed comfort and transparent pricing.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>API Server Operational • Live</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <div className="font-extrabold text-[#101828] uppercase tracking-wider text-xs">
                Quick Navigation
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    Home Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('search');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    Search Buses & Schedules
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('my-bookings');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    My Bookings & PNR Status
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('offers');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    Exclusive Promo Offers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    24x7 Customer Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Top Routes */}
            <div className="space-y-3">
              <div className="font-extrabold text-[#101828] uppercase tracking-wider text-xs">
                Premier Corridors
              </div>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>Bengaluru ➔ Chennai (22 Daily Buses)</li>
                <li>Bengaluru ➔ Hyderabad (20 Daily Buses)</li>
                <li>Mumbai ➔ Pune (16 Daily Buses)</li>
                <li>Delhi ➔ Jaipur (16 Daily Buses)</li>
                <li>Mumbai ➔ Goa (10 Daily Buses)</li>
              </ul>
            </div>

            {/* Security & Partners */}
            <div className="space-y-3">
              <div className="font-extrabold text-[#101828] uppercase tracking-wider text-xs">
                Verified Security
              </div>
              <p className="text-xs text-slate-500">
                All transactions are encrypted with 256-bit SSL and protected by ACID concurrency locks.
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs font-bold text-[#101828]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PCI-DSS Compliant Gateway</span>
              </div>
              <div className="pt-1">
                <a
                  href={
                    import.meta.env.VITE_API_BASE_URL
                      ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')}/api-docs`
                      : '/api-docs'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  <span>OpenAPI 3.0 Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 <span className="font-bold text-[#101828]">BusGo Mobility Technologies</span>. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Passenger Grievance Redressal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
