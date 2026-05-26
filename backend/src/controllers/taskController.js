const mongoose = require('mongoose');
const Task = require('../models/Task');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function buildFilterQuery(query) {
  const filter = {};

  if (query.status) {
    if (!['pending', 'completed'].includes(query.status)) {
      throw { status: 400, message: 'status must be "pending" or "completed"' };
    }
    filter.status = query.status;
  }

  if (query.minImportance !== undefined) {
    const min = Number(query.minImportance);
    if (isNaN(min) || min < 1 || min > 5) {
      throw { status: 400, message: 'minImportance must be a number between 1 and 5' };
    }
    filter.importance = { $gte: min };
  }

  return filter;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /bfhl/tasks
 * Create a new task with full validation.
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, importance, dueDate, status } = req.body;

    // Manual validations beyond Mongoose schema
    if (title === undefined || title === null || title === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (importance === undefined || importance === null) {
      return res.status(400).json({ error: 'Importance is required' });
    }

    if (dueDate === undefined || dueDate === null || dueDate === '') {
      return res.status(400).json({ error: 'Due date is required' });
    }

    // Validate dueDate is a valid date
    const parsedDue = new Date(dueDate);
    if (isNaN(parsedDue.getTime())) {
      return res.status(400).json({ error: 'dueDate must be a valid date' });
    }

    // dueDate must be in the future on creation
    if (parsedDue <= new Date()) {
      return res.status(400).json({ error: 'dueDate must be a future date' });
    }

    const task = new Task({
      title,
      description,
      importance,
      dueDate: parsedDue,
      ...(status && { status }),
    });

    await task.save();
    return res.status(201).json(task.toJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }
    console.error('createTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /bfhl/tasks
 * List all tasks sorted by priorityScore DESC.
 * Supports ?status= and ?minImportance= filters.
 */
exports.getTasks = async (req, res) => {
  try {
    let filter;
    try {
      filter = buildFilterQuery(req.query);
    } catch (filterErr) {
      return res.status(filterErr.status || 400).json({ error: filterErr.message });
    }

    const tasks = await Task.find(filter).lean({ virtuals: true });

    // Sort by priorityScore descending (virtual field, so sort in JS)
    tasks.sort((a, b) => b.priorityScore - a.priorityScore);

    // Clean up toJSON quirks from lean
    const result = tasks.map((t) => {
      const { __v, id, ...clean } = t;
      return clean;
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('getTasks error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /bfhl/tasks/:id
 * Update any subset of editable fields.
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const { title, description, importance, dueDate, status } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (importance !== undefined) updates.importance = importance;
    if (status !== undefined) updates.status = status;

    if (dueDate !== undefined) {
      const parsedDue = new Date(dueDate);
      if (isNaN(parsedDue.getTime())) {
        return res.status(400).json({ error: 'dueDate must be a valid date' });
      }
      updates.dueDate = parsedDue;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(task.toJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }
    console.error('updateTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /bfhl/tasks/:id
 * Delete a task by ID.
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task deleted successfully', _id: id });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /bfhl/tasks/stats
 * Aggregate analytics using MongoDB aggregation pipeline.
 */
exports.getStats = async (req, res) => {
  try {
    const now = new Date();

    const pipeline = [
      {
        $facet: {
          // Overall counts and averages
          overview: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
                },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
                averageImportance: { $avg: '$importance' },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$status', 'pending'] },
                          { $lt: ['$dueDate', now] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          // Group tasks by importance level
          byImportance: [
            {
              $group: {
                _id: '$importance',
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
      {
        $project: {
          overview: { $arrayElemAt: ['$overview', 0] },
          byImportance: 1,
        },
      },
    ];

    const [result] = await Task.aggregate(pipeline);

    const overview = result?.overview || {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      averageImportance: 0,
      overdueTasks: 0,
    };

    // Build tasksByImportance map (1-5)
    const tasksByImportance = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (result?.byImportance || []).forEach(({ _id, count }) => {
      tasksByImportance[_id] = count;
    });

    return res.status(200).json({
      totalTasks: overview.totalTasks || 0,
      pendingTasks: overview.pendingTasks || 0,
      completedTasks: overview.completedTasks || 0,
      averageImportance: overview.averageImportance
        ? Math.round(overview.averageImportance * 100) / 100
        : 0,
      overdueTasks: overview.overdueTasks || 0,
      tasksByImportance,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
