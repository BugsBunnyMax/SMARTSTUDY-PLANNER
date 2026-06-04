const express = require('express');
const Recommendation = require('../models/Recommendation');
const Task = require('../models/Task');
const User = require('../models/User');
const authenticate = require('../middleware/authMiddleware');
const { getIo } = require('../socket');

const router = express.Router();
router.use(authenticate);

const formatPeakSummary = (productivityProfile) => {
  const segments = [];
  if (productivityProfile.morningPeakHours?.length) {
    segments.push(`morning (${productivityProfile.morningPeakHours.join(', ')}h)`);
  }
  if (productivityProfile.afternoonPeakHours?.length) {
    segments.push(`afternoon (${productivityProfile.afternoonPeakHours.join(', ')}h)`);
  }
  if (productivityProfile.eveningPeakHours?.length) {
    segments.push(`evening (${productivityProfile.eveningPeakHours.join(', ')}h)`);
  }
  return segments.length ? segments.join(' and ') : 'your most productive hours';
};

const getPeakBucket = (productivityProfile) => {
  const buckets = [
    { name: 'morning', hours: productivityProfile.morningPeakHours },
    { name: 'afternoon', hours: productivityProfile.afternoonPeakHours },
    { name: 'evening', hours: productivityProfile.eveningPeakHours },
  ];

  const best = buckets
    .filter((bucket) => bucket.hours?.length)
    .sort((a, b) => b.hours.length - a.hours.length)[0];

  return best?.name || null;
};

const buildRecommendations = async (userId) => {
  const recommendations = [];
  const now = new Date();
  const soonEnd = new Date(now);
  soonEnd.setDate(now.getDate() + 3);

  const allTasks = await Task.find({ userId });
  const user = await User.findById(userId).lean();
  const profile = user?.productivityProfile || {};
  const activeTasks = allTasks.filter((task) => task.status !== 'completed');
  const completedCount = allTasks.filter((task) => task.status === 'completed').length;
  const completionRate = allTasks.length ? completedCount / allTasks.length : 1;

  if (allTasks.length && profile.averageCompletionRate !== undefined && profile.averageCompletionRate < 0.7) {
    const peakSummary = formatPeakSummary(profile);
    recommendations.push({
      recommendationType: 'priority-adjustment',
      reason: `📈 Your estimated completion rate is ${Math.round(profile.averageCompletionRate * 100)}%. Plan work during ${peakSummary} to improve consistency.`,
      suggestedTime: new Date(),
    });
  }

  const durationRatios = allTasks
    .filter((task) => task.estimatedDuration > 0 && task.actualDuration > 0)
    .map((task) => task.actualDuration / task.estimatedDuration);
  const averageDurationRatio = durationRatios.length
    ? durationRatios.reduce((sum, value) => sum + value, 0) / durationRatios.length
    : 1;

  // Overdue tasks: suggest immediate action
  const overdueTasks = activeTasks
    .filter((task) => task.dueDate < now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);
  overdueTasks.forEach((task) => {
    recommendations.push({
      taskId: task._id,
      recommendationType: 'reschedule',
      reason: `⏰ This task is overdue by ${Math.ceil((now - task.dueDate) / (1000 * 60 * 60 * 24))} days. Start it immediately to catch up.`,
      suggestedTime: new Date(),
    });
  });

  // Due in 3 days: prioritize medium/low priority
  const dueSoon = activeTasks
    .filter((task) => task.dueDate >= now && task.dueDate <= soonEnd)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);
  dueSoon.forEach((task) => {
    if (task.priority === 'low' || task.priority === 'medium') {
      recommendations.push({
        taskId: task._id,
        recommendationType: 'priority-adjustment',
        reason: `📌 "${task.title}" is due in ${Math.ceil((task.dueDate - now) / (1000 * 60 * 60 * 24))} days. Raise priority to complete on time.`,
        suggestedTime: task.dueDate,
      });
    }
  });

  const peakBucket = getPeakBucket(profile);
  if (peakBucket && dueSoon.length) {
    dueSoon.slice(0, 2).forEach((task) => {
      recommendations.push({
        taskId: task._id,
        recommendationType: 'buffer-add',
        reason: `⏰ "${task.title}" is due soon. Your strongest productivity window is ${peakBucket}; block that time for this task.`,
        suggestedTime: task.dueDate,
      });
    });
  }

  // Long duration tasks: plan buffer time
  const longTasks = activeTasks
    .filter((task) => task.estimatedDuration > 90)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);
  longTasks.forEach((task) => {
    recommendations.push({
      taskId: task._id,
      recommendationType: 'buffer-add',
      reason: `🕐 "${task.title}" needs ${task.estimatedDuration} min. Add 20-30% time buffer to avoid rush.`,
      suggestedTime: task.dueDate,
    });
  });

  // Low completion rate: boost productivity
  if (completionRate < 0.5) {
    const strugglingTasks = activeTasks
      .filter((task) => task.priority !== 'urgent')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 2);
    strugglingTasks.forEach((task) => {
      recommendations.push({
        taskId: task._id,
        recommendationType: 'priority-adjustment',
        reason: `📊 Your completion rate is ${Math.round(completionRate * 100)}%. Focus on quick wins - mark a few easy tasks complete.`,
        suggestedTime: task.dueDate,
      });
    });
  }

  // Slow pace: add buffer time
  if (averageDurationRatio > 1.3 && durationRatios.length > 2) {
    const slowTasks = activeTasks
      .filter((task) => task.estimatedDuration >= 30)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 2);
    slowTasks.forEach((task) => {
      recommendations.push({
        taskId: task._id,
        recommendationType: 'buffer-add',
        reason: `⚡ Your work pace is ${Math.round(averageDurationRatio * 100 - 100)}% slower than estimates. Reserve extra study time.`,
        suggestedTime: task.dueDate,
      });
    });
  }

  // Fallback: suggest review of upcoming tasks
  if (recommendations.length === 0) {
    const fallbackTasks = activeTasks
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 2);
    fallbackTasks.forEach((task) => {
      recommendations.push({
        taskId: task._id,
        recommendationType: 'buffer-add',
        reason: `✨ Keep an eye on this task. Schedule regular study blocks to stay ahead.`,
        suggestedTime: task.dueDate,
      });
    });
  }

  // Delete old rejected recommendations to avoid clutter
  await Recommendation.deleteMany({
    userId,
    accepted: false,
    createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // older than 7 days
  });

  // Upsert: avoid duplicates
  const saved = [];
  for (const candidate of recommendations) {
    const existing = await Recommendation.findOne({
      userId,
      taskId: candidate.taskId,
      recommendationType: candidate.recommendationType,
      accepted: false,
    });
    if (existing) {
      // Update the reason if it changed
      existing.reason = candidate.reason;
      existing.suggestedTime = candidate.suggestedTime;
      await existing.save();
      saved.push(existing);
      continue;
    }
    const created = await Recommendation.create({
      userId,
      taskId: candidate.taskId,
      recommendationType: candidate.recommendationType,
      reason: candidate.reason,
      suggestedTime: candidate.suggestedTime,
    });
    saved.push(created);
  }

  return saved;
};

router.get('/', async (req, res, next) => {
  try {
    // Always rebuild recommendations to ensure they're fresh
    await buildRecommendations(req.user._id);
    
    let recommendations = await Recommendation.find({ userId: req.user._id, accepted: false })
      .populate('taskId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
});

router.post('/:recId/accept', async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOne({ _id: req.params.recId, userId: req.user._id });
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    const task = await Task.findOne({ _id: recommendation.taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Related task not found' });
    }

    if (recommendation.recommendationType === 'reschedule') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const taskDueDate = new Date(task.dueDate);
      const taskDue = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());
      const daysOverdue = Math.ceil((today - taskDue) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue >= 4) {
        // Set to tomorrow if 4+ days overdue
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        task.dueDate = tomorrow;
      } else {
        // Add 1 day for 1-3 days overdue
        task.dueDate = new Date(task.dueDate.getTime() + 24 * 60 * 60 * 1000);
      }
      task.status = 'pending';
    }
    if (recommendation.recommendationType === 'priority-adjustment') {
      task.priority = 'high';
    }
    if (recommendation.recommendationType === 'buffer-add') {
      task.aiBuffer = Math.min(100, (task.aiBuffer || 0) + 15);
    }

    recommendation.accepted = true;
    await Promise.all([task.save(), recommendation.save()]);

    const io = getIo();
    io.to(req.user._id.toString()).emit('recommendations:updated');
    io.to(req.user._id.toString()).emit('task:updated', { task });

    res.json({ success: true, message: 'Recommendation accepted', task });
  } catch (error) {
    next(error);
  }
});

router.post('/:recId/reject', async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findOne({ _id: req.params.recId, userId: req.user._id });
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    await recommendation.deleteOne();
    const io = getIo();
    io.to(req.user._id.toString()).emit('recommendations:updated');

    res.json({ success: true, message: 'Recommendation rejected' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
