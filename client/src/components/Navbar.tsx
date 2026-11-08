import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bus, User, Shield, Briefcase, FileText, ExternalLink, Ticket, Search, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, quickSwitchRole, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('search')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Algions<span className="text-rose-600">Bus</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Enterprise
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'search'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Search & Book
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'my-bookings'
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Bookings
            </button>

            {(user?.role === 'OPERATOR' || user?.role === 'ADMIN') && (
              <button
                onClick={() => setActiveTab('operator')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'operator'
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Operator Portal
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Suite
              </button>
            )}

            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              title="OpenAPI / Swagger Documentation"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>API Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </nav>

          {/* Quick Demo Role Switcher & User Status */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">
                Demo Role:
              </span>
              <button
                onClick={() => quickSwitchRole('PASSENGER')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  user?.role === 'PASSENGER'
                    ? 'bg-white text-rose-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Passenger
              </button>
              <button
                onClick={() => quickSwitchRole('OPERATOR')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  user?.role === 'OPERATOR'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Operator
              </button>
              <button
                onClick={() => quickSwitchRole('ADMIN')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  user?.role === 'ADMIN'
                    ? 'bg-white text-purple-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Profile Pill */}
            {user ? (
              <div className="flex items-center gap-2 pl-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                  <div className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                    {user.role}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-around bg-slate-50 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('search')}
          className={`py-1.5 px-3 rounded-lg ${activeTab === 'search' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'}`}
        >
          Search
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`py-1.5 px-3 rounded-lg ${activeTab === 'my-bookings' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'}`}
        >
          Bookings
        </button>
        {(user?.role === 'OPERATOR' || user?.role === 'ADMIN') && (
          <button
            onClick={() => setActiveTab('operator')}
            className={`py-1.5 px-3 rounded-lg ${activeTab === 'operator' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'}`}
          >
            Operator
          </button>
        )}
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-1.5 px-3 rounded-lg ${activeTab === 'admin' ? 'bg-rose-100 text-rose-700' : 'text-slate-600'}`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
