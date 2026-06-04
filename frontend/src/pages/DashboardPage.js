import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import recommendationService from '../services/recommendationService';
import sessionService from '../services/sessionService';
import taskService from '../services/taskService';

const DashboardPage = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await taskService.getTasks();
      setTasks(result?.tasks || []);
    } catch (err) {
      setError('Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecommendations = useCallback(async () => {
    try {
      const result = await recommendationService.getRecommendations();
      setRecommendations(result?.recommendations || []);
    } catch (err) {
      console.error('Recommendation load error:', err);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const result = await sessionService.getSessions();
      setSessions(result?.sessions || []);
    } catch (err) {
      console.error('Unable to load sessions.', err);
    }
  }, []);

  const { socket } = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !socket) {
      return undefined;
    }

    socket.on('session:created', loadSessions);
    socket.on('session:updated', loadSessions);
    socket.on('recommendations:updated', loadRecommendations);
    socket.on('task:updated', loadTasks);
    socket.on('productivity:updated', loadRecommendations);

    return () => {
      socket.off('session:created', loadSessions);
      socket.off('session:updated', loadSessions);
      socket.off('recommendations:updated', loadRecommendations);
      socket.off('task:updated', loadTasks);
      socket.off('productivity:updated', loadRecommendations);
    };
  }, [isAuthenticated, socket, loadSessions, loadRecommendations, loadTasks]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
      loadRecommendations();
      loadSessions();
    }
  }, [isAuthenticated, loadTasks, loadRecommendations, loadSessions]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.status === 'completed',
    ).length;
    const overdue = tasks.filter(
      (task) =>
        task.status !== 'completed' &&
        task.dueDate &&
        new Date(task.dueDate) < new Date(),
    ).length;
    const upcoming = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) >= new Date(),
    ).length;
    return { total, completed, overdue, upcoming };
  }, [tasks]);

  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  const sessionCount = sessions.filter((session) => session.completed).length;
  const averageSessionDuration = sessions.length
    ? Math.round(sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length)
    : 0;

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== 'completed' && task.dueDate && new Date(task.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks]);

  const handleComplete = async (taskId) => {
    setSaving(true);
    setActionMessage('');
    try {
      await taskService.updateTask(taskId, {
        status: 'completed',
        completedDate: new Date().toISOString(),
      });
      setActionMessage('Task marked complete.');
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) {
      return;
    }
    setSaving(true);
    setActionMessage('');
    try {
      await taskService.deleteTask(taskId);
      setActionMessage('Task deleted successfully.');
      await loadTasks();
      await loadRecommendations();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task.');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptRecommendation = async (recommendationId) => {
    setSaving(true);
    setActionMessage('');
    try {
      await recommendationService.acceptRecommendation(recommendationId);
      await loadTasks();
      await loadRecommendations();
      setActionMessage('Recommendation applied to your schedule.');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to apply recommendation.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRejectRecommendation = async (recommendationId) => {
    setSaving(true);
    setActionMessage('');
    try {
      await recommendationService.rejectRecommendation(recommendationId);
      await loadRecommendations();
      setActionMessage('Recommendation dismissed.');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to dismiss recommendation.',
      );
    } finally {
      setSaving(false);
    }
  };

  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100' : 'bg-[var(--bg)] text-[var(--text)]'} pt-20 sm:pt-24 md:pt-28`}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        <div className="mb-8 sm:mb-10 rounded-2xl border-l-4 border-cyan-400 bg-[var(--surface-soft)]/80 dark:bg-[var(--surface-soft)]/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 animate-welcome">
          <p className="text-base sm:text-lg text-[var(--text)] font-bold">
            Welcome back,{' '}
            <span className="font-semibold text-[var(--accent)]">
              {user?.firstName || 'Student'}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 sm:mt-2">
            Your study plan is built from deadlines, task priority, and
            recommended focus blocks.
          </p>
        </div>

        {error && (
          <div className="mt-6 sm:mt-8 rounded-2xl bg-rose-900/30 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-rose-400 border border-rose-700/50">
            {error}
          </div>
        )}
        {actionMessage && (
          <div className="mt-6 sm:mt-8 rounded-2xl bg-emerald-900/30 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-emerald-400 border border-emerald-700/50">
            {actionMessage}
          </div>
        )}

        <div className="mt-8 sm:mt-10 grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <div
            style={{ animationDelay: '80ms' }}
            className="rounded-3xl bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-500 p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 animate-fade-up dark:border-sky-400"
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400 font-bold">
              Overall progress
            </p>
            <p className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold text-sky-800 dark:text-sky-300 animate-pulse">
              {completionRate}%
            </p>
            <div className="mt-4 sm:mt-6 h-2 sm:h-3 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900/40">
              <div
                className="h-full rounded-full bg-sky-500 progress-animate"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-4 sm:mt-6 flex items-center justify-between text-xs sm:text-sm text-sky-600 dark:text-sky-400">
              <span>{stats.completed} completed</span>
              <span>{stats.total} total</span>
            </div>
          </div>
          <div
            style={{ animationDelay: '160ms' }}
            className="rounded-3xl bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 animate-fade-up dark:border-amber-400"
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400 font-bold">
              Due soon
            </p>
            <p className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-300 animate-bounce">
              {stats.upcoming}
            </p>
            <div className="mt-4 sm:mt-6 h-2 sm:h-3 rounded-full bg-amber-100 dark:bg-amber-900/40">
              <div
                className="h-full rounded-full bg-amber-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-amber-600 dark:text-amber-400">
              Tasks scheduled for the next days.
            </p>
          </div>
          <div
            style={{ animationDelay: '240ms' }}
            className="rounded-3xl bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500 p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 animate-fade-up dark:border-cyan-400"
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-400 font-bold">
              Overdue
            </p>
            <p className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold text-cyan-900 dark:text-cyan-300 animate-bounce">
              {stats.overdue}
            </p>
            <div className="mt-4 sm:mt-6 h-2 sm:h-3 rounded-full bg-cyan-100 dark:bg-cyan-900/40">
              <div
                className="h-full rounded-full bg-cyan-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-cyan-600 dark:text-cyan-400">
              Tasks that need your attention first.
            </p>
          </div>
          <div
            style={{ animationDelay: '320ms' }}
            className="rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl hover:scale-105 transition duration-200 animate-fade-up dark:border-emerald-400"
          >
            <p className="text-xs sm:text-sm uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400 font-bold">
              Sessions completed
            </p>
            <p className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-bold text-emerald-800 dark:text-emerald-300 animate-pulse">
              {sessionCount}
            </p>
            <div className="mt-4 sm:mt-6 h-2 sm:h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <div
                className="h-full rounded-full bg-emerald-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
              Avg. session {averageSessionDuration} min
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
          <section className="rounded-3xl bg-[var(--surface)] dark:bg-[var(--surface-soft)] backdrop-blur p-8 shadow-lg border border-[var(--border)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text)]">
                  Smart recommendations
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Let the planner suggest the next best move.
                </p>
              </div>
              <button
                onClick={loadRecommendations}
                className="rounded-2xl px-4 py-2 btn-outline"
              >
                Refresh
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {recommendations.length === 0 ? (
                <div className="rounded-3xl bg-[var(--surface)] p-6 text-[var(--muted)]">
                  No recommendations available yet. Add a task to get started.
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div
                    key={rec._id}
                    className="rounded-3xl border border-sky-200 dark:border-sky-700/50 bg-sky-50 dark:bg-sky-900/20 p-6 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:shadow-md transition duration-200"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-sky-700 dark:text-sky-400 font-semibold">
                          {rec.recommendationType.replace('-', ' ')}
                        </p>
                        <p className="mt-3 text-lg font-semibold text-sky-900 dark:text-sky-200">
                          {rec.taskId?.title || 'Task recommendation'}
                        </p>
                        <p className="mt-2 text-sm text-sky-700 dark:text-sky-400">
                          {rec.reason}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAcceptRecommendation(rec._id)}
                          disabled={saving}
                          className="rounded-2xl px-4 py-2 btn-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRecommendation(rec._id)}
                          disabled={saving}
                          className="rounded-2xl px-4 py-2 btn-outline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-[var(--surface)] p-8 shadow-sm border border-[var(--border)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text)]">
                  Upcoming tasks
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Quick view of your next study work.
                </p>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="rounded-2xl px-4 py-2 btn-outline"
              >
                Open calendar
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {loading ? (
                <div className="rounded-3xl bg-[var(--surface)] p-6 text-[var(--muted)]">
                  Loading tasks...
                </div>
              ) : upcomingTasks.length === 0 ? (
                <div className="rounded-3xl bg-[var(--surface)] p-6 text-[var(--muted)]">
                  No upcoming tasks found. Add a task to build your schedule.
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] dark:bg-[var(--surface-soft)] p-5 hover:bg-[var(--surface-soft)] dark:hover:bg-[var(--surface-strong)] hover:shadow-md transition duration-200"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-[var(--text)]">
                          {task.title}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {task.course || 'General study task'}
                        </p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Due{' '}
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : 'unknown'}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
                          <button
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className="rounded-2xl px-4 py-2 text-sm w-full sm:w-auto btn-outline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/tasks/${task._id}/edit`)}
                            className="rounded-2xl px-4 py-2 text-sm w-full sm:w-auto btn-outline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
                          <button
                            onClick={() => handleComplete(task._id)}
                            className="rounded-2xl px-4 py-2 text-sm w-full sm:w-auto btn-accent font-semibold"
                            disabled={saving || task.status === 'completed'}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="rounded-2xl px-4 py-2 text-sm w-full sm:w-auto btn-outline btn-danger"
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
