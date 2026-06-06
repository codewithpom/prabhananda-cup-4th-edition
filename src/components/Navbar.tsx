import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { tournamentMeta } = useAppContext();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 w-full z-50 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/10 pt-4 pb-3 sm:pt-6 sm:pb-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center md:items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.4em] uppercase opacity-60 mb-0.5 sm:mb-1 text-white truncate max-w-[240px] sm:max-w-none">
            Ramakrishna Mission Vidyalaya, Narendrapur
          </span>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tighter text-white">
            {tournamentMeta.name.toUpperCase()}
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.4em] uppercase font-bold text-white/50">
          <a href="#live" className="hover:text-white transition-colors">Live</a>
          <a href="#fixtures" className="hover:text-white transition-colors">Fixtures</a>
          <a href="#teams" className="hover:text-white transition-colors">Teams</a>
          <a href="#sponsors" className="hover:text-white transition-colors">Sponsors</a>
          <a href="#location" className="hover:text-white transition-colors">Location</a>
        </div>
        <div className="text-right flex-col items-end hidden md:flex">
          <span className="block text-[10px] tracking-[0.4em] uppercase opacity-60 mb-1">Tournament Status</span>
          <span className="text-xs font-mono px-3 py-1 bg-red-600 rounded-full animate-pulse text-white">{tournamentMeta.matchDay}</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden w-full bg-[#0A0A0B]/95 border-b border-white/10 mt-3 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4 font-bold text-xs uppercase tracking-[0.3em] font-mono text-center">
              <a href="#live" onClick={() => setIsOpen(false)} className="py-3 border-b border-white/5 text-neutral-400 hover:text-white transition-colors">Live Match</a>
              <a href="#fixtures" onClick={() => setIsOpen(false)} className="py-3 border-b border-white/5 text-neutral-400 hover:text-white transition-colors">Fixtures & Stats</a>
              <a href="#teams" onClick={() => setIsOpen(false)} className="py-3 border-b border-white/5 text-neutral-400 hover:text-white transition-colors">Participating Teams</a>
              <a href="#sponsors" onClick={() => setIsOpen(false)} className="py-3 border-b border-white/5 text-neutral-400 hover:text-white transition-colors">Partners & Sponsors</a>
              <a href="#location" onClick={() => setIsOpen(false)} className="py-3 text-neutral-400 hover:text-white transition-colors">Stadium Venue Map</a>
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest opacity-50">Current Event State</span>
                <span className="text-[10px] font-mono px-3 py-1 bg-red-600 rounded-full text-white inline-block">{tournamentMeta.matchDay}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
