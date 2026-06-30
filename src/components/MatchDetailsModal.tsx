import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Play, Tv, Calendar, BarChart3, Users, ListFilter, Sparkles } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { generateMatchCommentary } from '../services/gemini';

export default function MatchDetailsModal() {
  const { fixtures, selectedMatchId, setSelectedMatchId, adminUser, updateMatch, tournamentMeta, sponsors } = useAppContext();
  const [activeTab, setActiveTab] = useState<'stream' | 'comments' | 'stats' | 'squads'>('stream');
  const [playVideo, setPlayVideo] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState('');

  // Block background scroll when details modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const match = fixtures.find(m => m.id === selectedMatchId);

  if (!match) return null;

  const isLive = match.status === 'LIVE';
  const isUpcoming = match.status === 'UPCOMING';
  const isFinished = match.status === 'FINISHED';

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const result = await generateMatchCommentary(match);
      setAiPreview(result);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAI = async () => {
    if (!aiPreview) return;
    await updateMatch(match.id, { aiCommentary: aiPreview } as Parameters<typeof updateMatch>[1]);
    setAiPreview('');
  };

  const defaultStats = {
    possession: [50, 50],
    shots: [8, 8],
    fouls: [10, 10]
  };

  const stats = match.stats || defaultStats;
  const partnerName = tournamentMeta.officialPartner?.trim() || sponsors.find(s => s.name.trim())?.name || 'KOLKATA ATHLETICS MEDIA';
  const refereeName = tournamentMeta.referee?.trim() || 'P. K. Bandyopadhyay';
  const audioLanguage = tournamentMeta.audioLanguage?.trim() || 'Hindi / Bengali / English';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto flex p-2 sm:p-4 md:p-8"
    >
      <div className="w-full max-w-6xl bg-[#0A0A0B] border border-white/10 shadow-2xl relative flex flex-col m-auto text-white">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-6 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : isFinished ? 'bg-neutral-500' : 'bg-yellow-500'}`} />
            <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-neutral-400">
              Match Details / {isLive ? 'Live coverage' : isFinished ? 'Concluded summary' : 'Upcoming fixture'}
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedMatchId(null);
              setPlayVideo(false);
            }}
            className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] border-b border-white/10">
          
          {/* Left Column: Visual / Stream / Highlights Player */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            
            {/* Live Feed / Highlight Preview Panel */}
            <div className="aspect-video bg-neutral-950 overflow-hidden relative border border-white/5 group hover:border-white/10 transition-colors mb-6">
              {playVideo && (match.streamUrl || match.highlightsUrl) ? (
                <iframe
                  src={isFinished ? match.highlightsUrl : match.streamUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0 opacity-80" />
                  
                  {/* Visual Background */}
                  <div className="absolute inset-0 z-[-1] opacity-40 mix-blend-luminosity">
                    <img 
                      src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80" 
                      alt="Stadium Action" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {isFinished ? (
                    <div className="relative z-10 flex flex-col items-center">
                      <button 
                        onClick={() => setPlayVideo(true)}
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-yellow-500 text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-yellow-500/20 mb-3 sm:mb-4 cursor-pointer"
                      >
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
                      </button>
                      <h3 className="font-black text-base sm:text-xl tracking-tighter uppercase italic text-white text-center">Watch Match Highlights</h3>
                      <p className="text-white/60 font-mono text-[9px] sm:text-xs uppercase tracking-widest mt-1">Concluded • High-definition replay & summaries</p>
                    </div>
                  ) : isLive ? (
                    <div className="relative z-10 flex flex-col items-center">
                      <button 
                        onClick={() => setPlayVideo(true)}
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-red-600/20 mb-3 sm:mb-4 cursor-pointer"
                      >
                        <Tv className="w-6 h-6 sm:w-8 sm:h-8" />
                      </button>
                      <h3 className="font-black text-base sm:text-xl tracking-tighter uppercase italic text-white text-center">Tune Into Live Stream</h3>
                      <p className="text-white/60 font-mono text-[9px] sm:text-xs uppercase tracking-widest mt-1">Streaming live from main stadium</p>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 mb-3 sm:mb-4">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                      </div>
                      <h3 className="font-black text-base sm:text-xl tracking-tighter uppercase italic text-white text-center">Broadcast commences soon</h3>
                      <p className="text-white/60 font-mono text-[9px] sm:text-xs uppercase tracking-widest mt-1">Scheduled for {match.date} at {match.time} IST</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Match Heading Panel */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 sm:p-6">
                
                {/* Home Team */}
                <div className="w-5/12 flex flex-col items-center text-center min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-full border border-white/10 p-1.5 sm:p-2 overflow-hidden bg-black/40 flex items-center justify-center">
                    <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <h4 className="font-black text-sm sm:text-lg md:text-xl tracking-tighter text-white uppercase truncate w-full">{match.homeTeam.name}</h4>
                  <p className="text-[8px] sm:text-[10px] uppercase font-mono tracking-wider opacity-50 mt-0.5 text-white truncate w-full">{match.homeTeam.name}</p>
                </div>

                {/* score */}
                <div className="w-2/12 flex flex-col items-center justify-center shrink-0">
                  {isUpcoming ? (
                    <div className="text-center">
                      <span className="text-[10px] sm:text-xs uppercase font-mono tracking-widest opacity-40">VS</span>
                      <p className="text-[9px] sm:text-xs font-mono opacity-80 mt-1">{match.time}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1.5 sm:gap-3 text-lg sm:text-2xl md:text-3xl font-black">
                        <span className="text-yellow-500 tabular-nums">{match.homeScore ?? 0}</span>
                        <span className="opacity-30 text-xs font-light">:</span>
                        <span className="text-white tabular-nums">{match.awayScore ?? 0}</span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-mono tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 sm:px-2 sm:py-0.5 mt-2 uppercase whitespace-nowrap">
                        {isLive ? 'LIVE' : 'FT'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="w-5/12 flex flex-col items-center text-center min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 rounded-full border border-white/10 p-1.5 sm:p-2 overflow-hidden bg-black/40 flex items-center justify-center">
                    <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <h4 className="font-black text-sm sm:text-lg md:text-xl tracking-tighter text-white uppercase truncate w-full">{match.awayTeam.name}</h4>
                  <p className="text-[8px] sm:text-[10px] uppercase font-mono tracking-wider opacity-50 mt-0.5 text-white truncate w-full">{match.awayTeam.name}</p>
                </div>

              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/5 border border-white/10 p-4 font-mono text-xs flex items-center justify-between">
                  <span className="opacity-50">DATE</span>
                  <span className="text-white font-bold">{match.date}</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 font-mono text-xs flex items-center justify-between">
                  <span className="opacity-50">VENUE</span>
                  <span className="text-white font-bold truncate">Narendrapur STDM</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Information Tabs & Interactive Timelines */}
          <div className="flex flex-col bg-black/40 min-h-[400px]">
            
            {/* Tabs Control */}
            <div className="grid grid-cols-4 border-b border-white/10 text-center font-bold text-[9px] sm:text-xs uppercase tracking-tight">
              <button 
                onClick={() => setActiveTab('stream')}
                className={`py-3 sm:py-4 border-b-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all outline-none ${activeTab === 'stream' ? 'border-yellow-500 text-yellow-500 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[8px] xs:text-[9px] sm:text-[10px]">Coverage</span>
              </button>
              <button 
                onClick={() => setActiveTab('comments')}
                className={`py-3 sm:py-4 border-b-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all outline-none ${activeTab === 'comments' ? 'border-yellow-500 text-yellow-500 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                <ListFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[8px] xs:text-[9px] sm:text-[10px]">Timeline</span>
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`py-3 sm:py-4 border-b-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all outline-none ${activeTab === 'stats' ? 'border-yellow-500 text-yellow-500 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[8px] xs:text-[9px] sm:text-[10px]">Stats</span>
              </button>
              <button 
                onClick={() => setActiveTab('squads')}
                className={`py-3 sm:py-4 border-b-2 flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all outline-none ${activeTab === 'squads' ? 'border-yellow-500 text-yellow-500 bg-white/5' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[8px] xs:text-[9px] sm:text-[10px]">Lineups</span>
              </button>
            </div>

            {/* Tab content wrapper with custom scroll */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[450px]">
              
              {/* Coverage Info Tab */}
              {activeTab === 'stream' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-mono text-yellow-500 mb-2">Editor's Summary</h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {match.aiCommentary || (isUpcoming
                        ? "Prep-work is currently in progress at Prabhananda Arena in Narendrapur. Both youth squads have finalized core drills. This group-stage faceoff holds immense qualifications stakes."
                        : `Stunning exhibition of modern soccer tactics displayed by schoolboy teams. The game showcased high athleticism with ${match.homeTeam.name} utilizing a vertical counter-attacking system.`
                      )}
                    </p>
                    {adminUser && (
                      <div className="mt-4 space-y-3">
                        <button
                          onClick={handleGenerateAI}
                          disabled={aiLoading}
                          className="flex items-center gap-2 text-xs font-mono border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 hover:bg-yellow-500/10 transition-colors text-yellow-500 h-9 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="uppercase tracking-widest">{aiLoading ? 'Generating...' : 'Generate AI Commentary'}</span>
                        </button>
                        {aiPreview && (
                          <div className="space-y-2">
                            <p className="text-xs text-white/80 bg-white/5 border border-white/10 p-3 leading-relaxed">{aiPreview}</p>
                            <button
                              onClick={handleSaveAI}
                              className="text-xs font-mono bg-yellow-500 text-black px-4 py-2 hover:bg-white transition-colors h-9 uppercase tracking-widest font-black"
                            >
                              Save Commentary
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 border border-white/10 p-5 font-mono text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-2">
                      <span className="opacity-50">STREAM SOURCE</span>
                      <span className="text-white font-bold text-left sm:text-right">{match.streamUrl || match.highlightsUrl ? 'High-Def Embed' : 'Offline / Standard Feed'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-2">
                      <span className="opacity-50">AUDIO LANGUAGE</span>
                      <span className="text-white font-bold text-left sm:text-right">{audioLanguage}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-2">
                      <span className="opacity-50">REFEREE</span>
                      <span className="text-white font-bold text-left sm:text-right">{refereeName}</span>
                    </div>
                  </div>

                  <div className="border border-[dashed] border-white/10 p-5 text-center">
                    <span className="font-mono text-[10px] text-white/55 block mb-1">OFFICIAL SPORTS PARTNER</span>
                    <span className="text-sm font-black italic tracking-tighter uppercase text-white">{partnerName}</span>
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  <h4 className="text-xs tracking-[0.2em] font-mono uppercase opacity-50 mb-4 text-white flex items-center justify-between">
                    <span>Events Sequence</span>
                    {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  </h4>
                  
                  <div className="space-y-4">
                    {match.events && match.events.length > 0 ? (
                      match.events.map((event) => (
                        <div key={event.id} className="flex gap-4 text-sm group">
                          <span className="text-yellow-500 font-mono text-xs w-8 pt-1 flex-shrink-0">{event.time}</span>
                          <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0 border-[dashed]">
                             <div className="flex items-center gap-2 mb-1">
                               <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 inline-block ${event.type === 'Goal' ? 'bg-yellow-500 text-black' : event.type === 'Yellow Card' ? 'bg-yellow-300 text-black' : event.type === 'Red Card' ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}>
                                 {event.type}
                               </span>
                             </div>
                             <p className="text-white/80 leading-relaxed text-xs">{event.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border border-[dashed] border-white/10">
                        <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">No match timeline events yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-6 pt-2">
                  <h4 className="text-xs uppercase font-mono tracking-widest text-neutral-400 mb-6 border-b border-white/10 pb-2">Squad Comparisons</h4>
                  
                  {isUpcoming ? (
                    <div className="text-center py-12 border border-[dashed] border-white/10">
                      <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">Awaiting Kickoff to render stats</p>
                    </div>
                  ) : (
                    <div className="space-y-6 font-mono text-xs">
                      {/* Possession */}
                      <div className="space-y-2">
                        <div className="flex justify-between font-bold text-white uppercase tracking-wider text-[10px] sm:text-xs gap-1 sm:gap-2">
                          <span className="truncate max-w-[80px] sm:max-w-none">{match.homeTeam.name.substring(0,8)} ({stats.possession[0]}%)</span>
                          <span className="opacity-50 text-[9px] sm:text-xs flex-shrink-0">POSSESSION</span>
                          <span className="truncate max-w-[80px] sm:max-w-none text-right">{match.awayTeam.name.substring(0,8)} ({stats.possession[1]}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 flex overflow-hidden border border-white/5">
                          <div className="bg-yellow-500 h-full transition-all" style={{ width: `${stats.possession[0]}%` }} />
                          <div className="bg-neutral-600 h-full transition-all" style={{ width: `${stats.possession[1]}%` }} />
                        </div>
                      </div>

                      {/* Shots */}
                      <div className="space-y-2">
                        <div className="flex justify-between font-bold text-white uppercase tracking-wider text-[10px] sm:text-xs gap-1 sm:gap-2">
                          <span>{stats.shots[0]} Shots</span>
                          <span className="opacity-50 text-[9px] sm:text-xs flex-shrink-0 font-mono">TOTAL SHOTS</span>
                          <span className="text-right">{stats.shots[1]} Shots</span>
                        </div>
                        <div className="h-2 bg-white/5 flex overflow-hidden border border-white/5">
                          <div 
                            className="bg-yellow-500 h-full transition-all" 
                            style={{ width: `${(stats.shots[0] / (stats.shots[0] + stats.shots[1] || 1)) * 100}%` }} 
                          />
                          <div 
                            className="bg-neutral-600 h-full transition-all" 
                            style={{ width: `${(stats.shots[1] / (stats.shots[0] + stats.shots[1] || 1)) * 100}%` }} 
                          />
                        </div>
                      </div>

                      {/* Fouls */}
                      <div className="space-y-2">
                        <div className="flex justify-between font-bold text-white uppercase tracking-wider text-[10px] sm:text-xs gap-1 sm:gap-2">
                          <span>{stats.fouls[0]} Fouls</span>
                          <span className="opacity-50 text-[9px] sm:text-xs flex-shrink-0 font-mono">FOULS CONCEDED</span>
                          <span className="text-right">{stats.fouls[1]} Fouls</span>
                        </div>
                        <div className="h-2 bg-white/5 flex overflow-hidden border border-white/5">
                          <div 
                            className="bg-yellow-500 h-full transition-all" 
                            style={{ width: `${(stats.fouls[0] / (stats.fouls[0] + stats.fouls[1] || 1)) * 100}%` }} 
                          />
                          <div 
                            className="bg-neutral-600 h-full transition-all" 
                            style={{ width: `${(stats.fouls[1] / (stats.fouls[0] + stats.fouls[1] || 1)) * 100}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lineups Tab */}
              {activeTab === 'squads' && (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-widest text-yellow-500 mb-4">{match.homeTeam.name} Roster</h4>
                    {match.homeTeam.roster && match.homeTeam.roster.length > 0 ? (
                      <div className="space-y-3">
                        {match.homeTeam.roster.map(p => (
                          <div key={p.id} className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                              <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs truncate text-white">{p.name}</h5>
                              <p className="text-[9px] font-mono uppercase text-neutral-500">{p.position}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] font-mono opacity-50 italic uppercase">Awaiting formal team sheet publication</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-widest text-white/50 mb-4">{match.awayTeam.name} Roster</h4>
                    {match.awayTeam.roster && match.awayTeam.roster.length > 0 ? (
                      <div className="space-y-3">
                        {match.awayTeam.roster.map(p => (
                          <div key={p.id} className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                              <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs truncate text-white">{p.name}</h5>
                              <p className="text-[9px] font-mono uppercase text-neutral-500">{p.position}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] font-mono opacity-50 italic uppercase">Awaiting formal team sheet publication</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
