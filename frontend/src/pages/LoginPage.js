import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const result = await authService.login({ email, password });
      login(result);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Login failed. Check your credentials.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 flex items-center justify-center px-4 py-6 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-300 bg-white p-6 sm:p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Logo className="text-slate-800" />
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">
              SmartStudy Planner
            </h1>
            <p className="text-slate-600">
              Sign in to access your study dashboard.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500"
              placeholder="student@buea.edu.cm"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500"
              placeholder="Enter your password"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 hover:scale-105"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-slate-600">New here?</p>
          <Link
            to="/register"
            className="inline-flex w-full justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200 sm:w-auto"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
