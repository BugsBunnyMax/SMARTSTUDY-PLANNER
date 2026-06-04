import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import taskService from '../services/taskService';

const TaskViewPage = () => {
  const { taskId } = useParams();
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) return;
      try {
        const response = await taskService.getTask(taskId);
        setTask(response.task);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load task.');
      }
    };

    if (isAuthenticated && taskId) {
      loadTask();
    }
  }, [isAuthenticated, taskId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    setError('');

    try {
      const notePayload = {
        notes: [
          ...(task.notes || []),
          { text: newNote.trim(), createdAt: new Date().toISOString() },
        ],
      };
      const response = await taskService.updateTask(taskId, notePayload);
      setTask(response.task);
      setNewNote('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  if (!task && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 flex items-center justify-center px-4 py-8 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 px-4 py-6 pt-20 sm:px-6 sm:py-8 md:pt-28 md:px-8 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-8 rounded-2xl border-l-4 border-sky-500 bg-[var(--surface-soft)]/80 dark:bg-[var(--surface-soft)]/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 animate-welcome dark:border-sky-400">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
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
                  Task details
                </h1>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[var(--muted)]">
                  Review the study task and decide next steps.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/tasks/${taskId}/edit`)}
              className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-[var(--accent-contrast)] hover:brightness-110 hover:scale-105 transition flex-shrink-0"
            >
              Edit Task
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {task ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Title</p>
                <p className="mt-2 text-xl font-semibold text-slate-800">
                  {task.title}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Course</p>
                <p className="mt-2 text-xl font-semibold text-slate-800">
                  {task.course || 'General study'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-2 text-xl font-semibold text-slate-800">
                  {task.status || 'pending'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <p className="mt-2 text-xl font-semibold text-slate-800">
                  {task.priority}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Due date</p>
                <p className="mt-2 text-lg text-slate-800">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Estimated duration</p>
                <p className="mt-2 text-lg text-slate-800">
                  {task.estimatedDuration
                    ? `${task.estimatedDuration} minutes`
                    : 'Unspecified'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-3xl bg-slate-100 p-6 dark:bg-slate-700">
              <div>
                <p className="text-sm text-slate-500">Description</p>
                <p className="mt-2 text-slate-800 whitespace-pre-line">
                  {task.description || 'No description added.'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tags</p>
                <p className="mt-2 text-slate-800">
                  {task.tags?.length ? task.tags.join(', ') : 'No tags'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Notes</p>
                {task.notes?.length ? (
                  <ul className="mt-2 space-y-3">
                    {task.notes.map((note, index) => (
                      <li
                        key={index}
                        className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200"
                      >
                        <p className="text-slate-800">{note.text}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-slate-800">No notes added yet.</p>
                )}
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <p className="text-sm text-slate-500">Add a quick note</p>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="mt-3 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-sky-500"
                  placeholder="Capture a study reminder or insight for this task"
                />
                <button
                  onClick={handleAddNote}
                  disabled={savingNote}
                  className="mt-3 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-60"
                >
                  {savingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TaskViewPage;
