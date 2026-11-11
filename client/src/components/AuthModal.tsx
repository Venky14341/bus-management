import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Bus
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'LOGIN' | 'REGISTER';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'LOGIN'
}) => {
  const { login, register, quickSwitchRole } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'PASSENGER' | 'OPERATOR'>('PASSENGER');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
        setSuccessMsg('Welcome back! You are now logged in.');
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          role
        });
        setSuccessMsg('Account registered successfully! Welcome aboard.');
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'PASSENGER' | 'OPERATOR' | 'ADMIN') => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await quickSwitchRole(demoRole);
      setSuccessMsg(`Switched to Demo ${demoRole} profile!`);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white text-[#101828] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-200 bg-[#F7F9FC]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#101828] leading-tight">
                Bus<span className="text-blue-600">Go</span> Account
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {mode === 'LOGIN' ? 'Sign in to access your bookings' : 'Create your verified traveler pass'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-[#101828] hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center p-1 bg-[#F7F9FC] rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                mode === 'LOGIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-[#101828]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                mode === 'REGISTER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-[#101828]'
              }`}
            >
              New Account
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-600 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-600 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'REGISTER' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F7F9FC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#101828] font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F7F9FC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#101828] font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('PASSENGER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'PASSENGER'
                        ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                        : 'bg-[#F7F9FC] border-slate-200 text-slate-500 hover:bg-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Passenger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('OPERATOR')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'OPERATOR'
                        ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                        : 'bg-[#F7F9FC] border-slate-200 text-slate-500 hover:bg-white'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Fleet Operator</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F7F9FC] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#101828] font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F7F9FC] border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#101828] font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-[#101828]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'LOGIN' ? 'Sign In to BusGo' : 'Complete Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* One-Click Instant Demo Access */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-200 bg-[#F7F9FC]">
          <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A3D]" />
            <span>Instant One-Click Demo Profiles</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo('PASSENGER')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-600 hover:shadow-sm text-left transition-all"
            >
              <div className="text-[11px] font-extrabold text-blue-600">
                Passenger
              </div>
              <div className="text-[10px] text-slate-500 truncate">Rahul M.</div>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo('OPERATOR')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-600 hover:shadow-sm text-left transition-all"
            >
              <div className="text-[11px] font-extrabold text-[#101828]">
                Operator
              </div>
              <div className="text-[10px] text-slate-500 truncate">Royal Express</div>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo('ADMIN')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-600 hover:shadow-sm text-left transition-all"
            >
              <div className="text-[11px] font-extrabold text-[#FF8A3D]">
                Admin
              </div>
              <div className="text-[10px] text-slate-500 truncate">Root Suite</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
