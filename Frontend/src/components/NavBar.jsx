import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Menu, X, Plus, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo + Post Event */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 hidden sm:block">Community Event</span>
            </Link>
            <Link to="/events/new" className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              <Plus className="w-4 h-4" />Post Event
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
              Browse Events
            </Link>

            {user ? (
              /* Logged-in user dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-slate-200 py-1 animate-fade-in">
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="w-4 h-4" />My Profile
                    </Link>
                    <Link to="/events/new" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <Plus className="w-4 h-4" />Post Event
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" />Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest buttons */
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Sign In</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700">Browse Events</Link>
              <Link to="/events/new" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                <Plus className="w-4 h-4" />Post Event
              </Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                    <User className="w-4 h-4" />My Profile
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
