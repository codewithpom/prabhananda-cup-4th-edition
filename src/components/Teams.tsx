import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../AppContext';
import { useState } from 'react';

export default function Teams() {
  const { teams } = useAppContext();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <section id="teams" className="py-12 sm:py-24 relative bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <h3 className="text-xs tracking-[0.3em] uppercase opacity-50 mb-6 flex items-center gap-2 text-white">
          <span className="w-4 h-[1px] bg-white/30"></span> The Squads
        </h3>
        <div className="mb-10 block">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
            CLASS 10<br/>CONTENDERS
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 border-b border-white/10 pb-12 mb-12">
          {teams.map((team, index) => (
            <motion.button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id === selectedTeamId ? null : team.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/5 p-4 sm:p-6 border text-left flex flex-col h-full items-start justify-between group transition-all relative overflow-hidden focus:outline-none ${selectedTeamId === team.id ? 'border-yellow-500 bg-white/10' : 'border-white/10 hover:bg-white/10'}`}
            >
              <div className={`w-12 h-12 sm:w-20 sm:h-20 mb-4 sm:mb-6 flex items-center justify-center transition-all mix-blend-luminosity ${selectedTeamId === team.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                <img src={team.logo} alt={team.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="w-full">
                <span className={`text-[9px] sm:text-[10px] tracking-[0.2em] font-mono uppercase opacity-80 mb-2 block border-y py-1.5 sm:py-2 transition-colors ${selectedTeamId === team.id ? 'text-yellow-500 border-yellow-500/30' : 'text-neutral-500 border-white/10 group-hover:text-yellow-500'}`}>Group {team.group}</span>
                <h3 className="font-bold text-sm sm:text-lg leading-tight tracking-tighter text-white mt-1 sm:mt-2">{team.name}</h3>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedTeam && (
            <motion.div
              key={selectedTeam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 p-5 sm:p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 mb-8 border-b border-white/10 pb-8 relative z-10 animate-fade-in">
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border border-white/10 overflow-hidden bg-white/5 p-3 sm:p-4 mix-blend-luminosity shrink-0">
                  <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-2">{selectedTeam.name}</h3>
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-yellow-500 border border-yellow-500/30 px-3 py-1 inline-block bg-yellow-500/10">Group {selectedTeam.group}</div>
                </div>
              </div>

              {selectedTeam.roster && selectedTeam.roster.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  {selectedTeam.roster.map(player => (
                    <div key={player.id} className="bg-[#0A0A0B] border border-white/10 p-4 group hover:border-yellow-500/50 transition-colors">
                      <div className="aspect-square bg-white/5 mb-4 overflow-hidden border border-white/5">
                        <img src={player.photo} alt={player.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                        <h4 className="font-bold text-lg leading-tight tracking-tighter text-white">{player.name}</h4>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 ml-2 mt-1">{player.position.slice(0,3)}</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{player.bio}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-[dashed] border-white/10 bg-[#0A0A0B]">
                  <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">Roster to be announced</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
