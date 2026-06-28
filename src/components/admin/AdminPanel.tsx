import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import TournamentTab from './tabs/TournamentTab';
import MatchesTab from './tabs/MatchesTab';
import TeamsTab from './tabs/TeamsTab';
import SponsorsTab from './tabs/SponsorsTab';
import HeroTab from './tabs/HeroTab';
import VenueTab from './tabs/VenueTab';
import SocialLinksTab from './tabs/SocialLinksTab';

type Tab = 'tournament' | 'matches' | 'teams' | 'sponsors' | 'hero' | 'venue' | 'socialLinks';

const TABS: { id: Tab; label: string }[] = [
  { id: 'tournament', label: 'Tournament' },
  { id: 'matches', label: 'Matches' },
  { id: 'teams', label: 'Teams' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'hero', label: 'Hero' },
  { id: 'venue', label: 'Venue' },
  { id: 'socialLinks', label: 'Social Links' },
];

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { adminUser, authError, signIn, signOut, useDummyData, setUseDummyData } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tournament');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signIn(email, password);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!adminUser) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[100] bg-[#0A0A0B]/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm bg-[#0A0A0B] border border-white/20 p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">✕</button>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black italic tracking-tighter text-white mb-2">COMMAND CENTER</h2>
            <p className="text-xs font-mono uppercase tracking-widest opacity-50">Admin authentication required</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-yellow-500 font-mono h-11"
              placeholder="EMAIL"
              autoFocus
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-white/5 border ${authError ? 'border-red-500' : 'border-white/20'} px-4 py-3 text-white focus:outline-none focus:border-yellow-500 font-mono h-11`}
              placeholder="PASSWORD"
              required
            />
            {authError && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest">{authError}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-white text-black font-black uppercase tracking-tighter py-3 h-11 hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'AUTHENTICATING...' : 'Access Control'}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-[#0A0A0B]/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto w-full bg-[#0A0A0B] min-h-screen flex flex-col relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 px-4 sm:px-8 py-4 sm:py-6 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
            <h2 className="text-xl sm:text-3xl font-black italic tracking-tighter text-white">COMMAND CENTER</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dummy data toggle */}
            <button
              onClick={() => setUseDummyData(!useDummyData)}
              title={useDummyData ? 'Switch to Firebase data' : 'Switch to demo/dummy data'}
              className={`flex items-center gap-2 text-xs font-mono border px-3 py-2 transition-colors ${
                useDummyData
                  ? 'border-yellow-500/60 text-yellow-400 hover:border-yellow-400'
                  : 'border-white/20 text-white/40 hover:text-white/70'
              }`}
            >
              <span className="hidden sm:inline uppercase tracking-widest">Demo</span>
              <span className={`relative inline-flex w-8 h-4 rounded-full transition-colors flex-shrink-0 ${useDummyData ? 'bg-yellow-500' : 'bg-white/20'}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${useDummyData ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
            </button>
            <span className="hidden sm:block text-[10px] font-mono text-white/40 truncate max-w-[160px]">{adminUser.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-mono border border-white/20 px-3 py-2 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline uppercase tracking-widest">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs uppercase tracking-widest font-mono border border-white/20 px-3 sm:px-4 py-2 hover:bg-white hover:text-black transition-colors text-white"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/10 flex-shrink-0 relative z-10">
          <div className="overflow-x-auto">
            <div className="flex whitespace-nowrap px-4 sm:px-8">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 text-xs font-mono uppercase tracking-widest border-b-2 transition-all flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-500'
                      : 'border-transparent text-white/40 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'tournament' && <TournamentTab />}
              {activeTab === 'matches' && <MatchesTab />}
              {activeTab === 'teams' && <TeamsTab />}
              {activeTab === 'sponsors' && <SponsorsTab />}
              {activeTab === 'hero' && <HeroTab />}
              {activeTab === 'venue' && <VenueTab />}
              {activeTab === 'socialLinks' && <SocialLinksTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
