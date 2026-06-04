import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    matricule: '',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const result = await authService.register(form);
      login(result);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Registration failed. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 flex items-center justify-center px-4 py-6 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-300 bg-white p-6 sm:p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex flex-col items-center gap-4">
          <Logo className="text-slate-800" />
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-slate-800">
              Create your account
            </h1>
            <p className="mt-2 text-slate-600">
              Register today and start planning your study time smarter.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">
              First name
            </span>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-700">Last name</span>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-700">Matricule</span>
            <input
              name="matricule"
              value={form.matricule}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            />
          </label>

          <button
            type="submit"
            className="md:col-span-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 hover:scale-105"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 md:col-span-2">
          Already have an account?{' '}
          <Link
            to="/"
            className="font-semibold text-sky-600 hover:text-sky-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
