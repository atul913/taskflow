import React, { useState } from 'react';
import { formatRelativeDate, formatDate } from '../utils/dateUtils';

const IMPORTANCE_LABELS = { 1: 'Low', 2: 'Normal', 3: 'Medium', 4: 'High', 5: 'Critical' };
const IMPORTANCE_COLORS = { 1: '#6b7280', 2: '#3b82f6', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444' };

function Stars({ count }) {
  return (
    <span className="stars" aria-label={`Importance: ${count} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  );
}

export function TaskCard({ task, onMarkComplete, onDelete }) {
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isHighPriority = task.priorityScore >= 50;
  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && new Date(task.dueDate) < new Date();
  const relativeDate = formatRelativeDate(task.dueDate);
  const formattedDate = formatDate(task.dueDate);

  async function handleMarkComplete() {
    setCompleting(true);
    setActionError(null);
    try {
      await onMarkComplete(task._id);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCompleting(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setActionError(null);
    try {
      await onDelete(task._id);
    } catch (err) {
      setActionError(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      className={`task-card ${isCompleted ? 'task-completed' : ''} ${
        isHighPriority && !isCompleted ? 'task-high-priority' : ''
      } ${isOverdue ? 'task-overdue' : ''}`}
    >
      {isHighPriority && !isCompleted && (
        <span className="high-priority-badge">🔥 High Priority</span>
      )}

      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-score">
          <span className="score-value">{task.priorityScore.toFixed(2)}</span>
          <span className="score-label">score</span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="meta-item">
          <Stars count={task.importance} />
          <span
            className="importance-badge"
            style={{ color: IMPORTANCE_COLORS[task.importance] }}
          >
            {IMPORTANCE_LABELS[task.importance]}
          </span>
        </div>

        <div className="meta-item">
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            📅 <abbr title={formattedDate}>{relativeDate}</abbr>
          </span>
        </div>

        <div className="meta-item">
          <span className={`status-badge status-${task.status}`}>
            {task.status === 'completed' ? '✓ Completed' : '◷ Pending'}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-error task-error">⚠ {actionError}</div>
      )}

      {!isCompleted && (
        <div className="task-actions">
          <button
            className="btn btn-success"
            onClick={handleMarkComplete}
            disabled={completing || deleting}
          >
            {completing ? 'Saving…' : '✓ Mark Complete'}
          </button>
          {confirmDelete ? (
            <div className="confirm-delete">
              <span>Are you sure?</span>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-delete"
              onClick={handleDelete}
              disabled={completing || deleting}
            >
              🗑 Delete
            </button>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="task-actions">
          {confirmDelete ? (
            <div className="confirm-delete">
              <span>Are you sure?</span>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
