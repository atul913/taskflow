import React from 'react';

export function StatsCard({ stats }) {
  if (!stats) return null;

  const importanceLevels = [
    { level: 1, label: 'Low', color: '#6b7280' },
    { level: 2, label: 'Normal', color: '#3b82f6' },
    { level: 3, label: 'Medium', color: '#f59e0b' },
    { level: 4, label: 'High', color: '#f97316' },
    { level: 5, label: 'Critical', color: '#ef4444' },
  ];

  const maxCount = Math.max(...Object.values(stats.tasksByImportance), 1);

  return (
    <div className="stats-card">
      <h2 className="stats-title">
        <span className="stats-icon">📊</span>
        Dashboard Overview
      </h2>
      <div className="stats-grid">
        <div className="stat-item stat-total">
          <span className="stat-value">{stats.totalTasks}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item stat-pending">
          <span className="stat-value">{stats.pendingTasks}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item stat-completed">
          <span className="stat-value">{stats.completedTasks}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item stat-overdue">
          <span className="stat-value">{stats.overdueTasks}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-item stat-avg">
          <span className="stat-value">{stats.averageImportance.toFixed(2)}</span>
          <span className="stat-label">Avg Importance</span>
        </div>
      </div>

      <div className="importance-breakdown">
        <h3 className="breakdown-title">Tasks by Importance</h3>
        <div className="breakdown-bars">
          {importanceLevels.map(({ level, label, color }) => {
            const count = stats.tasksByImportance[level] || 0;
            const pct = (count / maxCount) * 100;
            return (
              <div key={level} className="breakdown-row">
                <span className="breakdown-label">{label}</span>
                <div className="breakdown-bar-track">
                  <div
                    className="breakdown-bar-fill"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <span className="breakdown-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
