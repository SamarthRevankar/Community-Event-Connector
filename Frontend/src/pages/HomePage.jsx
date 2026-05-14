import { useEffect, useState } from 'react'
import { MapPin, Search, Zap, Users, Calendar } from 'lucide-react'
import axios from 'axios'

// ── Feature cards for the hero section ───────────────────
const features = [
  {
    icon: MapPin,
    title: 'Discover on the Map',
    desc: 'See every local event pinned on an interactive map. Find what\'s happening near you at a glance.',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: Search,
    title: 'Search & Filter',
    desc: 'Filter by category — Technology, Sports, Arts, Music, and more. Find exactly what interests you.',
    color: 'text-accent-600',
    bg: 'bg-accent-50',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    desc: 'New events appear instantly for everyone. No refresh needed — the app is always live.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Users,
    title: 'Easy RSVP',
    desc: 'Register for events in seconds. See who else is attending. Cancel anytime.',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
]

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking')

  // Check backend connectivity (development helper)
  useEffect(() => {
    axios.get('/api/health')
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'))
  }, [])

  return (
    <div className="animate-fade-in">

      {/* ── Hero Section ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-surface-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
        </div>

        <div className="page-container section relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Real-time events · Updated live
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold mb-6 leading-tight">
              Discover Events
              <span className="block text-gradient mt-1">In Your Community</span>
            </h1>

            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
              Browse local events by location, filter by category, and register — all in one place.
              No more searching social media. Everything is here.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#events" className="btn-accent text-base px-6 py-3 rounded-2xl">
                <Calendar className="w-5 h-5" />
                Browse Events
              </a>
              <a href="/events/new" className="btn text-base px-6 py-3 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20">
                <MapPin className="w-5 h-5" />
                Post an Event
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── API Status (dev only) ───────────────────────── */}
      {apiStatus !== 'connected' && (
        <div className={`py-2 text-center text-xs font-medium ${
          apiStatus === 'disconnected'
            ? 'bg-red-50 text-red-600'
            : 'bg-yellow-50 text-yellow-600'
        }`}>
          {apiStatus === 'checking'
            ? '⏳ Connecting to backend...'
            : '⚠️  Backend not reachable — start the Express server on port 5000'}
        </div>
      )}
      {apiStatus === 'connected' && (
        <div className="py-2 text-center text-xs font-medium bg-emerald-50 text-emerald-700">
          ✅ Backend connected — API is live
        </div>
      )}

      {/* ── Features Grid ──────────────────────────────── */}
      <section className="section bg-white" id="features">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">
              Everything You Need to Connect
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              From discovery to registration — Community Event Connector covers the full journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card p-6 group cursor-default">
                <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Events Section (placeholder — filled in Phase 3) ─ */}
      <section className="section bg-surface-50" id="events">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">
              Upcoming Events
            </h2>
            <p className="text-slate-500">
              Full event listings coming in Phase 3. Backend API is being built in Phase 2.
            </p>
          </div>

          {/* Placeholder skeleton cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-3 bg-surface-200 rounded w-1/3 mb-4" />
                <div className="h-5 bg-surface-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-surface-200 rounded w-full mb-2" />
                <div className="h-3 bg-surface-200 rounded w-2/3 mb-6" />
                <div className="flex gap-3">
                  <div className="h-3 bg-surface-200 rounded w-1/3" />
                  <div className="h-3 bg-surface-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
