import React from 'react';
import { Link } from 'react-router-dom';

// Shown to guests on pages that only work for signed-in students
function LoginPrompt({ icon, title, message }) {
  return (
    <div className="glass-panel rounded-3xl p-10 text-center max-w-lg mx-auto mt-10">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/login" className="btn btn-primary">Log in</Link>
        <Link to="/register" className="btn btn-outline">Create an account</Link>
      </div>
    </div>
  );
}

export default LoginPrompt;
