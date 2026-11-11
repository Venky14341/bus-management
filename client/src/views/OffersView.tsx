import React, { useState } from 'react';
import { Tag, Sparkles, Copy, Check, Percent, ArrowRight, ShieldCheck, Gift, Clock } from 'lucide-react';

interface OffersViewProps {
  onApplyPromo?: (code: string) => void;
  onBookNow?: () => void;
}

export const OffersView: React.FC<OffersViewProps> = ({ onApplyPromo, onBookNow }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const offers = [
    {
      code: 'BUSGO200',
      title: 'Flat ₹200 OFF on First Booking',
      desc: 'Valid on all Volvo 9600, Scania Multi-Axle and AC Sleeper routes across India. Minimum booking ₹600.',
      discount: '₹200 OFF',
      validTill: '31 Dec 2026',
      badge: 'FIRST RIDE SPECIAL',
      category: 'New User'
    },
    {
      code: 'FLEXI90',
      title: 'Zero Cancellation Fee Protection',
      desc: 'Get 90% instant refund on cancellation up to 12 hours prior to scheduled departure.',
      discount: '90% REFUND',
      validTill: 'Always Active',
      badge: 'PEACE OF MIND',
      category: 'Flexible Travel'
    },
    {
      code: 'VOLVOLUXE',
      title: '15% Off Premium Sleeper Cabins',
      desc: 'Enjoy luxury long-distance travel on KSRTC Ambari Utsav & VRL Travels overnight lines.',
      discount: '15% OFF',
      validTill: 'Limited Time',
      badge: 'FLEET SPECIAL',
      category: 'Luxury Line'
    },
    {
      code: 'WEEKEND100',
      title: 'Flat ₹100 Weekend Getaway',
      desc: 'Exclusive discount on Friday to Sunday departures for Goa, Manali, Jaipur, and Ooty.',
      discount: '₹100 OFF',
      validTill: 'Every Weekend',
      badge: 'WEEKEND ESCAPE',
      category: 'Holiday'
    },
    {
      code: 'STUDENT50',
      title: 'Campus Traveler Discount',
      desc: 'Special fare reduction for university students with valid institutional student IDs.',
      discount: '₹150 OFF',
      validTill: 'Academic Year 2026',
      badge: 'STUDENT PASS',
      category: 'Students'
    },
    {
      code: 'CORPORATEPASS',
      title: 'Business Commuter Pass',
      desc: 'Book 3 or more seats on executive dayliner routes and unlock bulk corporate discounts.',
      discount: '20% OFF',
      validTill: 'Ongoing',
      badge: 'BUSINESS CLASS',
      category: 'Corporate'
    }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onApplyPromo) onApplyPromo(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Offers Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 text-white p-8 sm:p-12 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-[#FF8A3D] border border-orange-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BusGo Verified Promo Codes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Exclusive Deals & Travel Coupons
          </h1>
          <p className="text-sm text-slate-300">
            Save extra on every intercity journey with official BusGo discount codes, cashback perks, and zero convenience fee guarantees.
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const isCopied = copiedCode === offer.code;

          return (
            <div
              key={offer.code}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {offer.badge}
                  </span>
                  <div className="text-xs font-bold text-[#FF8A3D] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{offer.discount}</span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-[#172033] group-hover:text-blue-600 transition-colors">
                  {offer.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {offer.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{offer.validTill}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(offer.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-blue-600'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{offer.code}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Callout */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#172033]">
              Zero Hidden Convenience Charges
            </h4>
            <p className="text-xs text-slate-500">
              Unlike other platforms that charge surprise booking fees at the final step, BusGo guarantees 100% transparent pricing.
            </p>
          </div>
        </div>

        {onBookNow && (
          <button
            type="button"
            onClick={onBookNow}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 shrink-0"
          >
            <span>Book a Bus Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
