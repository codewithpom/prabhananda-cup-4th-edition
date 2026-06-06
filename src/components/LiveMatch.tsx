import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';
import StadiumImage from '../assets/images/stadium_hero_1779535562163.png';
import { useState } from 'react';

export default function LiveMatch() {
  const { fixtures, setSelectedMatchId } = useAppContext();
  const match = fixtures.find(m => m.status === 'LIVE') || fixtures[0];
  const [showStream, setShowStream] = useState(false);

  return (
    <section id="live" className="py-12 sm:py-24 relative border-y border-white/10 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="mb-8">
          <h3 className="text-xs tracking-[0.3em] uppercase opacity-50 mb-6 flex items-center gap-2 text-white">
            <span className="w-4 h-[1px] bg-white/30"></span> Live Action
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">MATCH {match.id.replace('m','').padStart(2, '0')} / GROUP {match.homeTeam.group}</h2>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 font-mono text-xs font-bold tracking-wider">LIVE</span>
            </div>
          </div>
          <p className="text-neutral-500 font-mono text-sm tracking-widest uppercase">Matchday • {match.date}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Video Player / Stream Embed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-video bg-neutral-900 overflow-hidden relative border border-white/10"
          >
            {showStream && match.streamUrl ? (
              <iframe 
                src={match.streamUrl} 
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            ) : (
              <>
                <img src={StadiumImage} alt="Live Stream" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                  <button 
                    onClick={() => setShowStream(true)}
                    className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2" />
                  </button>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold tracking-wider rounded">REC</span>
                   <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-mono rounded">Waiting for Stream</span>
                </div>
              </>
            )}
          </motion.div>

          {/* Live Scorecard */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 p-6 md:p-8 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div>
              <div className="text-center mb-6 relative z-10 w-full flex justify-center">
                 <div className="text-[11px] font-mono tracking-widest bg-white/10 px-4 py-1 rounded inline-block text-white">
                   {match.time}
                 </div>
              </div>

              <div className="flex items-center justify-between gap-1 relative z-10 w-full">
                <div className="text-center w-5/12 flex flex-col items-center min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-full border border-white/10 overflow-hidden bg-white/5 hidden xs:block">
                    <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover mix-blend-luminosity" />
                  </div>
                  <div className="text-base sm:text-2xl font-black mb-1 text-white truncate w-full text-center">{match.homeTeam.name.substring(0,4).toUpperCase()}</div>
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-50 text-white truncate w-full">{match.homeTeam.name}</div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 w-2/12 justify-center shrink-0">
                  <span className="text-2xl sm:text-4xl font-black tabular-nums text-yellow-500">{match.homeScore ?? 0}</span>
                  <span className="text-sm sm:text-xl opacity-30 text-white">:</span>
                  <span className="text-2xl sm:text-4xl font-black tabular-nums text-white">{match.awayScore ?? 0}</span>
                </div>

                <div className="text-center w-5/12 flex flex-col items-center min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-full border border-white/10 overflow-hidden bg-white/5 hidden xs:block">
                    <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover mix-blend-luminosity" />
                  </div>
                  <div className="text-base sm:text-2xl font-black mb-1 text-white truncate w-full text-center">{match.awayTeam.name.substring(0,4).toUpperCase()}</div>
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-50 text-white truncate w-full">{match.awayTeam.name}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 w-full relative z-10 flex-1 flex flex-col min-h-0">
              <h4 className="text-xs tracking-[0.2em] font-mono opacity-50 mb-4 uppercase text-white flex items-center justify-between">
                <span>Play-by-play</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
              </h4>
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[220px] sm:max-h-[300px] flex-1">
                {match.events && match.events.length > 0 ? (
                  match.events.map((event) => (
                    <div key={event.id} className="flex gap-4 text-sm group">
                      <span className="text-yellow-500 font-mono text-xs w-8 pt-1 flex-shrink-0">{event.time}</span>
                      <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0 border-[dashed]">
                         <span className={`text-[10px] uppercase font-bold tracking-wider px-1 mb-1 inline-block ${event.type === 'Goal' ? 'bg-yellow-500 text-black' : event.type === 'Yellow Card' ? 'bg-yellow-300 text-black' : event.type === 'Red Card' ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}>
                           {event.type}
                         </span>
                         <p className="text-white/80 leading-relaxed text-xs">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-xs italic">Waiting for match events...</p>
                )}
              </div>
              <button
                onClick={() => setSelectedMatchId(match.id)}
                className="w-full mt-4 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white font-mono text-[10px] uppercase py-3 font-bold tracking-wider transition-all block text-center cursor-pointer"
              >
                Detailed Match Center
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
