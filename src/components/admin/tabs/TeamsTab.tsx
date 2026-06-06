import React, { useState } from 'react';
import { Trash2, Plus, X, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { useAppContext } from '../../../AppContext';
import { Team, Player } from '../../../types';

const POSITIONS: Player['position'][] = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];
const GROUPS = ['A', 'B', 'C', 'D'];

const EMPTY_TEAM: Omit<Team, 'id' | 'roster'> = { name: '', logo: '', group: 'A' };
const EMPTY_PLAYER: Omit<Player, 'id'> = { name: '', photo: '', position: 'Forward', bio: '' };

export default function TeamsTab() {
  const { teams, upsertTeam, deleteTeam } = useAppContext();
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addTeamForm, setAddTeamForm] = useState(EMPTY_TEAM);
  const [newPlayerForms, setNewPlayerForms] = useState<Record<string, Omit<Player, 'id'>>>({});
  const [editTeamForms, setEditTeamForms] = useState<Record<string, Omit<Team, 'id' | 'roster'>>>({});
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTeamForm.name) return;
    setSaving(true);
    try {
      const id = `team_${Date.now()}`;
      await upsertTeam({ id, ...addTeamForm, roster: [] });
      setAddTeamForm(EMPTY_TEAM);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeamEdit = async (team: Team) => {
    const form = editTeamForms[team.id];
    if (!form) return;
    setSaving(true);
    try {
      await upsertTeam({ ...team, ...form });
      setEditingTeamId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    setDeletingId(teamId);
    try {
      await deleteTeam(teamId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddPlayer = async (team: Team, e: React.FormEvent) => {
    e.preventDefault();
    const form = newPlayerForms[team.id] || EMPTY_PLAYER;
    if (!form.name) return;
    setSaving(true);
    try {
      const playerId = `p_${Date.now()}`;
      const updatedTeam: Team = {
        ...team,
        roster: [...(team.roster || []), { id: playerId, ...form }],
      };
      await upsertTeam(updatedTeam);
      setNewPlayerForms(prev => ({ ...prev, [team.id]: EMPTY_PLAYER }));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlayer = async (team: Team, playerId: string) => {
    setSaving(true);
    try {
      const updatedTeam: Team = {
        ...team,
        roster: (team.roster || []).filter(p => p.id !== playerId),
      };
      await upsertTeam(updatedTeam);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs tracking-[0.3em] font-mono opacity-50 uppercase text-white">Teams & Rosters</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 text-xs font-mono border border-white/20 px-3 py-2 hover:bg-white/10 transition-colors text-white h-9"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="uppercase tracking-widest">{showAdd ? 'Cancel' : 'Add Team'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddTeam} className="bg-white/5 border border-yellow-500/30 p-5 mb-6 space-y-4">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-yellow-500">New Team</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Team Name</label>
              <input
                type="text"
                value={addTeamForm.name}
                onChange={e => setAddTeamForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Group</label>
              <select
                value={addTeamForm.group}
                onChange={e => setAddTeamForm(f => ({ ...f, group: e.target.value }))}
                className="w-full bg-[#0A0A0B] border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11"
              >
                {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">Logo URL</label>
            <input
              type="url"
              value={addTeamForm.logo}
              onChange={e => setAddTeamForm(f => ({ ...f, logo: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/20 px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono h-11"
            />
          </div>
          <button type="submit" disabled={saving} className="bg-yellow-500 text-black font-black uppercase tracking-tighter px-6 py-2.5 hover:bg-white transition-colors h-11 text-xs disabled:opacity-50">
            {saving ? 'Adding...' : 'Add Team'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => {
          const isExpanded = expandedTeamId === team.id;
          const isEditingTeam = editingTeamId === team.id;
          const editForm = editTeamForms[team.id];
          const playerForm = newPlayerForms[team.id] || EMPTY_PLAYER;

          return (
            <div key={team.id} className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
              {/* Team Header */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-white">{team.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {isEditingTeam ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm?.name ?? team.name}
                          onChange={e => setEditTeamForms(prev => ({ ...prev, [team.id]: { ...(prev[team.id] || { name: team.name, logo: team.logo, group: team.group }), name: e.target.value } }))}
                          className="w-full bg-white/10 border border-white/20 px-2 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-500 font-mono"
                        />
                        <input
                          type="url"
                          value={editForm?.logo ?? team.logo}
                          onChange={e => setEditTeamForms(prev => ({ ...prev, [team.id]: { ...(prev[team.id] || { name: team.name, logo: team.logo, group: team.group }), logo: e.target.value } }))}
                          placeholder="Logo URL"
                          className="w-full bg-white/10 border border-white/20 px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                        />
                        <div className="flex gap-2">
                          <select
                            value={editForm?.group ?? team.group}
                            onChange={e => setEditTeamForms(prev => ({ ...prev, [team.id]: { ...(prev[team.id] || { name: team.name, logo: team.logo, group: team.group }), group: e.target.value } }))}
                            className="bg-[#0A0A0B] border border-white/20 px-2 py-1.5 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                          >
                            {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
                          </select>
                          <button onClick={() => handleSaveTeamEdit(team)} disabled={saving} className="text-xs bg-yellow-500 text-black px-3 py-1.5 hover:bg-white transition-colors font-black disabled:opacity-50">Save</button>
                          <button onClick={() => setEditingTeamId(null)} className="text-xs border border-white/20 px-2 py-1.5 hover:bg-white/10 transition-colors text-white">✕</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-black text-sm text-white tracking-tight truncate">{team.name}</h4>
                        <span className="text-[10px] font-mono text-white/40">Group {team.group} • {team.roster?.length || 0} players</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {!isEditingTeam && (
                    <button
                      onClick={() => { setEditingTeamId(team.id); setEditTeamForms(prev => ({ ...prev, [team.id]: { name: team.name, logo: team.logo, group: team.group } })); }}
                      className="text-[10px] font-mono border border-white/20 px-3 py-1.5 hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-1 uppercase tracking-widest"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                    className="text-[10px] font-mono border border-white/20 px-3 py-1.5 hover:bg-white/10 transition-colors text-white/50 hover:text-white flex items-center gap-1.5 flex-1 justify-center uppercase tracking-widest"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Roster
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    disabled={deletingId === team.id}
                    className="w-8 h-8 border border-red-500/30 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Roster Panel */}
              {isExpanded && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/50">Players</h4>

                  {(team.roster || []).map(player => (
                    <div key={player.id} className="flex items-center gap-2 bg-white/5 px-3 py-2">
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{player.name}</span>
                        <span className="text-[9px] font-mono text-white/40">{player.position}</span>
                      </div>
                      <button
                        onClick={() => handleDeletePlayer(team, player.id)}
                        className="w-7 h-7 flex items-center justify-center text-red-500/50 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {(team.roster || []).length === 0 && (
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">No players added yet</p>
                  )}

                  {/* Add Player Form */}
                  <div className="pt-2 space-y-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                      <UserPlus className="w-3 h-3" /> Add Player
                    </div>
                    <input
                      type="text"
                      value={playerForm.name}
                      onChange={e => setNewPlayerForms(prev => ({ ...prev, [team.id]: { ...playerForm, name: e.target.value } }))}
                      placeholder="Player name"
                      className="w-full bg-white/5 border border-white/20 px-2 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                    />
                    <input
                      type="url"
                      value={playerForm.photo}
                      onChange={e => setNewPlayerForms(prev => ({ ...prev, [team.id]: { ...playerForm, photo: e.target.value } }))}
                      placeholder="Photo URL (optional)"
                      className="w-full bg-white/5 border border-white/20 px-2 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                    />
                    <select
                      value={playerForm.position}
                      onChange={e => setNewPlayerForms(prev => ({ ...prev, [team.id]: { ...playerForm, position: e.target.value as Player['position'] } }))}
                      className="w-full bg-[#0A0A0B] border border-white/20 px-2 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                    >
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input
                      type="text"
                      value={playerForm.bio}
                      onChange={e => setNewPlayerForms(prev => ({ ...prev, [team.id]: { ...playerForm, bio: e.target.value } }))}
                      placeholder="Short bio (optional)"
                      className="w-full bg-white/5 border border-white/20 px-2 py-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                    />
                    <button
                      onClick={e => handleAddPlayer(team, e)}
                      disabled={saving || !playerForm.name}
                      className="w-full bg-white/10 text-white font-mono text-[10px] uppercase tracking-widest py-2 hover:bg-white/20 transition-colors disabled:opacity-50 border border-white/10"
                    >
                      {saving ? 'Adding...' : '+ Add to Roster'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-16 border border-dashed border-white/10">
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">No teams yet. Add the first team above.</p>
        </div>
      )}
    </div>
  );
}
