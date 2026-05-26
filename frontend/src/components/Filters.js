import React from 'react';

export function Filters({ filters, onChange }) {
  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <label>Status</label>
        <div className="toggle-group">
          {statusOptions.map(({ value, label }) => (
            <button
              key={value}
              className={`toggle-btn ${filters.status === value ? 'active' : ''}`}
              onClick={() => onChange({ status: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="minImportance">
          Min Importance{' '}
          {filters.minImportance ? (
            <span className="filter-badge">{filters.minImportance}+</span>
          ) : null}
        </label>
        <div className="importance-filter">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              className={`importance-dot ${
                filters.minImportance && Number(filters.minImportance) === level ? 'active' : ''
              } level-${level}`}
              onClick={() =>
                onChange({
                  minImportance: filters.minImportance === String(level) ? '' : String(level),
                })
              }
              title={`Min importance: ${level}`}
            >
              {level}
            </button>
          ))}
          {filters.minImportance && (
            <button
              className="btn-clear-filter"
              onClick={() => onChange({ minImportance: '' })}
              title="Clear importance filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
