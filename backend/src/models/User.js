const mongoose = require('mongoose');

const productivityProfileSchema = new mongoose.Schema({
  morningPeakHours: { type: [Number], default: [] },
  afternoonPeakHours: { type: [Number], default: [] },
  eveningPeakHours: { type: [Number], default: [] },
  averageCompletionRate: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  matricule: { type: String, required: true, trim: true },
  department: { type: String, default: 'Computer Engineering', trim: true },
  level: { type: Number, default: 400 },
  program: { type: String, default: '', trim: true },
  year: { type: String, default: '', trim: true },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    timezone: { type: String, default: 'Africa/Douala' },
    notificationsEnabled: { type: Boolean, default: true },
    emailReminders: { type: Boolean, default: true }
  },
  productivityProfile: { type: productivityProfileSchema, default: () => ({}) }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
