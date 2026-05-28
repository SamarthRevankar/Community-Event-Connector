import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import {
  User, Mail, Edit3, Save, X, LogOut,
  Calendar, MapPin, Shield, ChevronRight,
  Lock, Eye, EyeOff, Ticket
} from 'lucide-react';

const TABS = ['Profile', 'My Events', 'Security'];

export default function ProfilePage() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // My events state
  const [myEvents, setMyEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    if (user) {
      const id = setTimeout(() => {
        setForm({ name: user.name || '', bio: user.bio || '', avatar: user.avatar || '' });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'My Events' && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEventsLoading(true);
      eventsApi.getUserEvents(user._id)
        .then(res => setMyEvents(res.data || []))
        .catch(() => setMyEvents([]))
        .finally(() => setEventsLoading(false));
    }
  }, [activeTab, user]);

  if (!user) return null;

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = new Date(user.createdAt || '2026-01-01T00:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    try {
      await updateProfile(form);
      setProfileSuccess('Profile updated!');
      setEditing(false);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    setPwError('');
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const categoryColors = {
    'Technology': 'bg-blue-100 text-blue-700',
    'Sports': 'bg-green-100 text-green-700',
    'Arts': 'bg-pink-100 text-pink-700',
    'Music': 'bg-purple-100 text-purple-700',
    'Food & Drink': 'bg-orange-100 text-orange-700',
    'Education': 'bg-cyan-100 text-cyan-700',
    'Health & Wellness': 'bg-emerald-100 text-emerald-700',
    'Community': 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl overflow-hidden mb-6 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent)]" />
        <div className="relative px-8 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-lg flex-shrink-0">
            {user.avatar
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              : initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-indigo-100 text-sm">{user.email}</p>
            {user.bio && <p className="text-white/80 text-sm mt-1 max-w-sm">{user.bio}</p>}
            <p className="text-indigo-200 text-xs mt-2">Member since {memberSince}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── PROFILE TAB ── */}
          {activeTab === 'Profile' && (
            <div>
              {profileSuccess && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">{profileSuccess}</div>}
              {profileError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{profileError}</div>}

              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio <span className="text-slate-400 font-normal">(max 300 chars)</span></label>
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                      maxLength={300}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
                      placeholder="Tell the community about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Avatar URL</label>
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60">
                      <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setForm({ name: user.name || '', bio: user.bio || '', avatar: user.avatar || '' }); }} className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition">
                      <X className="w-4 h-4" />Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><User className="w-3.5 h-3.5" />NAME</div>
                      <p className="text-slate-900 font-semibold">{user.name}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Mail className="w-3.5 h-3.5" />EMAIL</div>
                      <p className="text-slate-900">{user.email}</p>
                    </div>
                  </div>
                  {user.bio && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1"><Edit3 className="w-3.5 h-3.5" />BIO</div>
                      <p className="text-slate-700 leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
                    <Edit3 className="w-4 h-4" />Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MY EVENTS TAB ── */}
          {activeTab === 'My Events' && (
            <div>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                      <div className="w-12 h-12 rounded-xl skeleton-shimmer flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-44 rounded skeleton-shimmer mb-2" />
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-24 rounded skeleton-shimmer" />
                          <div className="h-3 w-32 rounded skeleton-shimmer" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : myEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Ticket className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-semibold mb-1">No events yet</p>
                  <p className="text-slate-500 text-sm mb-4">Events you create will appear here.</p>
                  <Link to="/events/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
                    Post your first event
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 mb-4">{myEvents.length} event{myEvents.length !== 1 ? 's' : ''} created</p>
                  {myEvents.map(event => {
                    const eventDate = new Date(event.date);
                    const isPast = eventDate < new Date();
                    return (
                      <Link
                        key={event._id}
                        to={`/events/${event._id}`}
                        className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all group"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                          <Calendar className={`w-5 h-5 ${isPast ? 'text-slate-400' : 'text-indigo-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{event.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-500">{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {event.location?.name && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <MapPin className="w-3 h-3" />{event.location.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[event.category] || 'bg-slate-100 text-slate-600'}`}>
                            {event.category}
                          </span>
                          {isPast && <span className="text-xs text-slate-400">Past</span>}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'Security' && (
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Change Password</h2>
                  <p className="text-xs text-slate-500">Keep your account secure</p>
                </div>
              </div>

              {pwSuccess && <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">{pwSuccess}</div>}
              {pwError && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{pwError}</div>}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[{key: 'currentPassword', label: 'Current Password', show: showPw.current, toggle: () => setShowPw(s => ({...s, current: !s.current}))},
                  {key: 'newPassword', label: 'New Password', show: showPw.new, toggle: () => setShowPw(s => ({...s, new: !s.new}))},
                  {key: 'confirmPassword', label: 'Confirm New Password', show: showPw.confirm, toggle: () => setShowPw(s => ({...s, confirm: !s.confirm}))}
                ].map(({key, label, show, toggle}) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={e => setPwForm(f => ({...f, [key]: e.target.value}))}
                        required
                        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 mt-2"
                >
                  <Lock className="w-4 h-4" />{pwSaving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
