import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.status === 409) {
        setError('That email is already in use. Try logging in instead.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500 rounded-2xl items-center justify-center shadow-lg mb-4">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
          <p className="text-slate-500 mt-1">Join your local community</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" required value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" required value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" required value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" required value={form.confirm} onChange={e => setForm(f=>({...f,confirm:e.target.value}))} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
