import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../AppContext';

export default function VenueTab() {
  const { venueInfo, updateVenueInfo } = useAppContext();
  const [form, setForm] = useState(venueInfo);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(venueInfo);
  }, [venueInfo]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateVenueInfo(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white mb-6">Venue / Location</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venue Name" value={form.name} onChange={v => handleChange('name', v)} />
            <Field label="Stadium Label" value={form.stadiumLabel} onChange={v => handleChange('stadiumLabel', v)} placeholder="MAIN STADIUM" />
          </div>
          <Field label="Address" value={form.address} onChange={v => handleChange('address', v)} />
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Google Maps Embed URL</label>
            <textarea
              value={form.mapEmbedUrl}
              onChange={e => handleChange('mapEmbedUrl', e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono transition-colors resize-none"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-[9px] font-mono text-white/30">
              In Google Maps: Share → Embed a map → copy the src URL from the iframe code
            </p>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black font-black uppercase tracking-tighter px-8 py-3 hover:bg-yellow-500 transition-colors disabled:opacity-50 h-11"
            >
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Map Preview */}
      {form.mapEmbedUrl && (
        <div>
          <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white mb-4">Map Preview</h3>
          <div className="w-full aspect-video bg-white/5 border border-white/10 relative overflow-hidden">
            <iframe
              src={form.mapEmbedUrl}
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute top-3 left-3 pointer-events-none">
              <span className="bg-black/90 px-3 py-1.5 border border-white/20 text-xs font-mono tracking-widest text-white">
                {form.stadiumLabel || 'STADIUM'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11 transition-colors"
      />
    </div>
  );
}
