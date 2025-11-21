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

  // Redirect only if already logged in AND active; otherwise keep Register accessible
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
      // Clear duplicate warning when user edits email
      setEmailExists(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
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
    <div className="min-h-screen flex items-center justify-center bg-dark-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-light-primary">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-light-primary/60 text-sm">
            Give your working email for daily reminders and further help if needed
          </p>
        </div>
        
        {error && (
          <div className="bg-dark-secondary border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-secondary placeholder-light-primary/50 text-light-primary bg-dark-secondary rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-light-primary/50 text-light-primary bg-dark-secondary focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${emailExists ? 'border-red-500' : 'border-dark-secondary'}`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {emailExists && (
                <p className="mt-2 text-xs text-red-400 flex flex-col gap-1">
                  <span>⚠️ This email is already registered.</span>
                  <span>
                    <Link to="/login" className="underline font-semibold text-primary-400 hover:text-primary-300">Login</Link> or use a different email.
                  </span>
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-secondary placeholder-light-primary/50 text-light-primary bg-dark-secondary focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-secondary placeholder-light-primary/50 text-light-primary bg-dark-secondary rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md ${loading ? 'bg-primary-400 cursor-not-allowed text-dark-primary/50' : 'bg-primary-500 hover:bg-primary-600 text-dark-primary'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-primary-500 hover:text-primary-400">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
