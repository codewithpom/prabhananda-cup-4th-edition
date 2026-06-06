import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';
import { ArrowUpRight } from 'lucide-react';

export default function Fixtures() {
  const { fixtures, setSelectedMatchId } = useAppContext();

  return (
    <section id="fixtures" className="py-12 sm:py-24 relative bg-[#0A0A0B] border-t border-t-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 w-full">
        <h3 className="text-xs tracking-[0.3em] uppercase opacity-50 mb-6 flex items-center gap-2 text-white">
          <span className="w-4 h-[1px] bg-white/30"></span> Fixtures & Results
        </h3>

        <div className="space-y-6">
          {fixtures.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${match.status === 'FINISHED' ? 'opacity-50 hover:opacity-100' : ''} transition-opacity`}
            >
              <div className="flex flex-row justify-between md:flex-col gap-1 w-full md:w-1/4">
                 <div className="flex items-center gap-2">
                   <span className={`text-xs font-mono uppercase ${match.status === 'LIVE' ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>
                     {match.date}
                   </span>
                   {match.status === 'LIVE' && <span className="text-[10px] px-2 py-0.5 border border-red-500 text-red-500 bg-red-500/10 font-bold font-mono">LIVE</span>}
                 </div>
                 <span className="text-[10px] opacity-60 text-white font-mono">{match.time} IST</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full md:w-3/4 gap-4">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 flex-1">
                  {/* Home Team */}
                  <div className="text-right min-w-0">
                    <span className="text-base sm:text-xl md:text-2xl font-black tracking-tighter uppercase text-white block truncate">{match.homeTeam.name}</span>
                  </div>
                  
                  {/* Score / VS */}
                  <div className="text-center min-w-[70px] sm:min-w-[100px] shrink-0 font-mono font-black select-none">
                    {match.status === 'UPCOMING' ? (
                       <span className="text-xs sm:text-sm md:text-base opacity-30 italic px-2 py-1 bg-white/5 border border-white/5 text-white">VS</span>
                    ) : (
                       <div className="flex items-center justify-center gap-2 sm:gap-3 bg-white/5 border border-white/10 px-3 py-1 rounded">
                         <span className="text-lg sm:text-2xl font-black text-yellow-500">{match.homeScore}</span>
                         <span className="opacity-30 text-xs font-normal text-white">:</span>
                         <span className="text-lg sm:text-2xl font-black text-white">{match.awayScore}</span>
                       </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="text-left min-w-0">
                    <span className="text-base sm:text-xl md:text-2xl font-black tracking-tighter uppercase text-white block truncate">{match.awayTeam.name}</span>
                  </div>
                </div>
                
                {/* Detailed Match Page button */}
                <button
                  onClick={() => setSelectedMatchId(match.id)}
                  className="shrink-0 py-2 px-4 sm:py-1.5 sm:px-2.5 border border-white/10 bg-white/5 hover:bg-white hover:text-black hover:border-white transition-all text-neutral-400 font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  title="View match center"
                >
                   <span>Page Center</span>
                   <ArrowUpRight className="w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
