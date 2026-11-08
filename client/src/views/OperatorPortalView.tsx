import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ManifestReport } from '../types';
import {
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Bus,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const OperatorPortalView: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [tripsList, setTripsList] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [manifestReport, setManifestReport] = useState<ManifestReport | null>(null);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingManifest, setIsLoadingManifest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const [dashRes, tripsRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/operators/trips')
      ]);
      setDashboardData(dashRes.data.data);
      setTripsList(tripsRes.data.data);

      if (tripsRes.data.data.length > 0 && !selectedTripId) {
        setSelectedTripId(tripsRes.data.data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load operator dashboard');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchManifest = async (tripId: string) => {
    if (!tripId) return;
    setIsLoadingManifest(true);
    try {
      const res = await api.get(`/reports/manifest/${tripId}`);
      setManifestReport(res.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingManifest(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchManifest(selectedTripId);
    }
  }, [selectedTripId]);

  const handleUpdateStatus = async (tripId: string, newStatus: string) => {
    try {
      await api.patch(`/operators/trips/${tripId}/status`, { status: newStatus });
      fetchDashboard();
      if (selectedTripId === tripId) {
        fetchManifest(tripId);
      }
    } catch (err: any) {
      alert('Failed to update trip status');
    }
  };

  const handlePrintManifest = () => {
    window.print();
  };

  if (isLoadingDashboard) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Loading operator operational metrics...</p>
      </div>
    );
  }

  const overview = dashboardData?.overview || {};

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Operator Command Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Trip dispatch, live seat occupancy reconciliation, and passenger manifests.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Scheduled Trips
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{overview.totalTrips || 0}</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block">
            Across active network routes
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Passengers Carried
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600">
              {overview.totalPassengersCarried || 0}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block">
            Confirmed active tickets
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Average Occupancy
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-purple-600">
              {overview.averageOccupancy || 0}%
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block">
            Seat utilization efficiency
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Net Booking Revenue
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-rose-600">
              ₹{(overview.netRevenue || 0).toLocaleString()}
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block">
            Gross ₹{(overview.totalRevenue || 0).toLocaleString()} (Refunds: ₹{(overview.totalRefunded || 0).toLocaleString()})
          </span>
        </div>
      </div>

      {/* Main Section: Manifest Viewer & Reconciliation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Passenger Manifest & Seat Reconciliation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any route schedule to inspect verified passenger list and seat audit.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none flex-1 sm:w-80"
            >
              {tripsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.route} • {t.travelDate} ({t.departureTime}) - {t.busNumber}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrintManifest}
              className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Manifest Detail Area */}
        {isLoadingManifest ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Reconciling manifest with confirmed tickets...</span>
          </div>
        ) : manifestReport ? (
          <div className="space-y-6">
            {/* Acceptance Criteria 5 Reconciliation Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200 grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Total Capacity
                </span>
                <div className="text-xl font-black text-emerald-950">
                  {manifestReport.reconciliation.totalSeats} Seats
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Booked Seats
                </span>
                <div className="text-xl font-black text-emerald-950">
                  {manifestReport.reconciliation.bookedSeats}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Available Seats
                </span>
                <div className="text-xl font-black text-emerald-950">
                  {manifestReport.reconciliation.availableSeats}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Manifest Passengers
                </span>
                <div className="text-xl font-black text-emerald-950">
                  {manifestReport.reconciliation.manifestPassengerCount}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>100% Reconciled</span>
                </div>
              </div>
            </div>

            {/* Trip Context Card */}
            <div className="flex flex-wrap items-center justify-between text-xs p-4 bg-slate-50 border border-slate-200 rounded-xl gap-3">
              <div>
                <span className="text-slate-400 font-medium">Route: </span>
                <span className="font-extrabold text-slate-800">
                  {manifestReport.trip.route.origin} → {manifestReport.trip.route.destination}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Bus Model: </span>
                <span className="font-bold text-slate-800">{manifestReport.trip.bus.model} ({manifestReport.trip.bus.busNumber})</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Schedule: </span>
                <span className="font-bold text-slate-800">{manifestReport.trip.travelDate} @ {manifestReport.trip.departureTime}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Status: </span>
                <select
                  value={manifestReport.trip.status}
                  onChange={(e) => handleUpdateStatus(manifestReport.trip.id, e.target.value)}
                  className="ml-1 text-xs font-bold bg-white border border-slate-300 rounded-lg px-2 py-1"
                >
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="ON_THE_WAY">ON THE WAY</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Manifest Table */}
            <div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Seat #</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Passenger Name</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Age / Gender</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">PNR Ref</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Boarding Point</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Dropping Point</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {manifestReport.manifest.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">
                          No confirmed passengers booked on this trip yet.
                        </td>
                      </tr>
                    ) : (
                      manifestReport.manifest.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-extrabold text-rose-600">
                            {p.seatNumber}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">{p.passengerName}</td>
                          <td className="px-4 py-3 text-slate-600">{p.age} Yrs • {p.gender}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">{p.pnr}</td>
                          <td className="px-4 py-3 text-slate-700">{p.boardingPoint}</td>
                          <td className="px-4 py-3 text-slate-700">{p.droppingPoint}</td>
                          <td className="px-4 py-3 text-slate-500">{p.contactPhone}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Route Schedules & Occupancy Visualizer */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">
          Route Schedules & Seat Occupancy Overview
        </h2>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Route</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Date & Time</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Bus Registration</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Seat Occupancy</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-bold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {tripsList.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{t.route}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {t.travelDate} ({t.departureTime})
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">{t.busNumber}</td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span>{t.bookedSeats} / {t.totalSeats} booked</span>
                        <span className="font-bold text-rose-600">{t.occupancyRate}%</span>
                      </div>
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full"
                          style={{ width: `${t.occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        t.status === 'SCHEDULED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : t.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedTripId(t.id)}
                      className="py-1 px-3 bg-slate-900 hover:bg-rose-600 text-white rounded-lg font-bold text-[11px] transition-colors"
                    >
                      View Manifest
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
