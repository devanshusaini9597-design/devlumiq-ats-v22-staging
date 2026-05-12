'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Shield, Search, ChevronDown, X, Check,
  Loader2, AlertTriangle, UserCheck, UserX, Edit2,
  Crown, Eye, Briefcase, UserCog, RefreshCw, Save,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS, ROLES, Role } from '@/lib/roles';

// ─── Types ──────────────────────────────────────────────────────────────────
interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ─── Role config (color) ────────────────────────────────────────────────────
const ROLE_STYLE: Record<Role, { bg: string; text: string; icon: React.ElementType }> = {
  ADMIN:          { bg: 'bg-red-100',    text: 'text-red-700',    icon: Crown },
  RECRUITER:      { bg: 'bg-brand-100',  text: 'text-brand-700',  icon: Briefcase },
  HIRING_MANAGER: { bg: 'bg-violet-100', text: 'text-violet-700', icon: UserCog },
  INTERVIEWER:    { bg: 'bg-amber-100',  text: 'text-amber-700',  icon: UserCheck },
  VIEWER:         { bg: 'bg-stone-100',  text: 'text-stone-600',  icon: Eye },
};

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm text-stone-900 transition-all placeholder:text-stone-400';
const labelCls = 'block text-xs font-semibold text-stone-500 mb-1.5';

// ─── Invite Modal ────────────────────────────────────────────────────────────
function InviteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: UserRow) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('RECRUITER');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Name is required');
    if (!email.trim()) return setError('Email is required');
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), role }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? 'Failed to create user');
      onCreated(data.user);
      onClose();
    } catch {
      setError('Network error, please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 rounded-lg"><Users className="w-4 h-4 text-brand-600" /></div>
            <h2 className="font-bold text-stone-900">Invite Team Member</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className={labelCls}>Full Name</label>
            <input className={inputCls} placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input className={inputCls} type="email" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <div className="relative">
              <select
                className={inputCls + ' appearance-none pr-8'}
                value={role}
                onChange={e => setRole(e.target.value as Role)}
              >
                {(Object.keys(ROLES) as Role[]).map(r => (
                  <option key={r} value={r}>{ROLE_DISPLAY_NAMES[r]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
            <p className="mt-1.5 text-xs text-stone-400">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
          <p className="text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2">
            A temporary password <span className="font-mono font-medium text-stone-600">Welcome123!</span> will be set. The user should change it after first login.
          </p>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating…' : 'Invite User'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Role Edit Dropdown ──────────────────────────────────────────────────────
function RoleSelect({ userId, current, onUpdated }: { userId: string; current: Role; onUpdated: (role: Role) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const change = async (role: Role) => {
    if (role === current) return setOpen(false);
    setSaving(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      if (res.ok) onUpdated(role);
    } finally {
      setSaving(false);
    }
  };

  const style = ROLE_STYLE[current];
  const RoleIcon = style.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={saving}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${style.bg} ${style.text} hover:opacity-80`}
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <RoleIcon className="w-3 h-3" />}
        {ROLE_DISPLAY_NAMES[current]}
        <ChevronDown className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="absolute left-0 top-full mt-1 z-20 bg-white border border-stone-200 rounded-xl shadow-xl min-w-[180px] overflow-hidden"
          >
            {(Object.keys(ROLES) as Role[]).map(r => {
              const s = ROLE_STYLE[r];
              const Icon = s.icon;
              return (
                <button
                  key={r}
                  onClick={() => change(r)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors hover:bg-stone-50 ${r === current ? 'bg-stone-50' : ''}`}
                >
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                    <Icon className="w-3 h-3" />{ROLE_DISPLAY_NAMES[r]}
                  </span>
                  {r === current && <Check className="w-3 h-3 text-brand-500 ml-auto" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { user: me, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [showInvite, setShowInvite] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (u: UserRow) => {
    if (u.id === me?.id) return;
    setTogglingId(u.id);
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !u.isActive }),
        credentials: 'include',
      });
      if (res.ok) {
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !u.isActive } : x));
      }
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="p-4 bg-red-50 rounded-2xl"><Shield className="w-8 h-8 text-red-400" /></div>
        <h2 className="text-lg font-bold text-stone-900">Access Restricted</h2>
        <p className="text-stone-500 text-sm max-w-sm">Only Administrators can manage users and roles. Contact your admin for access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="User Management"
        subtitle="Manage team members, roles, and access permissions"
        icon={Users}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-brand-600 bg-brand-50' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Admins', value: stats.admins, icon: Crown, color: 'text-red-600 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`p-2.5 rounded-xl ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{s.value}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as Role | 'ALL')}
            >
              <option value="ALL">All Roles</option>
              {(Object.keys(ROLES) as Role[]).map(r => (
                <option key={r} value={r}>{ROLE_DISPLAY_NAMES[r]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" />
            </button>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 text-white text-sm font-semibold shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Invite User</span>
              <span className="sm:hidden">Invite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60">
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Last Login</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading users…
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-stone-400">No users found</td></tr>
            ) : filtered.map(u => (
              <motion.tr
                key={u.id}
                layout
                className="hover:bg-stone-50/50 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${u.isActive ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-400'}`}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-semibold ${u.isActive ? 'text-stone-900' : 'text-stone-400'}`}>{u.name}</p>
                      <p className="text-xs text-stone-400">{u.email}</p>
                    </div>
                    {u.id === me?.id && (
                      <span className="text-xs px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded font-medium">You</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {u.id === me?.id ? (
                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_STYLE[u.role].bg} ${ROLE_STYLE[u.role].text}`}>
                      {(() => { const Icon = ROLE_STYLE[u.role].icon; return <Icon className="w-3 h-3" />; })()}
                      {ROLE_DISPLAY_NAMES[u.role]}
                    </span>
                  ) : (
                    <RoleSelect
                      userId={u.id}
                      current={u.role}
                      onUpdated={role => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role } : x))}
                    />
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                    {u.isActive ? <><UserCheck className="w-3 h-3" />Active</> : <><UserX className="w-3 h-3" />Inactive</>}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-stone-400">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                </td>
                <td className="px-5 py-3.5">
                  {u.id !== me?.id && (
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={togglingId === u.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        u.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      } disabled:opacity-50`}
                    >
                      {togglingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : u.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && (
          <div className="px-5 py-3 border-t border-stone-50 bg-stone-50/40 text-xs text-stone-400">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex flex-col items-center py-10 text-stone-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-sm text-stone-400">No users found</p>
        ) : filtered.map(u => {
          const style = ROLE_STYLE[u.role];
          const RoleIcon = style.icon;
          return (
            <motion.div key={u.id} layout className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${u.isActive ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-400'}`}>
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 truncate">{u.name}</p>
                  <p className="text-xs text-stone-400 truncate">{u.email}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-400">Role:</span>
                  {u.id === me?.id ? (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                      <RoleIcon className="w-3 h-3" />{ROLE_DISPLAY_NAMES[u.role]}
                    </span>
                  ) : (
                    <RoleSelect
                      userId={u.id}
                      current={u.role}
                      onUpdated={role => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role } : x))}
                    />
                  )}
                </div>
                {u.id !== me?.id && (
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={togglingId === u.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                      u.isActive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {togglingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : u.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    {u.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                )}
              </div>

              <p className="text-xs text-stone-400">
                Last login: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal
            onClose={() => setShowInvite(false)}
            onCreated={u => setUsers(prev => [u, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
