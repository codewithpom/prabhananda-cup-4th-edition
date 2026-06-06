import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../AppContext';

export default function HeroTab() {
  const { heroContent, updateHeroContent } = useAppContext();
  const [form, setForm] = useState(heroContent);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(heroContent);
  }, [heroContent]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHeroContent(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white mb-6">Hero Section Content</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title Line 1" value={form.titleLine1} onChange={v => handleChange('titleLine1', v)} placeholder="PRABHA" />
            <Field label="Title Line 2" value={form.titleLine2} onChange={v => handleChange('titleLine2', v)} placeholder="NANDA" />
          </div>
          <Field label="Badge Text" value={form.badgeText} onChange={v => handleChange('badgeText', v)} placeholder="CUP 4TH ED" hint="Yellow badge below the title" />
          <Field label="Subtitle" value={form.subtitleText} onChange={v => handleChange('subtitleText', v)} placeholder="Under-16 State Championship" />
          <Field
            label="Background Image URL"
            value={form.backgroundImageUrl}
            onChange={v => handleChange('backgroundImageUrl', v)}
            placeholder="https://... (leave empty to use default)"
            hint="Direct image URL. Leave empty to use the bundled action shot."
          />
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

      {/* Live Preview */}
      <div className="hidden lg:block">
        <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white mb-6">Preview</h3>
        <div className="bg-black border border-white/10 p-6 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
          {form.backgroundImageUrl && (
            <img src={form.backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="relative z-10 text-center">
            <h1
              className="text-4xl font-black tracking-tighter uppercase italic text-transparent leading-tight"
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}
            >
              {form.titleLine1 || 'PRABHA'}<br />{form.titleLine2 || 'NANDA'}
            </h1>
            <div className="mt-3 flex flex-col items-center gap-2">
              <div className="bg-yellow-500 text-black px-3 py-1 skew-x-[-12deg] font-black text-sm italic">
                {form.badgeText || 'CUP 4TH ED'}
              </div>
              <span className="text-xs font-light tracking-widest opacity-70 uppercase text-white">
                {form.subtitleText || 'Under-16 State Championship'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
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
      {hint && <p className="text-[9px] font-mono text-white/30">{hint}</p>}
    </div>
  );
}
