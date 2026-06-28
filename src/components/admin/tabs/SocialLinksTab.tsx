import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../AppContext';

export default function SocialLinksTab() {
  const { socialLinks, updateSocialLinks } = useAppContext();
  const [form, setForm] = useState(socialLinks);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(socialLinks);
  }, [socialLinks]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSocialLinks(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white mb-6">Social Media Links</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-4">
            <Field
              label="Facebook URL"
              value={form.facebook}
              onChange={v => handleChange('facebook', v)}
              placeholder="https://facebook.com/..."
            />
            <Field
              label="Instagram URL"
              value={form.instagram}
              onChange={v => handleChange('instagram', v)}
              placeholder="https://instagram.com/..."
            />
            <Field
              label="X (formerly Twitter) URL"
              value={form.x}
              onChange={v => handleChange('x', v)}
              placeholder="https://x.com/..."
            />
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
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}
