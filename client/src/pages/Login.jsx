import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo } from '../components/icons/index.jsx';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/app" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-1">
          <Logo className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Stock<span className="text-brand-600">Flow</span>
          </h1>
        </div>
        <p className="text-sm muted mb-6">Sign in to your account.</p>
        <div className="mb-4 rounded-md bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/30 text-brand-700 dark:text-brand-200 text-xs p-3">
          Demo login: <code>demo@stockflow.local</code> / <code>demo1234</code>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600 text-center">
          No account?{' '}
          <Link to="/signup" className="text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
