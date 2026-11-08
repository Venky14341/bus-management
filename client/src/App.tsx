import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TripSearchView } from './views/TripSearchView';
import { MyBookingsView } from './views/MyBookingsView';
import { OperatorPortalView } from './views/OperatorPortalView';
import { AdminPortalView } from './views/AdminPortalView';
import { Bus, Shield, Heart } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('search');
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'search' && <TripSearchView />}
        {activeTab === 'my-bookings' && <MyBookingsView />}
        {activeTab === 'operator' && (user?.role === 'OPERATOR' || user?.role === 'ADMIN') && (
          <OperatorPortalView />
        )}
        {activeTab === 'admin' && user?.role === 'ADMIN' && <AdminPortalView />}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <span>Algions AI Labs • Bus Booking Management System Assessment</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Server Online (Port 5000)
            </span>
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-rose-600 hover:underline"
            >
              OpenAPI 3.0 Documentation
            </a>
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
