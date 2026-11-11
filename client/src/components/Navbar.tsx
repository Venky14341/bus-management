import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import {
  Bus,
  User,
  Shield,
  Briefcase,
  FileText,
  ExternalLink,
  Ticket,
  Search,
  LogOut,
  Sparkles,
  ChevronDown,
  LogIn,
  UserPlus,
  Tag,
  Phone,
  Home,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, quickSwitchRole, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const openLogin = () => {
    setAuthMode('LOGIN');
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthMode('REGISTER');
    setShowAuthModal(true);
  };

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Name */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo('home')}
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-2xl tracking-tight text-[#101828]">
                    Bus<span className="text-blue-600">Go</span>
                  </span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF8A3D]" />
                </div>
                <div className="text-[10px] font-bold text-slate-500 hidden sm:block tracking-wider uppercase">
                  Travel With Confidence
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => navigateTo('home')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'home'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => navigateTo('search')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'search'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search Buses</span>
              </button>

              <button
                onClick={() => navigateTo('my-bookings')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'my-bookings'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>My Bookings</span>
              </button>

              <button
                onClick={() => navigateTo('offers')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'offers'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Tag className="w-4 h-4 text-[#FF8A3D]" />
                <span>Offers</span>
                <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[#FF8A3D] text-[9px] font-black">
                  NEW
                </span>
              </button>

              <button
                onClick={() => navigateTo('contact')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'contact'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Contact</span>
              </button>

              {(user?.role === 'OPERATOR' || user?.role === 'ADMIN') && (
                <button
                  onClick={() => navigateTo('operator')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    activeTab === 'operator'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#101828]" />
                  <span>Operator Portal</span>
                </button>
              )}

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => navigateTo('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#FF8A3D]" />
                  <span>Admin Suite</span>
                </button>
              )}
            </nav>

            {/* Right Controls: Role Switcher & Auth */}
            <div className="flex items-center gap-3">
              {/* Demo Role Switcher */}
              <div className="hidden xl:flex items-center bg-[#F7F9FC] p-1 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black text-slate-500 px-2 uppercase tracking-wider">
                  Demo:
                </span>
                <button
                  onClick={() => quickSwitchRole('PASSENGER')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-xl transition-all ${
                    user?.role === 'PASSENGER'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#101828]'
                  }`}
                >
                  Passenger
                </button>
                <button
                  onClick={() => quickSwitchRole('OPERATOR')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-xl transition-all ${
                    user?.role === 'OPERATOR'
                      ? 'bg-[#101828] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#101828]'
                  }`}
                >
                  Operator
                </button>
                <button
                  onClick={() => quickSwitchRole('ADMIN')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-xl transition-all ${
                    user?.role === 'ADMIN'
                      ? 'bg-[#FF8A3D] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#101828]'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* User Profile or Sign In / Sign Up */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-black text-[#101828] leading-tight">
                        {user.name}
                      </div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="text-xs font-black text-[#101828]">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('my-bookings');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Ticket className="w-4 h-4 text-blue-600" />
                          <span>My Bookings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openLogin();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4 text-[#FF8A3D]" />
                          <span>Switch Account</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openLogin}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-[#101828] hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5 text-blue-600" />
                    <span>Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={openRegister}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2.5 rounded-2xl bg-white border border-slate-200 text-[#101828] hover:bg-slate-50"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
            <button
              onClick={() => navigateTo('home')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => navigateTo('search')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Buses</span>
            </button>

            <button
              onClick={() => navigateTo('my-bookings')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 ${
                activeTab === 'my-bookings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Bookings</span>
            </button>

            <button
              onClick={() => navigateTo('offers')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 ${
                activeTab === 'offers'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-4 h-4 text-[#FF8A3D]" />
              <span>Offers & Coupons</span>
            </button>

            <button
              onClick={() => navigateTo('contact')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 ${
                activeTab === 'contact'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>24x7 Customer Support</span>
            </button>

            {(user?.role === 'OPERATOR' || user?.role === 'ADMIN') && (
              <button
                onClick={() => navigateTo('operator')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 ${
                  activeTab === 'operator'
                    ? 'bg-[#101828] text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Operator Fleet Portal</span>
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigateTo('admin')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#FF8A3D] text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Platform Admin Suite</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
};
