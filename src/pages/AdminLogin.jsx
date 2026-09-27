import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { errorMessage } from '../services/api';

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { adminLogin, loading } = useContext(AttendanceContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(credentials.email, credentials.password);
      navigate('/admin/dashboard');
    } catch (err) {
      // The server's own wording covers both a wrong password and being locked out
      setError(errorMessage(err, 'Sign-in failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="surface w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <span className="w-11 h-11 mx-auto rounded-lg bg-primary-600 text-primary-foreground text-sm font-bold flex items-center justify-center">AH</span>
          <h1 className="mt-4 text-xl font-semibold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-400">For the people who manage accounts.</p>
        </div>

        {error && <div className="notice notice-danger mb-5" role="alert">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-email" className="label">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="admin@example.com"
              value={credentials.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="label">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-primary-300 hover:text-primary-200">Student sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
