import { motion } from 'motion/react';
import { useAppContext } from '../AppContext';

export default function Sponsors() {
  const { sponsors } = useAppContext();

  return (
    <section id="sponsors" className="py-12 sm:py-24 relative bg-[#0A0A0B] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="flex flex-col mb-16">
          <h3 className="text-xs tracking-[0.3em] uppercase opacity-50 mb-6 flex items-center gap-2 text-white">
            <span className="w-4 h-[1px] bg-white/30"></span> Official Partners
          </h3>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
            SUPPORTING<br/>THE FUTURE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sponsors.map((sponsor, index) => (
            <motion.a
              key={sponsor.id}
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group block relative bg-white/5 border border-white/10 p-8 overflow-hidden hover:bg-white/10 transition-colors"
            >
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] tracking-[0.2em] font-mono text-yellow-500 border border-yellow-500/20 px-2 py-1 uppercase bg-yellow-500/10 backdrop-blur-sm">
                  {sponsor.tier}
                </span>
              </div>
              
              <div className="w-full h-32 mb-8 flex items-center justify-center opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 mix-blend-luminosity group-hover:mix-blend-normal">
                <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
              </div>
              
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <h4 className="font-bold text-xl tracking-tighter text-white group-hover:text-yellow-500 transition-colors">{sponsor.name}</h4>
                <svg className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
