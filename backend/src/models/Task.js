const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description must be at most 500 characters'],
      trim: true,
      default: '',
    },
    importance: {
      type: Number,
      required: [true, 'Importance is required'],
      min: [1, 'Importance must be between 1 and 5'],
      max: [5, 'Importance must be between 1 and 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Importance must be an integer',
      },
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Status must be either "pending" or "completed"',
      },
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Compute priority score at read time.
 * priorityScore = (importance * 10) + (100 / max(daysUntilDue, 1))
 * Completed tasks always get 0.
 */
taskSchema.virtual('priorityScore').get(function () {
  if (this.status === 'completed') return 0;

  const now = new Date();
  const due = new Date(this.dueDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = Math.floor((due - now) / msPerDay);
  const effectiveDays = Math.max(daysUntilDue, 1);

  const score = this.importance * 10 + 100 / effectiveDays;
  return Math.round(score * 100) / 100;
});

// Remove __v from responses
taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret.id; // remove duplicate id (keep _id)
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
