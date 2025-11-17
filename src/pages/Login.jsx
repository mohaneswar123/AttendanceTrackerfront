import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AttendanceContext } from '../contexts/AttendanceContext';
import { isUserActive } from '../utils/auth';



function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();
  const { currentUser, login, loading } = useContext(AttendanceContext);

  // Redirect active users away from login, but allow inactive users to access this page
  useEffect(() => {
    if (currentUser && isUserActive()) {
      navigate('/home');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const user = await login(credentials.email, credentials.password);

    // Save user
    localStorage.setItem("loggedUser", JSON.stringify(user));

    // If user is active → go home
    if (user.active === true) {
      navigate("/home");
      return;
    }

    // If inactive or expired → go to inactive page
    navigate("/inactive");

  } catch (err) {
  

  const raw = err?.response?.data;
  const msg = (typeof raw === "string" ? raw : JSON.stringify(raw || "")).toString();


  // inactive / expired
  if (msg.includes("not active") || msg.includes("expired")) {
    navigate("/inactive");
    return;
  }

  alert("Invalid email or password");
}

};





  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-light-primary">
            Sign in to your account
          </h2>
        </div>
        
        {/* Error UI removed: focusing only on redirecting inactive users */}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-secondary placeholder-light-primary/50 text-light-primary bg-dark-secondary rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-dark-secondary placeholder-light-primary/50 text-light-primary bg-dark-secondary rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/register" className="font-medium text-primary-500 hover:text-primary-400">
              Don't have an account? Sign up
            </Link>
          </div>

          <div className="text-sm text-center mt-4">
            <a href="/admin/login" className="font-medium text-light-primary/70 hover:text-primary-500">
              Admin login
            </a>
          </div>
        </form>
        
      </div>
    </div>
  );
}

export default Login;
