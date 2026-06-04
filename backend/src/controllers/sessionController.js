const Session = require('../models/Session');
const Task = require('../models/Task');
const User = require('../models/User');
const { getIo } = require('../socket');

const getSessionBucket = (hour) => {
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 16) return 'afternoon';
  if (hour >= 17 && hour <= 21) return 'evening';
  return null;
};

const getTopBucketHours = (hourTotals, startHour, endHour, count = 2) => {
  return Object.entries(hourTotals)
    .filter(([hour]) => {
      const parsed = Number(hour);
      return parsed >= startHour && parsed <= endHour;
    })
    .map(([hour, duration]) => ({ hour: Number(hour), duration }))
    .filter((entry) => entry.duration > 0)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, count)
    .map((entry) => entry.hour);
};

const updateProductivityProfile = async (userId) => {
  const completedSessions = await Session.find({ userId, completed: true });
  const tasks = await Task.find({ userId });

  const hourTotals = Array(24).fill(0);
  completedSessions.forEach((session) => {
    const hour = new Date(session.startTime).getHours();
    hourTotals[hour] += session.duration;
  });

  const morningPeakHours = getTopBucketHours(hourTotals, 5, 11);
  const afternoonPeakHours = getTopBucketHours(hourTotals, 12, 16);
  const eveningPeakHours = getTopBucketHours(hourTotals, 17, 21);

  const completedTaskCount = tasks.filter((task) => task.status === 'completed').length;
  const averageCompletionRate = tasks.length ? completedTaskCount / tasks.length : 0;

  const productivityProfile = {
    morningPeakHours,
    afternoonPeakHours,
    eveningPeakHours,
    averageCompletionRate,
  };

  await User.findByIdAndUpdate(userId, { productivityProfile }, { new: true, runValidators: true });
  return productivityProfile;
};

exports.getSessions = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.taskId) query.taskId = req.query.taskId;
    if (req.query.completed !== undefined) query.completed = req.query.completed === 'true';

    const sessions = await Session.find(query).sort({ startTime: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const { taskId, startTime, endTime, duration, completed, note, notes } = req.body;
    const sessionNote = note || (Array.isArray(notes) ? notes.map((item) => item.text || item).join('; ') : '');

    if (!taskId || !startTime || !endTime || !duration) {
      return res.status(400).json({ success: false, message: 'Task session requires taskId, startTime, endTime, and duration.' });
    }

    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found for this session.' });
    }

    const session = await Session.create({
      userId: req.user._id,
      taskId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      completed: completed !== undefined ? completed : true,
      note: sessionNote,
    });

    if (session.completed) {
      task.actualDuration = (task.actualDuration || 0) + Number(duration);
      if (task.status !== 'completed') {
        task.status = 'in-progress';
      }
      await task.save();
    }

    const productivityProfile = await updateProductivityProfile(req.user._id);
    const io = getIo();
    io.to(req.user._id.toString()).emit('session:created', { session });
    io.to(req.user._id.toString()).emit('productivity:updated', { productivityProfile });

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.sessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const { completed, note } = req.body;
    if (completed !== undefined) {
      session.completed = completed;
    }
    if (note !== undefined) {
      session.note = note;
    }

    await session.save();
    const productivityProfile = await updateProductivityProfile(req.user._id);
    const io = getIo();
    io.to(req.user._id.toString()).emit('session:updated', { session });
    io.to(req.user._id.toString()).emit('productivity:updated', { productivityProfile });

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.sessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};
