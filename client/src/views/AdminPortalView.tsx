import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditLog, CancellationRule, Bus, Route, Operator } from '../types';
import {
  Shield,
  Layers,
  MapPin,
  Clock,
  History,
  Plus,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdminPortalView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'rules' | 'fleet' | 'routes'>('audit');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Rules State
  const [rules, setRules] = useState<CancellationRule[]>([]);
  const [savingRuleId, setSavingRuleId] = useState<string | null>(null);

  // Fleet State
  const [buses, setBuses] = useState<Bus[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);

  // Routes State
  const [routes, setRoutes] = useState<Route[]>([]);

  // New Bus Modal / Form
  const [showAddBus, setShowAddBus] = useState(false);
  const [newBus, setNewBus] = useState({
    operatorId: '',
    busNumber: '',
    model: '',
    busType: 'AC_SLEEPER',
    totalSeats: 30
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAuditLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/audit-logs', { params: { page, limit: 15 } });
      setAuditLogs(res.data.data.logs);
      setAuditTotal(res.data.data.total);
      setAuditPage(page);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await api.get('/cancellations/rules');
      setRules(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFleet = async () => {
    try {
      const [busRes, opRes] = await Promise.all([
        api.get('/operators/buses'),
        api.get('/operators')
      ]);
      setBuses(busRes.data.data);
      setOperators(opRes.data.data);
      if (opRes.data.data.length > 0 && !newBus.operatorId) {
        setNewBus(prev => ({ ...prev, operatorId: opRes.data.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/operators/routes');
      setRoutes(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'audit') fetchAuditLogs(1);
    if (activeSubTab === 'rules') fetchRules();
    if (activeSubTab === 'fleet') fetchFleet();
    if (activeSubTab === 'routes') fetchRoutes();
  }, [activeSubTab]);

  const handleUpdateRule = async (rule: CancellationRule, refundPct: number) => {
    setSavingRuleId(rule.id);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const feePct = 100 - refundPct;
      await api.put(`/cancellations/rules/${rule.id}`, {
        refundPercentage: refundPct,
        cancellationFeePercentage: feePct
      });
      setSuccessMsg(`Rule "${rule.name}" updated successfully.`);
      fetchRules();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Failed to update rule');
    } finally {
      setSavingRuleId(null);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.post('/operators/buses', newBus);
      setSuccessMsg('New bus successfully registered to fleet.');
      setShowAddBus(false);
      fetchFleet();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Failed to add bus');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Control Suite</h1>
          <p className="text-xs text-slate-500 mt-1">
            System configuration, business rules engine, fleet setup, and audit trail.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`py-1.5 px-3 rounded-xl transition-all ${
              activeSubTab === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`py-1.5 px-3 rounded-xl transition-all ${
              activeSubTab === 'rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Cancellation Rules
          </button>
          <button
            onClick={() => setActiveSubTab('fleet')}
            className={`py-1.5 px-3 rounded-xl transition-all ${
              activeSubTab === 'fleet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Fleet & Buses
          </button>
          <button
            onClick={() => setActiveSubTab('routes')}
            className={`py-1.5 px-3 rounded-xl transition-all ${
              activeSubTab === 'routes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Routes & Stops
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Audit Trail View */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              System Audit Trail ({auditTotal} events recorded)
            </h2>
            <button
              onClick={() => fetchAuditLogs(auditPage)}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Refresh Logs
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Timestamp</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Action</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Actor</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Target Entity</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-600">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {auditLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  let parsedDetails: any = null;
                  try {
                    parsedDetails = JSON.parse(log.details);
                  } catch {
                    parsedDetails = log.details;
                  }

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              log.action.includes('CANCEL')
                                ? 'bg-rose-100 text-rose-800'
                                : log.action.includes('BOOK')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="font-semibold block">{log.actor?.name || 'System User'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.actorEmail || 'anonymous'}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="font-semibold">{log.entityType}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {log.entityId.slice(0, 12)}...
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-900 text-emerald-400 font-mono text-[11px]">
                          <td colSpan={5} className="p-4">
                            <pre className="overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(parsedDetails, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Cancellation Rules Configurator */}
      {activeSubTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Configurable Refund & Cancellation Policies
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Changes take effect dynamically for all real-time booking refund previews and cancellations.
            </p>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{rule.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Window: Minimum {rule.minHoursBeforeDeparture} hours before departure
                    {rule.maxHoursBeforeDeparture ? ` up to ${rule.maxHoursBeforeDeparture} hours` : ' (no upper cap)'}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Refund Pct</span>
                    <span className="text-base font-black text-emerald-600">
                      {rule.refundPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[90, 75, 50, 25, 0].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        disabled={savingRuleId === rule.id}
                        onClick={() => handleUpdateRule(rule, pct)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                          rule.refundPercentage === pct
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Fleet & Buses */}
      {activeSubTab === 'fleet' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Fleet Vehicle Registry ({buses.length} Buses)
            </h2>
            <button
              onClick={() => setShowAddBus(true)}
              className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Bus</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Registration #</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Model</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Bus Type</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Capacity</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-extrabold text-slate-900">
                      {bus.busNumber}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{bus.model}</td>
                    <td className="px-4 py-3.5 uppercase text-slate-600 font-bold">
                      {bus.busType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-semibold">{bus.totalSeats} Seats</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{bus.operator?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Routes & Stops */}
      {activeSubTab === 'routes' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Network Intercity Routes & Intermediate Stops ({routes.length} Routes)
          </h2>

          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="p-5 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-slate-900">
                    {route.sourceCity} → {route.destinationCity}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    {route.distanceKm} km • {route.estimatedHours} hrs transit
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Stops:</span>
                  {route.stops?.map((stop) => (
                    <span
                      key={stop.id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px]"
                    >
                      {stop.stopName} ({stop.stopType})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Register New Bus to Fleet</h3>
            <form onSubmit={handleCreateBus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operator</label>
                <select
                  value={newBus.operatorId}
                  onChange={(e) => setNewBus({ ...newBus, operatorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  required
                >
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>{op.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bus Number (Registration)</label>
                <input
                  type="text"
                  placeholder="e.g. KA-05-AB-9988"
                  value={newBus.busNumber}
                  onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Volvo 9600 Multi-Axle"
                  value={newBus.model}
                  onChange={(e) => setNewBus({ ...newBus, model: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bus Type</label>
                  <select
                    value={newBus.busType}
                    onChange={(e) => setNewBus({ ...newBus, busType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  >
                    <option value="AC_SLEEPER">AC Sleeper</option>
                    <option value="AC_SEATER">AC Seater</option>
                    <option value="NON_AC_SEATER">Non-AC Seater</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Seats</label>
                  <input
                    type="number"
                    value={newBus.totalSeats}
                    onChange={(e) => setNewBus({ ...newBus, totalSeats: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBus(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-rose-600 text-white rounded-xl font-bold shadow-md"
                >
                  Register Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
