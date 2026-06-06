import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LiveMatch from './components/LiveMatch';
import Teams from './components/Teams';
import Fixtures from './components/Fixtures';
import MatchHighlights from './components/MatchHighlights';
import Sponsors from './components/Sponsors';
import Location from './components/Location';
import Footer from './components/Footer';
import AdminPanel from './components/admin/AdminPanel';
import MatchDetailsModal from './components/MatchDetailsModal';
import { AppProvider, useAppContext } from './AppContext';
import { AnimatePresence } from 'motion/react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">Loading tournament data...</span>
      </div>
    </div>
  );
}

function AppContent({ showAdmin, setShowAdmin }: { showAdmin: boolean; setShowAdmin: (val: boolean) => void }) {
  const { selectedMatchId, isLoading } = useAppContext();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-yellow-500/30 selection:text-yellow-200 select-none">
      <Navbar />
      <Hero />
      <LiveMatch />
      <Fixtures />
      <MatchHighlights />
      <Teams />
      <Sponsors />
      <Location />
      <Footer onAdminClick={() => setShowAdmin(true)} />

      <AnimatePresence>
        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
        {selectedMatchId && <MatchDetailsModal />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <AppProvider>
      <AppContent showAdmin={showAdmin} setShowAdmin={setShowAdmin} />
    </AppProvider>
  );
}
