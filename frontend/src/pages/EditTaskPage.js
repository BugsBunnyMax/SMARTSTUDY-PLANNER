import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import taskService from '../services/taskService';
import TaskForm from '../components/TaskForm';

const EditTaskPage = () => {
  const { taskId } = useParams();
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;
      try {
        const result = await taskService.getTask(taskId);
        const taskData = result.task;
        setTask({
          ...taskData,
          dueDate: taskData.dueDate
            ? new Date(taskData.dueDate).toISOString().split('T')[0]
            : '',
          tags: taskData.tags || [],
          notes: taskData.notes || [],
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load task.');
      }
    };

    if (isAuthenticated && taskId) {
      loadTask();
    }
  }, [isAuthenticated, taskId]);

  const handleSubmit = async (payload) => {
    setError('');
    setSaving(true);

    try {
      await taskService.updateTask(taskId, payload);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Task update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 flex items-center justify-center px-4 py-8 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 px-4 py-8 pt-28 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="mb-8 rounded-2xl border-l-4 border-sky-500 bg-[var(--surface-soft)]/80 dark:bg-[var(--surface-soft)]/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 animate-welcome dark:border-sky-400">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/tasks')}
              aria-label="Back to tasks"
              className="rounded-full p-2 hover:bg-[var(--surface-soft)] dark:hover:bg-[var(--surface-strong)] transition flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[var(--text)]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L4.414 9H18a1 1 0 110 2H4.414l3.293 3.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
                Edit task
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[var(--muted)]">
                Update your study task and keep your schedule accurate.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <TaskForm onSubmit={handleSubmit} initialValues={task} />

        {saving && <p className="mt-4 text-slate-600">Updating task...</p>}
      </div>
    </div>
  );
};

export default EditTaskPage;
