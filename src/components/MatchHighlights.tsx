import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Film, ArrowRight } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function MatchHighlights() {
  const { fixtures, setSelectedMatchId } = useAppContext();
  const finishedMatches = fixtures.filter(m => m.status === 'FINISHED');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  if (finishedMatches.length === 0) return null;

  return (
    <section id="highlights" className="py-12 sm:py-24 relative bg-[#0A0A0B] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="flex flex-col mb-16">
          <h3 className="text-xs tracking-[0.3em] uppercase opacity-50 mb-6 flex items-center gap-2 text-white">
            <span className="w-4 h-[1px] bg-white/30"></span> Retrospectives
          </h3>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
              MATCH<br />HIGHLIGHTS
            </h2>
            <p className="text-neutral-400 font-mono text-xs max-w-sm">
              Missed a kick? Fetch short summaries, play-by-plays, and high-definition key reels of completed state contenders matches.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {finishedMatches.map((match, index) => {
            const isCurrentlyPlaying = playingVideoId === match.id;
            const thumbnail = index % 2 === 0
              ? 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1431324155629-1a6edd1dec1d?auto=format&fit=crop&w=800&q=80';

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white/5 border border-white/10 p-5 group flex flex-col justify-between hover:border-yellow-500/50 transition-all text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-2xl rounded-full pointer-events-none"></div>

                <div className="aspect-[16/10] bg-neutral-950 overflow-hidden relative border border-white/5 mb-5 select-none">
                  {isCurrentlyPlaying && match.highlightsUrl ? (
                    <iframe
                      src={match.highlightsUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
                      <div className="flex justify-between items-center w-full relative z-10">
                        <span className="bg-black/80 px-2.5 py-1 text-[10px] font-mono tracking-wider font-bold text-yellow-500 uppercase flex items-center gap-1.5 border border-yellow-500/30">
                          <Film className="w-3 h-3" /> Replay Active
                        </span>
                        <span className="text-[10px] bg-black/60 font-mono opacity-80 px-2 py-0.5 mt-0.5">{match.date}</span>
                      </div>
                      <div className="flex items-center justify-center relative z-10 my-auto">
                        <button
                          onClick={() => setPlayingVideoId(match.id)}
                          className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 group-hover:bg-yellow-500 transition-all shadow-xl cursor-pointer"
                          title="Play Video Summary"
                        >
                          <Play className="w-6 h-6 fill-current ml-1" />
                        </button>
                      </div>
                      <div className="flex items-end justify-between relative z-10 w-full mt-auto bg-gradient-to-t from-black/90 via-black/40 to-transparent -mx-4 -mb-4 p-4">
                        <div className="flex items-center gap-2">
                          <img src={match.homeTeam.logo} className="w-6 h-6 rounded-full opacity-70 mix-blend-luminosity" />
                          <span className="text-sm font-black tracking-widest">{match.homeScore}</span>
                          <span className="opacity-30 text-xs">-</span>
                          <span className="text-sm font-black tracking-widest">{match.awayScore}</span>
                          <img src={match.awayTeam.logo} className="w-6 h-6 rounded-full opacity-70 mix-blend-luminosity" />
                        </div>
                        <span className="text-[10px] font-mono opacity-60">Highlights Reel</span>
                      </div>
                    </div>
                  )}
                  {!isCurrentlyPlaying && (
                    <img
                      src={thumbnail}
                      alt="Match Moments"
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-all duration-700 mix-blend-luminosity hover:mix-blend-normal transform group-hover:scale-105"
                    />
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-xl tracking-tighter text-white uppercase group-hover:text-yellow-500 transition-colors">
                        {match.homeTeam.name.substring(0, 4).toUpperCase()} vs {match.awayTeam.name.substring(0, 4).toUpperCase()}
                      </h3>
                      <p className="text-[11px] uppercase font-mono tracking-wide opacity-50">
                        {match.homeTeam.name} vs {match.awayTeam.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold block text-yellow-500">Group {match.homeTeam.group}</span>
                      <span className="text-[10px] opacity-40 font-mono uppercase block">{match.time} IST</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed mb-6 border-t border-dashed border-white/5 pt-3">
                    {match.aiCommentary || 'Match summary will appear after the game.'}
                  </p>

                  <div className="flex gap-3 mt-auto">
                    {isCurrentlyPlaying && (
                      <button
                        onClick={() => setPlayingVideoId(null)}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs uppercase tracking-widest font-mono p-3 px-4 transition-colors font-bold text-center flex-1"
                      >
                        Minimize Player
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMatchId(match.id)}
                      className="bg-white text-black font-black uppercase tracking-tighter hover:bg-yellow-500 text-xs p-3 px-5 transition-colors flex items-center justify-center gap-2 group-hover:translate-x-0.5 flex-1"
                    >
                      <span>Deep Analysis Page</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
