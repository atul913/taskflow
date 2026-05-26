import React from 'react';
import { TaskCard } from './TaskCard';

export function TaskList({ tasks, loading, error, onMarkComplete, onDelete }) {
  if (loading) {
    return (
      <div className="state-container">
        <div className="loading-spinner" aria-label="Loading tasks">
          <div className="spinner" />
          <p>Loading tasks…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="error-state">
          <span className="error-icon">⚠</span>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="state-container">
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or create a new task.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      <p className="task-count">
        {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
      </p>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onMarkComplete={onMarkComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
