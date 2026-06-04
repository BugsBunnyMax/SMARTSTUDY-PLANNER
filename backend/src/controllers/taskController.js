const Task = require('../models/Task');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, course, priority, difficulty, estimatedDuration, dueDate, tags, subtasks, notes } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title and due date are required' });
    }

    const task = await Task.create({
      userId: req.user._id,
      title,
      description: description || '',
      course: course || '',
      priority: priority || 'medium',
      difficulty: difficulty || 5,
      estimatedDuration: estimatedDuration || 60,
      dueDate,
      tags: tags || [],
      subtasks: subtasks || [],
      notes: Array.isArray(notes) ? notes : []
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.course) query.course = req.query.course;

    if (req.query.startDate || req.query.endDate) {
      query.dueDate = {};
      if (req.query.startDate) query.dueDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.dueDate.$lte = new Date(req.query.endDate);
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, priority: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(204).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
