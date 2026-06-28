import React, { useState } from 'react';
import { Trash2, Plus, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { Match, PlayEvent } from '../../../types';
import { generateMatchCommentary } from '../../../services/gemini';

const EMPTY_EVENT: Omit<PlayEvent, 'id'> = {
  time: '',
  type: 'Goal',
  description: '',
};

const EMPTY_MATCH = {
  homeTeamId: '',
  awayTeamId: '',
  date: '',
  time: '',
  status: 'UPCOMING' as Match['status'],
  homeScore: null as number | null,
  awayScore: null as number | null,
  streamUrl: '',
  highlightsUrl: '',
};

export default function MatchesTab() {
  const { fixtures, teams, updateMatch, addMatch, deleteMatch, addEvent } = useAppContext();
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [eventForms, setEventForms] = useState<Record<string, Omit<PlayEvent, 'id'>>>({});
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_MATCH);
  const [aiState, setAiState] = useState<Record<string, { loading: boolean; result: string; saved: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Local editable fields for expanded match view (stream/highlights/stats)
  const [editForms, setEditForms] = useState<Record<string, {
    streamUrl?: string;
    highlightsUrl?: string;
    stats?: {
      possession?: [number | '', number | ''];
      shots?: [number | '', number | ''];
      fouls?: [number | '', number | ''];
    };
    homeTeamName?: string;
    awayTeamName?: string;
    homeTeamTbd?: boolean;
    awayTeamTbd?: boolean;
  }>>({});

  const handleSaveMatchDetails = async (matchId: string) => {
    const form = editForms[matchId];
    if (!form) return;
    const updates: Record<string, unknown> = {};
    if (typeof form.streamUrl !== 'undefined') updates.streamUrl = form.streamUrl || null;
    if (typeof form.highlightsUrl !== 'undefined') updates.highlightsUrl = form.highlightsUrl || null;
    if (typeof form.homeTeamName !== 'undefined') updates.homeTeamName = form.homeTeamName.trim() || null;
    if (typeof form.awayTeamName !== 'undefined') updates.awayTeamName = form.awayTeamName.trim() || null;
    if (typeof form.homeTeamTbd !== 'undefined') updates.homeTeamTbd = form.homeTeamTbd;
    if (typeof form.awayTeamTbd !== 'undefined') updates.awayTeamTbd = form.awayTeamTbd;
    if (form.stats) {
      const { possession, shots, fouls } = form.stats;
      updates.stats = {
        possession: possession ? [Number(possession[0] || 0), Number(possession[1] || 0)] : undefined,
        shots: shots ? [Number(shots[0] || 0), Number(shots[1] || 0)] : undefined,
        fouls: fouls ? [Number(fouls[0] || 0), Number(fouls[1] || 0)] : undefined,
      };
    }
    setSavingId(matchId);
    try {
      await updateMatch(matchId, updates);
    } finally {
      setSavingId(null);
    }
  };

  const handleScoreChange = async (matchId: string, field: 'homeScore' | 'awayScore', value: string) => {
    const num = value === '' ? null : parseInt(value) || 0;
    await updateMatch(matchId, { [field]: num });
  };

  const handleStatusChange = async (matchId: string, status: Match['status']) => {
    await updateMatch(matchId, { status });
  };

  const handleQuickScore = async (matchId: string, team: 'home' | 'away', delta: number) => {
    const match = fixtures.find(item => item.id === matchId);
    if (!match) return;
    const current = team === 'home' ? match.homeScore : match.awayScore;
    const next = Math.max(0, (current ?? 0) + delta);
    await updateMatch(matchId, { [team === 'home' ? 'homeScore' : 'awayScore']: next });
  };

  const handleQuickEvent = (matchId: string, type: PlayEvent['type']) => {
    setEventForms(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || EMPTY_EVENT),
        type,
        description: prev[matchId]?.description || `${type} added quickly`,
      },
    }));
  };

  const handleAddEvent = async (matchId: string, e: React.FormEvent) => {
    e.preventDefault();
    const form = eventForms[matchId] || EMPTY_EVENT;
    if (!form.time || !form.description) return;
    await addEvent(matchId, form);
    setEventForms(prev => ({ ...prev, [matchId]: EMPTY_EVENT }));
  };

  const handleGenerateAI = async (match: Match) => {
    setAiState(prev => ({ ...prev, [match.id]: { loading: true, result: '', saved: false } }));
    try {
      const result = await generateMatchCommentary(match);
      setAiState(prev => ({ ...prev, [match.id]: { loading: false, result, saved: false } }));
    } catch {
      setAiState(prev => ({ ...prev, [match.id]: { loading: false, result: 'Failed to generate commentary. Check your Gemini API key.', saved: false } }));
    }
  };

  const handleSaveAI = async (match: Match) => {
    const commentary = aiState[match.id]?.result;
    if (!commentary) return;
    setSavingId(match.id);
    try {
      await updateMatch(match.id, { aiCommentary: commentary } as Partial<Match>);
      setAiState(prev => ({ ...prev, [match.id]: { ...prev[match.id], saved: true } }));
    } finally {
      setSavingId(null);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.homeTeamId || !addForm.awayTeamId || !addForm.date || !addForm.time) return;
    await addMatch({ ...addForm, streamUrl: addForm.streamUrl || undefined, highlightsUrl: addForm.highlightsUrl || undefined });
    setAddForm(EMPTY_MATCH);
    setShowAddMatch(false);
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Delete this match? This cannot be undone.')) return;
    setDeletingId(matchId);
    try {
      await deleteMatch(matchId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleExpand = (match: Match) => {
    const isOpen = expandedMatchId === match.id;
    if (isOpen) {
      setExpandedMatchId(null);
      return;
    }
    setEditForms(prev => ({
      ...prev,
      [match.id]: {
        streamUrl: match.streamUrl ?? '',
        highlightsUrl: match.highlightsUrl ?? '',
        stats: {
          possession: match.stats?.possession ? [match.stats.possession[0], match.stats.possession[1]] : ['', ''],
          shots: match.stats?.shots ? [match.stats.shots[0], match.stats.shots[1]] : ['', ''],
          fouls: match.stats?.fouls ? [match.stats.fouls[0], match.stats.fouls[1]] : ['', ''],
        },
        homeTeamName: match.homeTeamName ?? match.homeTeam.name,
        awayTeamName: match.awayTeamName ?? match.awayTeam.name,
        homeTeamTbd: Boolean(match.homeTeamTbd),
        awayTeamTbd: Boolean(match.awayTeamTbd),
      }
    }));
    setExpandedMatchId(match.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white">Fixtures & Scores</h3>
        <button
          onClick={() => setShowAddMatch(!showAddMatch)}
          className="flex items-center gap-2 text-xs font-mono border border-white/20 px-3 py-2 hover:bg-white/10 transition-colors text-white h-9"
        >
          {showAddMatch ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="uppercase tracking-widest">{showAddMatch ? 'Cancel' : 'Add Match'}</span>
        </button>
      </div>

      {showAddMatch && (
        <form onSubmit={handleAddMatch} className="bg-white/5 border border-yellow-500/30 p-5 mb-6 space-y-4">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-yellow-500">New Fixture</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Home Team</label>
              <select
                value={addForm.homeTeamId}
                onChange={e => setAddForm(f => ({ ...f, homeTeamId: e.target.value }))}
                required
                className="w-full bg-[#0A0A0B] border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11"
              >
                <option value="">Select team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Away Team</label>
              <select
                value={addForm.awayTeamId}
                onChange={e => setAddForm(f => ({ ...f, awayTeamId: e.target.value }))}
                required
                className="w-full bg-[#0A0A0B] border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11"
              >
                <option value="">Select team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Date</label>
              <input type="date" value={addForm.date} onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))} required className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Time</label>
              <input type="time" value={addForm.time} onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))} required className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Status</label>
              <select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value as Match['status'] }))} className="w-full bg-[#0A0A0B] border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11">
                <option value="UPCOMING">UPCOMING</option>
                <option value="LIVE">LIVE</option>
                <option value="FINISHED">FINISHED</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Stream URL (optional)</label>
              <input type="url" value={addForm.streamUrl} onChange={e => setAddForm(f => ({ ...f, streamUrl: e.target.value }))} placeholder="https://youtube.com/embed/..." className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Highlights URL (optional)</label>
              <input type="url" value={addForm.highlightsUrl} onChange={e => setAddForm(f => ({ ...f, highlightsUrl: e.target.value }))} placeholder="https://youtube.com/embed/..." className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11" />
            </div>
          </div>
          <button type="submit" className="bg-yellow-500 text-black font-black uppercase tracking-tighter px-6 py-2.5 hover:bg-white transition-colors h-11 text-xs">
            Create Fixture
          </button>
        </form>
      )}

      <div className="space-y-4">
        {fixtures.map(match => {
          const isExpanded = expandedMatchId === match.id;
          const eventForm = eventForms[match.id] || EMPTY_EVENT;
          const ai = aiState[match.id];

          return (
            <div key={match.id} className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              {/* Match Header */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <span className="font-mono text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1 uppercase tracking-widest border border-yellow-500/20 self-start">
                    {match.date}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="bg-[#0A0A0B] border border-white/20 text-xs py-2 px-3 focus:outline-none focus:border-yellow-500 text-white font-mono uppercase tracking-widest h-9"
                      value={match.status}
                      onChange={e => handleStatusChange(match.id, e.target.value as Match['status'])}
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="LIVE">LIVE</option>
                      <option value="FINISHED">FINISHED</option>
                    </select>
                    <button
                      onClick={() => handleStatusChange(match.id, 'LIVE')}
                      className="text-[10px] font-mono uppercase tracking-widest border border-green-500/30 bg-green-500/10 px-3 py-2 hover:bg-green-500/20 text-green-400 h-9"
                    >
                      Set Live
                    </button>
                    <button
                      onClick={() => handleStatusChange(match.id, 'FINISHED')}
                      className="text-[10px] font-mono uppercase tracking-widest border border-red-500/30 bg-red-500/10 px-3 py-2 hover:bg-red-500/20 text-red-400 h-9"
                    >
                      Set Finished
                    </button>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleToggleExpand(match)}
                      className="flex items-center gap-1.5 text-xs font-mono border border-white/20 px-3 py-2 hover:bg-white/10 transition-colors text-white/50 hover:text-white h-9"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span className="uppercase tracking-widest hidden sm:inline">Events & AI</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      disabled={deletingId === match.id}
                      className="w-9 h-9 border border-red-500/30 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Score Editor */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-end gap-2">
                      <input
                        type="text"
                        value={editForms[match.id]?.homeTeamName ?? match.homeTeamName ?? match.homeTeam.name}
                        onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), homeTeamName: e.target.value } }))}
                        placeholder="Home team"
                        className="w-full max-w-[220px] bg-[#0A0A0B] border border-white/20 px-3 py-2 text-right text-sm font-black tracking-tighter text-white focus:outline-none focus:border-yellow-500"
                      />
                      <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/50">
                        <input
                          type="checkbox"
                          checked={Boolean(editForms[match.id]?.homeTeamTbd ?? match.homeTeamTbd)}
                          onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), homeTeamTbd: e.target.checked } }))}
                          className="accent-yellow-500"
                        />
                        Show TBD
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleQuickScore(match.id, 'home', 1)} className="w-7 h-7 text-[10px] font-mono border border-white/20 hover:bg-white/10 text-white">+1</button>
                      <button onClick={() => handleQuickScore(match.id, 'home', -1)} className="w-7 h-7 text-[10px] font-mono border border-white/20 hover:bg-white/10 text-white">−1</button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0A0A0B] border border-white/20 text-center font-black text-2xl text-yellow-500 focus:outline-none focus:border-yellow-500 transition-colors"
                      value={match.homeScore ?? ''}
                      placeholder="–"
                      onChange={e => handleScoreChange(match.id, 'homeScore', e.target.value)}
                    />
                    <span className="opacity-30 text-sm">:</span>
                    <input
                      type="number"
                      min="0"
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0A0A0B] border border-white/20 text-center font-black text-2xl text-white focus:outline-none focus:border-yellow-500 transition-colors"
                      value={match.awayScore ?? ''}
                      placeholder="–"
                      onChange={e => handleScoreChange(match.id, 'awayScore', e.target.value)}
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleQuickScore(match.id, 'away', 1)} className="w-7 h-7 text-[10px] font-mono border border-white/20 hover:bg-white/10 text-white">+1</button>
                      <button onClick={() => handleQuickScore(match.id, 'away', -1)} className="w-7 h-7 text-[10px] font-mono border border-white/20 hover:bg-white/10 text-white">−1</button>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start gap-2">
                      <input
                        type="text"
                        value={editForms[match.id]?.awayTeamName ?? match.awayTeamName ?? match.awayTeam.name}
                        onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), awayTeamName: e.target.value } }))}
                        placeholder="Away team"
                        className="w-full max-w-[220px] bg-[#0A0A0B] border border-white/20 px-3 py-2 text-left text-sm font-black tracking-tighter text-white focus:outline-none focus:border-yellow-500"
                      />
                      <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/50">
                        <input
                          type="checkbox"
                          checked={Boolean(editForms[match.id]?.awayTeamTbd ?? match.awayTeamTbd)}
                          onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), awayTeamTbd: e.target.checked } }))}
                          className="accent-yellow-500"
                        />
                        Show TBD
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded: Events & AI Commentary */}
              {isExpanded && (
                <div className="border-t border-white/10 p-4 sm:p-5 space-y-6">
                  {/* Existing Events */}
                  {match.events && match.events.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3">Match Events</h4>
                      <div className="space-y-2">
                        {match.events.map(ev => (
                          <div key={ev.id} className="flex gap-3 text-xs font-mono bg-white/5 px-3 py-2">
                            <span className="text-yellow-500 w-8 flex-shrink-0">{ev.time}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] uppercase flex-shrink-0 self-start ${ev.type === 'Goal' ? 'bg-yellow-500 text-black' : ev.type === 'Yellow Card' ? 'bg-yellow-300 text-black' : ev.type === 'Red Card' ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}>
                              {ev.type}
                            </span>
                            <span className="text-white/70 leading-relaxed">{ev.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Event Form */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3">Add Event</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(['Goal','Yellow Card','Red Card','Substitution','Commentary'] as PlayEvent['type'][]).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleQuickEvent(match.id, type)}
                          className="text-[10px] font-mono uppercase tracking-widest border border-white/20 px-3 py-1.5 hover:bg-white/10 text-white/70"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={e => handleAddEvent(match.id, e)} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={eventForm.time}
                        onChange={e => setEventForms(prev => ({ ...prev, [match.id]: { ...eventForm, time: e.target.value } }))}
                        placeholder="45'"
                        className="w-full sm:w-16 bg-white/5 border border-white/20 px-2 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                      />
                      <select
                        value={eventForm.type}
                        onChange={e => setEventForms(prev => ({ ...prev, [match.id]: { ...eventForm, type: e.target.value as PlayEvent['type'] } }))}
                        className="bg-[#0A0A0B] border border-white/20 px-2 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9 sm:w-36"
                      >
                        <option>Goal</option>
                        <option>Yellow Card</option>
                        <option>Red Card</option>
                        <option>Substitution</option>
                        <option>Commentary</option>
                      </select>
                      <input
                        type="text"
                        value={eventForm.description}
                        onChange={e => setEventForms(prev => ({ ...prev, [match.id]: { ...eventForm, description: e.target.value } }))}
                        placeholder="Event description..."
                        className="flex-1 bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                      />
                      <button type="submit" className="bg-white text-black font-black uppercase tracking-tighter px-4 py-2 hover:bg-yellow-500 transition-colors h-9 text-xs flex-shrink-0">
                        Add
                      </button>
                    </form>
                  </div>

                  {/* AI Commentary */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3">AI Commentary (Gemini)</h4>
                    {match.aiCommentary && !ai?.result && (
                      <p className="text-xs text-white/60 bg-white/5 border border-white/10 p-3 mb-3 leading-relaxed">{match.aiCommentary}</p>
                    )}
                    <button
                      onClick={() => handleGenerateAI(match)}
                      disabled={ai?.loading}
                      className="flex items-center gap-2 text-xs font-mono border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 hover:bg-yellow-500/10 transition-colors text-yellow-500 h-9 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-widest">{ai?.loading ? 'Generating...' : 'Generate AI Commentary'}</span>
                    </button>
                    {ai?.result && (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-white/80 bg-white/5 border border-white/10 p-4 leading-relaxed">{ai.result}</p>
                        <button
                          onClick={() => handleSaveAI(match)}
                          disabled={savingId === match.id || ai.saved}
                          className="text-xs font-mono bg-yellow-500 text-black px-4 py-2 hover:bg-white transition-colors h-9 disabled:opacity-50 uppercase tracking-widest font-black"
                        >
                          {ai.saved ? '✓ Saved to Match' : savingId === match.id ? 'Saving...' : 'Save to Match'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stream & Highlights + Stats */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3">Stream & Highlights</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <input
                        type="url"
                        value={editForms[match.id]?.streamUrl ?? ''}
                        onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), streamUrl: e.target.value } }))}
                        placeholder="https://youtube.com/embed/..."
                        className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                      />
                      <input
                        type="url"
                        value={editForms[match.id]?.highlightsUrl ?? ''}
                        onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), highlightsUrl: e.target.value } }))}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                      />
                    </div>

                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50 mb-3">Match Stats</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Possession %</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForms[match.id]?.stats?.possession?.[0] ?? ''}
                            onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), stats: { ...(prev[match.id]?.stats || {}), possession: [e.target.value === '' ? '' : Number(e.target.value), prev[match.id]?.stats?.possession?.[1] ?? ''] } } }))}
                            className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForms[match.id]?.stats?.possession?.[1] ?? ''}
                            onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), stats: { ...(prev[match.id]?.stats || {}), possession: [prev[match.id]?.stats?.possession?.[0] ?? '', e.target.value === '' ? '' : Number(e.target.value)] } } }))}
                            className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Shots</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editForms[match.id]?.stats?.shots?.[0] ?? ''}
                            onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), stats: { ...(prev[match.id]?.stats || {}), shots: [e.target.value === '' ? '' : Number(e.target.value), prev[match.id]?.stats?.shots?.[1] ?? ''] } } }))}
                            className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                          />
                          <input
                            type="number"
                            min="0"
                            value={editForms[match.id]?.stats?.shots?.[1] ?? ''}
                            onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), stats: { ...(prev[match.id]?.stats || {}), shots: [prev[match.id]?.stats?.shots?.[0] ?? '', e.target.value === '' ? '' : Number(e.target.value)] } } }))}
                            className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Fouls</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editForms[match.id]?.stats?.fouls?.[0] ?? ''}
                            onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), stats: { ...(prev[match.id]?.stats || {}), fouls: [e.target.value === '' ? '' : Number(e.target.value), prev[match.id]?.stats?.fouls?.[1] ?? ''] } } }))}
                            className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                          />
                          <input
                            type="number"
                            min="0"
                            value={editForms[match.id]?.stats?.fouls?.[1] ?? ''}
                            onChange={e => setEditForms(prev => ({ ...prev, [match.id]: { ...(prev[match.id] || {}), stats: { ...(prev[match.id]?.stats || {}), fouls: [prev[match.id]?.stats?.fouls?.[0] ?? '', e.target.value === '' ? '' : Number(e.target.value)] } } }))}
                            className="w-full bg-white/5 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono h-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleSaveMatchDetails(match.id)}
                        disabled={savingId === match.id}
                        className="text-xs font-mono bg-yellow-500 text-black px-4 py-2 hover:bg-white transition-colors h-9 disabled:opacity-50 uppercase tracking-widest font-black"
                      >
                        {savingId === match.id ? 'Saving...' : 'Save Details'}
                      </button>
                      <button
                        onClick={() => setEditForms(prev => ({ ...prev, [match.id]: { streamUrl: match.streamUrl || '', highlightsUrl: match.highlightsUrl || '', stats: { possession: match.stats?.possession ? [match.stats.possession[0], match.stats.possession[1]] : ['', ''], shots: match.stats?.shots ? [match.stats.shots[0], match.stats.shots[1]] : ['', ''], fouls: match.stats?.fouls ? [match.stats.fouls[0], match.stats.fouls[1]] : ['', ''] }, homeTeamName: match.homeTeamName ?? match.homeTeam.name, awayTeamName: match.awayTeamName ?? match.awayTeam.name, homeTeamTbd: Boolean(match.homeTeamTbd), awayTeamTbd: Boolean(match.awayTeamTbd) } }))}
                        className="text-xs font-mono bg-white/5 text-white px-4 py-2 hover:bg-white/10 transition-colors h-9 uppercase tracking-widest"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
