const express = require('express');
const {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} = require('../controllers/sessionController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.get('/', getSessions);
router.post('/', createSession);
router.put('/:sessionId', updateSession);
router.delete('/:sessionId', deleteSession);

module.exports = router;
