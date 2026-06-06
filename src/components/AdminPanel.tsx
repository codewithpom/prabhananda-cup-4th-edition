import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { fixtures, updateMatch } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="fixed inset-0 z-[100] bg-[#0A0A0B]/95 backdrop-blur-xl flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm bg-[#0A0A0B] border border-white/20 p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
          <div className="mb-8 text-center">
             <h2 className="text-2xl font-black italic tracking-tighter text-white mb-2">AUTH REQUIRED</h2>
             <p className="text-xs font-mono uppercase tracking-widest opacity-50">Enter admin password</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/20'} px-4 py-3 text-white focus:outline-none focus:border-yellow-500 font-mono`}
                 placeholder="PASSWORD"
                 autoFocus
               />
               {error && <p className="text-red-500 text-[10px] uppercase tracking-widest mt-2">Invalid password</p>}
            </div>
            <button type="submit" className="w-full bg-white text-black font-black uppercase tracking-tighter py-3 hover:bg-yellow-500 transition-colors">
               Access Control
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
       className="fixed inset-0 z-[100] bg-[#0A0A0B]/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto w-full bg-[#0A0A0B] border border-white/20 p-4 sm:p-8 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6 relative z-10">
           <div className="flex items-center gap-4">
             <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
             <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white">COMMAND CENTER</h2>
           </div>
           <button onClick={onClose} className="text-xs uppercase tracking-widest font-mono border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors shrink-0">Close</button>
        </div>

        <div className="space-y-8 relative z-10">
           <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white mb-4">Live Match Controller</h3>
           {fixtures.map(match => (
             <div key={match.id} className="bg-white/5 border border-white/10 p-6 flex flex-col gap-6 hover:border-white/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
                   <span className="font-mono text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1 uppercase tracking-widest border border-yellow-500/20 self-start">Match {match.id.replace('m', '').padStart(2, '0')}</span>
                   <select
                     className="bg-[#0A0A0B] border border-white/20 text-xs py-2 px-3 focus:outline-none focus:border-yellow-500 transition-colors text-white font-mono uppercase tracking-widest cursor-pointer"
                     value={match.status}
                     onChange={(e) => updateMatch(match.id, { status: e.target.value as any })}
                   >
                     <option value="UPCOMING">UPCOMING</option>
                     <option value="LIVE">LIVE</option>
                     <option value="FINISHED">FINISHED</option>
                   </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                   <div className="flex-1 font-black text-lg sm:text-xl md:text-2xl tracking-tighter text-center sm:text-right text-white truncate w-full sm:pr-4">{match.homeTeam.name}</div>
                   
                   <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0A0A0B] border border-white/20 text-center font-black text-2xl sm:text-3xl text-yellow-500 focus:outline-none focus:border-yellow-500 transition-colors"
                        value={match.homeScore ?? 0}
                        onChange={(e) => updateMatch(match.id, { homeScore: parseInt(e.target.value) || 0 })}
                      />
                      <span className="opacity-30 mx-2">:</span>
                      <input
                        type="number"
                        className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0A0A0B] border border-white/20 text-center font-black text-2xl sm:text-3xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                        value={match.awayScore ?? 0}
                        onChange={(e) => updateMatch(match.id, { awayScore: parseInt(e.target.value) || 0 })}
                      />
                   </div>
                   
                   <div className="flex-1 font-black text-lg sm:text-xl md:text-2xl tracking-tighter text-center sm:text-left text-white truncate w-full sm:pl-4">{match.awayTeam.name}</div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
}
