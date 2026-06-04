import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import taskService from '../services/taskService';
import TaskForm from '../components/TaskForm';

const statusOptions = ['all', 'pending', 'in-progress', 'completed', 'overdue'];
const priorityOptions = ['all', 'urgent', 'high', 'medium', 'low'];

const MyTasksPage = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    taskId: '',
    title: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const location = useLocation();

  const loadTasks = async () => {
    setError('');
    try {
      const result = await taskService.getTasks();
      setTasks(result.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tasks.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setShowTaskForm(true);
    }
  }, [location.search]);

  const handleCreateTask = async (payload) => {
    setError('');
    setInfo('');
    setSaving(true);
    try {
      await taskService.createTask(payload);
      setInfo('Task added successfully.');
      setShowTaskForm(false);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create task.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated]);

  const getEffectiveStatus = (task) => {
    if (task.status === 'completed') return 'completed';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'overdue';
    return task.status || 'pending';
  };

  const tasksWithStatus = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        effectiveStatus: getEffectiveStatus(task),
      })),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    return tasksWithStatus
      .filter((task) => {
        if (statusFilter !== 'all' && task.effectiveStatus !== statusFilter)
          return false;
        if (priorityFilter !== 'all' && task.priority !== priorityFilter)
          return false;
        if (search.trim()) {
          const query = search.toLowerCase();
          return (
            task.title.toLowerCase().includes(query) ||
            task.course.toLowerCase().includes(query) ||
            (task.description || '').toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
  }, [tasksWithStatus, statusFilter, priorityFilter, search]);

  const summary = useMemo(() => {
    const counts = {
      total: tasksWithStatus.length,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      overdue: 0,
    };
    tasksWithStatus.forEach((task) => {
      counts[task.effectiveStatus] = (counts[task.effectiveStatus] || 0) + 1;
    });
    return counts;
  }, [tasksWithStatus]);

  const openDeleteModal = (task) => {
    setDeleteModal({ visible: true, taskId: task._id, title: task.title });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ visible: false, taskId: '', title: '' });
  };

  const handleDelete = async () => {
    const taskId = deleteModal.taskId;
    if (!taskId) return;
    setSaving(true);
    setInfo('');
    try {
      await taskService.deleteTask(taskId);
      setInfo('Task removed successfully.');
      closeDeleteModal();
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (taskId) => {
    setSaving(true);
    setError('');
    try {
      await taskService.updateTask(taskId, { status: 'completed' });
      setInfo('Task marked as complete.');
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 pt-20 sm:pt-24 md:pt-28 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-8 py-12">
        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {info}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="rounded-2xl border-l-4 border-sky-500 bg-[var(--surface-soft)]/80 dark:bg-[var(--surface-soft)]/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 flex-1 animate-welcome dark:border-sky-400">
            <p className="text-base sm:text-lg text-[var(--text)] font-bold">
              Organize your study workload with ease
            </p>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 sm:mt-2">
              Filter, search, and review tasks with clear status summaries to
              stay on top of your academic goals.
            </p>
          </div>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="rounded-2xl bg-sky-500 px-6 py-3 text-base font-semibold text-white hover:bg-sky-400 transition dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            {showTaskForm ? 'Hide form' : 'New Task'}
          </button>
        </div>

        {showTaskForm && (
          <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create a task
                </p>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Quick add new task
                </h2>
              </div>
              <button
                onClick={() => setShowTaskForm(false)}
                className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Hide form
              </button>
            </div>
            <TaskForm onSubmit={handleCreateTask} />
            {saving && (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Saving new task...
              </p>
            )}
          </section>
        )}

        <div className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-3xl bg-sky-50 p-6 shadow-sm border border-sky-100 hover:shadow-lg hover:scale-105 transition duration-200 dark:bg-sky-900/20 dark:border-sky-700/50">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 font-bold dark:text-sky-400">
              Total tasks
            </p>
            <p className="mt-4 text-3xl font-bold text-slate-800 animate-pulse dark:text-sky-300">
              {summary.total}
            </p>
            <div className="mt-4 h-2 rounded-full bg-sky-100 dark:bg-sky-900/40">
              <div
                className="h-full rounded-full bg-sky-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="rounded-3xl bg-amber-50 p-6 shadow-sm border border-amber-100 hover:shadow-lg hover:scale-105 transition duration-200 dark:bg-amber-900/20 dark:border-amber-700/50">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-700 font-bold dark:text-amber-400">
              Pending
            </p>
            <p className="mt-4 text-3xl font-bold text-amber-800 animate-pulse dark:text-amber-300">
              {summary.pending}
            </p>
            <div className="mt-4 h-2 rounded-full bg-amber-100 dark:bg-amber-900/40">
              <div
                className="h-full rounded-full bg-amber-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="rounded-3xl bg-cyan-50 p-6 shadow-sm border border-cyan-100 hover:shadow-lg hover:scale-105 transition duration-200 dark:bg-cyan-900/20 dark:border-cyan-700/50">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-700 font-bold dark:text-cyan-400">
              In progress
            </p>
            <p className="mt-4 text-3xl font-bold text-cyan-900 animate-bounce dark:text-cyan-300">
              {summary['in-progress']}
            </p>
            <div className="mt-4 h-2 rounded-full bg-cyan-100 dark:bg-cyan-900/40">
              <div
                className="h-full rounded-full bg-cyan-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-6 shadow-sm border border-emerald-100 hover:shadow-lg hover:scale-105 transition duration-200 dark:bg-emerald-900/20 dark:border-emerald-700/50">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 font-bold dark:text-emerald-400">
              Completed
            </p>
            <p className="mt-4 text-3xl font-bold text-emerald-800 animate-pulse dark:text-emerald-300">
              {summary.completed}
            </p>
            <div className="mt-4 h-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <div
                className="h-full rounded-full bg-emerald-500 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
                <label className="text-sm text-slate-500 dark:text-slate-400">
                  Search
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
                <label className="text-sm text-slate-500 dark:text-slate-400">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
                <label className="text-sm text-slate-500 dark:text-slate-400">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === 'all' ? 'All priorities' : priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-6 text-center text-slate-500 dark:text-slate-400"
                    >
                      No tasks match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task._id} className="dark:hover:bg-slate-700/50">
                      <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-100">
                        {task.title}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                        {task.course || 'General'}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : 'None'}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                        {task.priority}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                        {task.effectiveStatus}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/tasks/${task._id}`)}
                            className="rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/tasks/${task._id}/edit`)}
                            className="rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleComplete(task._id)}
                            disabled={
                              saving || task.effectiveStatus === 'completed'
                            }
                            className="rounded-2xl border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                          >
                            {task.effectiveStatus === 'completed'
                              ? 'Done'
                              : 'Complete'}
                          </button>
                          <button
                            onClick={() => openDeleteModal(task)}
                            disabled={saving}
                            className="rounded-2xl border border-rose-500 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl shadow-slate-900/30 border border-slate-200 transition duration-300 ease-out transform scale-100">
            <h3 className="text-2xl font-semibold text-slate-800">
              Confirm deletion
            </h3>
            <p className="mt-4 text-slate-600">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-800">
                {deleteModal.title}
              </span>{' '}
              from your task list? This action cannot be undone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeDeleteModal}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="rounded-2xl bg-rose-600 px-5 py-3 text-white hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Deleting...' : 'Delete task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
