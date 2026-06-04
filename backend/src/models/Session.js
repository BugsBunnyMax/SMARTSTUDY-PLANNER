const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true, min: 0 },
  completed: { type: Boolean, default: false },
  note: { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
