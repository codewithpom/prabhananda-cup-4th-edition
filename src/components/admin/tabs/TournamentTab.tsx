import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../AppContext';

export default function TournamentTab() {
  const { tournamentMeta, updateTournamentMeta } = useAppContext();
  const [form, setForm] = useState(tournamentMeta);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(tournamentMeta);
  }, [tournamentMeta]);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTournamentMeta(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white mb-6">Tournament Settings</h3>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tournament Name" value={form.name} onChange={v => handleChange('name', v)} />
          <Field label="Edition" value={form.edition} onChange={v => handleChange('edition', v)} placeholder="4th Edition" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Year" type="number" value={String(form.year)} onChange={v => handleChange('year', Number(v))} />
          <Field label="Tagline" value={form.tagline} onChange={v => handleChange('tagline', v)} />
        </div>
        <Field
          label="Match Day Status Badge"
          value={form.matchDay}
          onChange={v => handleChange('matchDay', v)}
          placeholder="MATCH DAY 04 • LIVE NOW"
          hint="Shown in navbar — e.g. MATCH DAY 04 • LIVE NOW"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tournament Start Date" type="date" value={form.startDate} onChange={v => handleChange('startDate', v)} />
          <Field label="Tournament End Date" type="date" value={form.endDate} onChange={v => handleChange('endDate', v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Official Partner / Sponsor" value={form.officialPartner || ''} onChange={v => handleChange('officialPartner', v)} placeholder="KOLKATA ATHLETICS MEDIA" hint="Shown in the match details modal" />
          <Field label="Referee" value={form.referee || ''} onChange={v => handleChange('referee', v)} placeholder="P. K. Bandyopadhyay" hint="Shown under match coverage" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Audio Language</label>
          <select
            value={form.audioLanguage || 'Hindi / Bengali / English'}
            onChange={e => handleChange('audioLanguage', e.target.value)}
            className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11 transition-colors"
          >
            <option value="Hindi / Bengali / English">Hindi / Bengali / English</option>
            <option value="Hindi">Hindi</option>
            <option value="Bengali">Bengali</option>
            <option value="English">English</option>
          </select>
          <p className="text-[9px] font-mono text-white/30">Choose the language tag shown on the match details card.</p>
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
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11 transition-colors"
      />
      {hint && <p className="text-[9px] font-mono text-white/30">{hint}</p>}
    </div>
  );
}
