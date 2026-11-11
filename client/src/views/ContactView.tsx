import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ShieldCheck,
  Send,
  CheckCircle2,
  HelpCircle,
  Bus,
  LifeBuoy
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pnr: '',
    subject: 'Booking Inquiry',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        pnr: '',
        subject: 'Booking Inquiry',
        message: ''
      });
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 text-white p-8 sm:p-12 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-[#FF8A3D] border border-orange-500/30 text-xs font-bold">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>24x7 Traveler Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            We're Here to Help You Journey Smoothly
          </h1>
          <p className="text-sm text-slate-300">
            Have questions about seat reservations, boarding point changes, luggage limits, or refund statuses? Our dedicated support team is available 24 hours a day, 7 days a week.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-[#172033]">
              Direct Contact Channels
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F7F9FC] border border-slate-200/60">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172033]">Toll-Free Customer Care</div>
                  <div className="text-sm font-extrabold text-blue-600 font-mono">1800-202-BUSGO</div>
                  <div className="text-[11px] text-slate-500">Available 24x7 in English, Hindi, Kannada, Tamil & Telugu</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F7F9FC] border border-slate-200/60">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF8A3D] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172033]">Email Support</div>
                  <div className="text-sm font-extrabold text-[#172033]">support@busgo.in</div>
                  <div className="text-[11px] text-slate-500">Guaranteed response within 15 minutes</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F7F9FC] border border-slate-200/60">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172033]">Corporate Headquarters</div>
                  <div className="text-xs font-semibold text-[#172033]">
                    BusGo Mobility Technologies Private Limited
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Prestige Tech Cloud, 100 Ft Road, Indiranagar, Bengaluru 560038
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Grievance Resolution Guarantee */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
              <div className="text-xs text-blue-900 font-semibold leading-relaxed">
                Emergency On-Road Helpline: If you face any boarding issues at intermediate stops, our operations center dispatches immediate operator escalation within 3 minutes.
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#172033]">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill out the details below and our customer relationship team will reach out immediately.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-emerald-900">
                  Ticket Raised Successfully!
                </h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  Your ticket reference #BG-{Math.floor(100000 + Math.random() * 900000)} has been logged. An executive will contact you via email or phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs font-semibold bg-[#F7F9FC] border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs font-semibold bg-[#F7F9FC] border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs font-semibold bg-[#F7F9FC] border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      PNR / Ticket Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PNR-2026-X889"
                      value={formData.pnr}
                      onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                      className="w-full text-xs font-semibold bg-[#F7F9FC] border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Query Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-xs font-semibold bg-[#F7F9FC] border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Booking Inquiry">Seat Booking & Schedule Inquiry</option>
                    <option value="Cancellation and Refund">Cancellation & Refund Status</option>
                    <option value="Boarding Point Escalation">Boarding Point / Dropping Point Delay</option>
                    <option value="Lost and Found">Lost & Found in Bus Saloon</option>
                    <option value="Operator Partnership">Fleet Operator Partnership</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your issue or inquiry with journey dates and passenger details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs font-semibold bg-[#F7F9FC] border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Support Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
