import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import BackgroundImage from '../assets/images/action_shot_1779535595929.png';
import { useAppContext } from '../AppContext';
import { useState, useEffect } from 'react';

export default function Hero() {
  const { fixtures, setSelectedMatchId, heroContent } = useAppContext();
  const nextMatch = [...fixtures].sort((a, b) => (a.date + a.time) < (b.date + b.time) ? -1 : 1).find(m => m.status === 'UPCOMING');

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!nextMatch) return;
    const matchTime = new Date(`${nextMatch.date}T${nextMatch.time}:00`).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = matchTime - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextMatch]);

  const bgSrc = heroContent.backgroundImageUrl || BackgroundImage;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={bgSrc}
          alt="Stadium"
          className="w-full h-full object-cover opacity-60 scale-105 transform animate-[slow-zoom_20s_linear_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0A0A0B]/80 to-[#0A0A0B]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 sm:px-8 mt-12">
        <div className="relative text-center">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[48px] sm:text-[80px] md:text-[140px] leading-[0.85] md:leading-[0.8] font-black tracking-tighter uppercase italic text-transparent block select-none"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}
          >
            {heroContent.titleLine1}<br />{heroContent.titleLine2}
          </motion.h1>
          <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 flex justify-center pointer-events-none">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-[48px] sm:text-[80px] md:text-[140px] leading-[0.85] md:leading-[0.8] font-black tracking-tighter uppercase italic text-white mix-blend-overlay"
            >
              {heroContent.titleLine1}<br />{heroContent.titleLine2}
            </motion.h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center text-center"
        >
          <div className="bg-yellow-500 text-black px-4 py-1.5 sm:px-6 sm:py-2 skew-x-[-12deg] font-black text-sm sm:text-xl italic">
            {heroContent.badgeText}
          </div>
          <span className="text-sm sm:text-xl font-light tracking-widest opacity-80 uppercase text-white">
            {heroContent.subtitleText}
          </span>
        </motion.div>

        {nextMatch && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            onClick={() => setSelectedMatchId(nextMatch.id)}
            className="mt-10 sm:mt-12 flex flex-col items-center gap-2 cursor-pointer group/countdown p-3 sm:p-4 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all w-full max-w-[480px] sm:max-w-none"
            title="Open match details"
          >
            <span className="text-[9px] sm:text-[10px] tracking-[0.3em] font-mono uppercase text-yellow-500 group-hover/countdown:text-white transition-colors">Next Match Kickoff</span>
            <div className="flex items-center gap-1.5 sm:gap-4 text-center justify-center w-full">
              {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit, i) => (
                <div key={unit} className="flex items-center gap-1.5 sm:gap-4">
                  {i > 0 && <span className="text-lg sm:text-2xl font-black opacity-30">:</span>}
                  <div className="flex flex-col bg-white/5 border border-white/10 p-2 sm:p-3 min-w-[55px] sm:min-w-[70px]">
                    <span className={`text-xl sm:text-3xl font-black tabular-nums ${unit === 'seconds' ? 'text-yellow-500' : ''}`}>
                      {String(timeLeft[unit]).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-50 mt-1 capitalize">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-80 group-hover/countdown:text-yellow-500 transition-colors flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 font-sans text-center">
              <span>{nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}</span>
              <span className="text-[8px] sm:text-[9px] opacity-40 font-mono font-normal tracking-wide lowercase group-hover/countdown:opacity-100 transition-opacity">(click to view page)</span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 w-full sm:w-auto"
        >
          <a href="#live" className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-white text-black font-black uppercase tracking-tighter overflow-hidden transition-all hover:scale-105 active:scale-95 text-sm sm:text-base">
            <div className="absolute inset-0 bg-yellow-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            <span className="relative z-10 flex items-center gap-2">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              Watch Live
            </span>
          </a>
          <a href="#fixtures" className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 font-black uppercase tracking-tighter text-white border border-white/20 hover:bg-white flex justify-center hover:text-black transition-colors text-sm sm:text-base">
            View Schedule
          </a>
        </motion.div>
      </div>
    </section>
  );
}
