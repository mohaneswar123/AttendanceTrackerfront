import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { isUserActive } from '../utils/auth';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const navigate = useNavigate();
  const { currentUser, register, loading } = useContext(AttendanceContext);

  useEffect(() => {
    if (currentUser && isUserActive()) navigate('/');
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email') {
      setEmailExists(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userData = {
        username: formData.name,
        email: formData.email,
        password: formData.password
      };

      const result = await register(userData);

      if (result.success) {
        navigate('/login');
      } else {
        const msg = result.message || 'Registration failed';
        setError(msg);
        if (/email/i.test(msg) && /(exist|already)/i.test(msg)) {
          setEmailExists(true);
        }
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-[100px] -z-10 animate-float" />

      <div className="max-w-md w-full space-y-8 glass-card p-8 md:p-10 relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 drop-shadow-sm">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Join now to track your attendance seamlessly
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-fade-in" role="alert">
            <span className="text-lg">⚠️</span>
            <span className="block sm:inline mt-0.5">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="label">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`input ${emailExists ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {emailExists && (
                <p className="mt-2 text-xs text-rose-400 flex flex-col gap-1 pl-1">
                  <span>This email is already registered. <Link to="/login" className="underline font-semibold hover:text-rose-300">Login here</Link></span>
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 ${loading
                  ? 'bg-slate-700 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 hover:shadow-neon-primary hover:-translate-y-0.5'
                }`}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Reigster'}
            </button>
          </div>

          <div className="text-sm text-center mt-6">
            <Link to="/login" className="font-medium text-slate-400 hover:text-white transition-colors">
              Already have an account? <span className="text-primary-400 hover:text-primary-300">Sign in</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
