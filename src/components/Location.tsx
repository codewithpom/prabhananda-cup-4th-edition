import { useAppContext } from '../AppContext';

export default function Location() {
  const { venueInfo } = useAppContext();

  return (
    <section id="location" className="py-12 sm:py-24 relative bg-[#0A0A0B] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <h3 className="text-xs tracking-[0.3em] uppercase opacity-50 mb-6 flex items-center gap-2 text-white">
          <span className="w-4 h-[1px] bg-white/30"></span> The Venue
        </h3>
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
            BATTLEGROUND
          </h2>
          <div className="text-left md:text-right flex flex-col md:items-end">
            <span className="font-bold text-white text-lg sm:text-xl">{venueInfo.name}</span>
            <span className="opacity-60 text-xs sm:text-sm font-mono mt-1">{venueInfo.address}</span>
          </div>
        </div>
        <div className="w-full aspect-[4/3] xs:aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/7] bg-white/5 border border-white/10 p-2 relative group hover:border-yellow-500/50 transition-colors">
          {venueInfo.mapEmbedUrl ? (
            <iframe
              src={venueInfo.mapEmbedUrl}
              className="w-full h-full filter grayscale hover:grayscale-0 pointer-events-auto transition-all duration-700"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white/30 font-mono text-xs uppercase tracking-widest">Map embed URL not configured</p>
            </div>
          )}
          <div className="absolute top-6 left-6 pointer-events-none">
            <span className="bg-black/90 px-4 py-2 border border-white/20 text-xs font-mono tracking-widest text-white backdrop-blur-md">
              {venueInfo.stadiumLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
