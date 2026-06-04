import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

const ProfilePage = () => {
  const { user, logout, isAuthenticated, loading, updateUser } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    matricule: '',
    program: '',
    year: '',
    department: '',
    notificationsEnabled: true,
    emailReminders: true,
    theme: 'light',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        matricule: user.matricule || '',
        program: user.program || '',
        year: user.year || '',
        department: user.department || '',
        notificationsEnabled: user.preferences?.notificationsEnabled !== false,
        emailReminders: user.preferences?.emailReminders !== false,
        theme: user.preferences?.theme || 'light',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    setError('');
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const updateData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        matricule: form.matricule,
        program: form.program,
        year: form.year,
        department: form.department,
        notificationsEnabled: form.notificationsEnabled,
        emailReminders: form.emailReminders,
        theme: form.theme,
      };
      if (form.newPassword) updateData.newPassword = form.newPassword;
      const result = await authService.updateProfile(updateData);
      updateUser(result.user);
      setIsEditing(false);
      setForm({ ...form, newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 pt-28 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="mb-8 rounded-2xl border-l-4 border-sky-500 bg-[var(--surface-soft)]/80 dark:bg-[var(--surface-soft)]/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 animate-welcome dark:border-sky-400">
          <p className="text-base sm:text-lg text-[var(--text)] font-bold">
            Manage your profile
          </p>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 sm:mt-2">
            Update your personal information and settings.
          </p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-slate-200 overflow-x-auto dark:border-slate-700">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'personal'
                ? 'border-b-2 border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`px-4 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'academic'
                ? 'border-b-2 border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            Academic
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-b-2 border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-3 font-semibold transition whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-b-2 border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            Preferences
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end mb-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-60 dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>

        {activeTab === 'personal' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                First name
              </p>
              {isEditing ? (
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              ) : (
                <p className="mt-3 text-lg font-medium text-slate-900">
                  {user?.firstName || 'Not provided'}
                </p>
              )}
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Last name
              </p>
              {isEditing ? (
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              ) : (
                <p className="mt-3 text-lg font-medium text-slate-900">
                  {user?.lastName || 'Not provided'}
                </p>
              )}
            </div>
            <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email Address
              </p>
              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              ) : (
                <p className="mt-3 text-lg font-medium text-slate-900 break-all">
                  {user?.email || 'Not provided'}
                </p>
              )}
            </div>
            <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Matricule / Student ID
              </p>
              {isEditing ? (
                <input
                  name="matricule"
                  value={form.matricule}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              ) : (
                <p className="mt-3 text-lg font-medium text-slate-900">
                  {user?.matricule || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Program / Degree
              </p>
              {isEditing ? (
                <input
                  name="program"
                  value={form.program}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              ) : (
                <p className="mt-3 text-lg font-medium text-slate-900">
                  {form.program || 'Not provided'}
                </p>
              )}
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Academic Year
              </p>
              {isEditing ? (
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="">Select year</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                  <option value="5th">5th Year</option>
                </select>
              ) : (
                <p className="mt-3 text-lg font-medium text-slate-900">
                  {form.year || 'Not provided'}
                </p>
              )}
            </div>
            <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Department / Faculty
              </p>
              {isEditing ? (
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g., School of Engineering"
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              ) : (
                <p className="mt-3 text-lg font-medium text-slate-900">
                  {form.department || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
                Change Password
              </p>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-600">
                      New Password
                    </label>
                    <input
                      name="newPassword"
                      type="password"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password (leave blank to keep current)"
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">
                      Confirm Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="mt-2 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-slate-600">••••••••</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="grid gap-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
                Notifications
              </p>
              {isEditing ? (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="notificationsEnabled"
                      checked={form.notificationsEnabled}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-700">
                      Enable push notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailReminders"
                      checked={form.emailReminders}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-700">
                      Receive email reminders for tasks
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2 text-slate-700">
                  <p>
                    Push notifications:{' '}
                    {form.notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p>
                    Email reminders:{' '}
                    {form.emailReminders ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
                Theme
              </p>
              {isEditing ? (
                <select
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-900"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="auto">Auto (System)</option>
                </select>
              ) : (
                <p className="text-slate-700 capitalize">{form.theme} Mode</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-4 border-b border-slate-200 pb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Account Actions
            </h3>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-rose-500 px-6 py-3 text-base font-semibold text-white hover:bg-rose-600 hover:scale-105 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
