const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, matricule, department, level } = req.body;

    if (!email || !password || !firstName || !lastName || !matricule) {
      return res.status(400).json({ success: false, message: 'Missing required registration fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      matricule,
      department: department || 'Computer Engineering',
      level: level || 400
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        matricule: user.matricule,
        department: user.department,
        level: user.level
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        matricule: user.matricule,
        department: user.department,
        level: user.level
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, matricule, program, year, department, notificationsEnabled, emailReminders, theme, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (matricule) user.matricule = matricule;
    if (program !== undefined) user.program = program;
    if (year !== undefined) user.year = year;
    if (department !== undefined) user.department = department;

    if (notificationsEnabled !== undefined) {
      user.preferences.notificationsEnabled = notificationsEnabled;
    }
    if (emailReminders !== undefined) {
      user.preferences.emailReminders = emailReminders;
    }
    if (theme) {
      user.preferences.theme = theme;
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    const responseUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      matricule: user.matricule,
      department: user.department,
      level: user.level,
      program: user.program,
      year: user.year,
      preferences: user.preferences,
      productivityProfile: user.productivityProfile,
    };

    res.json({ success: true, user: responseUser });
  } catch (error) {
    next(error);
  }
};
