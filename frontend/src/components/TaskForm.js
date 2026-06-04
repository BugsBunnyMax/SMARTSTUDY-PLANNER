import React, { useState } from 'react';

const TaskForm = ({ onSubmit, initialValues = {} }) => {
  const [form, setForm] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    course: initialValues.course || '',
    priority: initialValues.priority || 'medium',
    difficulty: initialValues.difficulty || 5,
    estimatedDuration: initialValues.estimatedDuration || 60,
    dueDate: initialValues.dueDate || '',
    tags: initialValues.tags ? initialValues.tags.join(', ') : '',
    notes: initialValues.notes
      ? initialValues.notes.map((note) => note.text).join('\n')
      : '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      difficulty: Number(form.difficulty),
      estimatedDuration: Number(form.estimatedDuration),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: form.notes
        .split('\n')
        .map((note) => note.trim())
        .filter(Boolean)
        .map((text) => ({ text })),
    };
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-slate-300 bg-white p-6 shadow-lg"
    >
      <div>
        <label className="mb-2 block text-sm text-slate-700">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
          placeholder="e.g. Mathematics assignment"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
          placeholder="Task details and study notes"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-700">Course</span>
          <input
            name="course"
            value={form.course}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
            placeholder="e.g. MTH201"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-700">Priority</span>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-700">Difficulty</span>
          <input
            name="difficulty"
            type="number"
            min="1"
            max="10"
            value={form.difficulty}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-700">
            Estimated duration (minutes)
          </span>
          <input
            name="estimatedDuration"
            type="number"
            min="10"
            value={form.estimatedDuration}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-700">Due date</span>
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-700">Tags</span>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
            placeholder="math, homework"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-700">Notes</span>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500"
          placeholder="Add quick notes or study reminders, one per line"
        />
        <p className="mt-2 text-xs text-slate-500">
          One note per line. Notes are saved with the task.
        </p>
      </label>

      <button
        type="submit"
        className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
      >
        Save Task
      </button>
    </form>
  );
};

export default TaskForm;
