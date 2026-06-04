const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:taskId', getTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
