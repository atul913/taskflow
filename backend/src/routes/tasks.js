const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Stats must be registered before /:id to avoid "stats" being treated as an ID
router.get('/stats', taskController.getStats);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
