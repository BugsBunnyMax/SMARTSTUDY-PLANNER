const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  recommendationType: { type: String, enum: ['reschedule', 'priority-adjustment', 'buffer-add'], required: true },
  reason: { type: String, trim: true, default: '' },
  suggestedTime: { type: Date },
  accepted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
