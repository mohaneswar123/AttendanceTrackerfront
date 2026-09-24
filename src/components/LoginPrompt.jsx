import React from 'react';
import { Link } from 'react-router-dom';

// Shown to guests on pages that only work for signed-in students
function LoginPrompt({ title, message }) {
  return (
    <div className="surface max-w-md mx-auto mt-10 p-8 text-center">
      <h1 className="page-title">{title}</h1>
      <p className="text-sm text-slate-400 mt-2 mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Link to="/login" className="btn btn-primary px-5">Sign in</Link>
        <Link to="/register" className="btn btn-secondary px-5">Create an account</Link>
      </div>
    </div>
  );
}

export default LoginPrompt;
