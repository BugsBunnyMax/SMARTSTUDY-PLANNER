const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }
}, { _id: false });

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  course: { type: String, trim: true, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  difficulty: { type: Number, min: 1, max: 10, default: 5 },
  estimatedDuration: { type: Number, min: 0, default: 60 },
  actualDuration: { type: Number, min: 0, default: 0 },
  dueDate: { type: Date, required: true },
  completedDate: { type: Date },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
  tags: { type: [String], default: [] },
  subtasks: { type: [subtaskSchema], default: [] },
  notes: { type: [noteSchema], default: [] },
  aiBuffer: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
