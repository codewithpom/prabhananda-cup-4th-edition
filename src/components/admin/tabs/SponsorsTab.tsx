import React, { useState } from 'react';
import { Trash2, Plus, Edit2, X, Check } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { Sponsor } from '../../../types';

const EMPTY_SPONSOR: Omit<Sponsor, 'id'> = {
  name: '',
  logoUrl: '',
  tier: 'Gold',
  websiteUrl: '',
};

const TIER_OPTIONS: Sponsor['tier'][] = ['Title', 'Platinum', 'Gold'];

export default function SponsorsTab() {
  const { sponsors, upsertSponsor, deleteSponsor } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Sponsor, 'id'>>(EMPTY_SPONSOR);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<Omit<Sponsor, 'id'>>(EMPTY_SPONSOR);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (sponsor: Sponsor) => {
    setEditingId(sponsor.id);
    setEditForm({ name: sponsor.name, logoUrl: sponsor.logoUrl, tier: sponsor.tier, websiteUrl: sponsor.websiteUrl });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      await upsertSponsor({ id, ...editForm });
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = `s${Date.now()}`;
      await upsertSponsor({ id, ...addForm });
      setAddForm(EMPTY_SPONSOR);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSponsor(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white">Sponsors & Partners</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 text-xs font-mono border border-white/20 px-3 py-2 hover:bg-white/10 transition-colors text-white h-9"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="uppercase tracking-widest">{showAdd ? 'Cancel' : 'Add Sponsor'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white/5 border border-yellow-500/30 p-5 mb-6 space-y-4">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-yellow-500">New Sponsor</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SponsorField label="Name" value={addForm.name} onChange={v => setAddForm(f => ({ ...f, name: v }))} required />
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Tier</label>
              <select
                value={addForm.tier}
                onChange={e => setAddForm(f => ({ ...f, tier: e.target.value as Sponsor['tier'] }))}
                className="w-full bg-[#0A0A0B] border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11"
              >
                {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <SponsorField label="Logo URL" value={addForm.logoUrl} onChange={v => setAddForm(f => ({ ...f, logoUrl: v }))} placeholder="https://..." />
          <SponsorField label="Website URL" value={addForm.websiteUrl} onChange={v => setAddForm(f => ({ ...f, websiteUrl: v }))} placeholder="https://..." />
          <button type="submit" disabled={saving} className="bg-yellow-500 text-black font-black uppercase tracking-tighter px-6 py-2.5 hover:bg-white transition-colors disabled:opacity-50 h-11 text-xs">
            {saving ? 'Adding...' : 'Add Sponsor'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {sponsors.map(sponsor => (
          <div key={sponsor.id} className="bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-colors">
            {editingId === sponsor.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SponsorField label="Name" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Tier</label>
                    <select
                      value={editForm.tier}
                      onChange={e => setEditForm(f => ({ ...f, tier: e.target.value as Sponsor['tier'] }))}
                      className="w-full bg-[#0A0A0B] border border-white/20 px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-10"
                    >
                      {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <SponsorField label="Logo URL" value={editForm.logoUrl} onChange={v => setEditForm(f => ({ ...f, logoUrl: v }))} />
                <SponsorField label="Website URL" value={editForm.websiteUrl} onChange={v => setEditForm(f => ({ ...f, websiteUrl: v }))} />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(sponsor.id)} disabled={saving} className="flex items-center gap-1.5 text-xs font-mono bg-yellow-500 text-black px-4 py-2 hover:bg-white transition-colors h-9 disabled:opacity-50">
                    <Check className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 text-xs font-mono border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors text-white h-9">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {sponsor.logoUrl && (
                  <img src={sponsor.logoUrl} alt={sponsor.name} className="w-10 h-10 object-contain bg-white/10 p-1 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-sm text-white truncate">{sponsor.name}</span>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 border flex-shrink-0 ${
                      sponsor.tier === 'Title' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                      sponsor.tier === 'Platinum' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                      'text-amber-600 border-amber-600/30 bg-amber-600/10'
                    }`}>{sponsor.tier}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 truncate block">{sponsor.websiteUrl}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(sponsor)} className="w-9 h-9 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sponsor.id)}
                    disabled={deletingId === sponsor.id}
                    className="w-9 h-9 border border-red-500/30 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {sponsors.length === 0 && (
          <div className="text-center py-12 border border-dashed border-white/10">
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">No sponsors yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SponsorField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11 transition-colors"
      />
    </div>
  );
}
