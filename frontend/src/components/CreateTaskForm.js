import React, { useState } from 'react';
import { getTomorrowDateString } from '../utils/dateUtils';

const INITIAL_FORM = {
  title: '',
  description: '',
  importance: 3,
  dueDate: '',
};

export function CreateTaskForm({ onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const minDate = getTomorrowDateString();

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    else if (form.title.trim().length > 100) errs.title = 'Title must be at most 100 characters';

    if (form.description.length > 500) errs.description = 'Description must be at most 500 characters';

    if (!form.dueDate) errs.dueDate = 'Due date is required';
    else if (new Date(form.dueDate) <= new Date()) errs.dueDate = 'Due date must be in the future';

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        importance: Number(form.importance),
        dueDate: new Date(form.dueDate).toISOString(),
      });
      setForm(INITIAL_FORM);
      setErrors({});
      setIsOpen(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  const importanceLabels = { 1: 'Low', 2: 'Below Normal', 3: 'Normal', 4: 'High', 5: 'Critical' };
  const importanceColors = { 1: '#6b7280', 2: '#3b82f6', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444' };

  return (
    <div className="form-section">
      {!isOpen ? (
        <button className="btn btn-primary btn-add" onClick={() => setIsOpen(true)}>
          <span>+</span> New Task
        </button>
      ) : (
        <div className="form-card">
          <div className="form-header">
            <h2>Create New Task</h2>
            <button className="btn-close" onClick={() => { setIsOpen(false); setErrors({}); setSubmitError(null); }}>✕</button>
          </div>

          {submitError && (
            <div className="alert alert-error">⚠ {submitError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="title">Title <span className="required">*</span></label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="What needs to be done?"
                maxLength={100}
                className={errors.title ? 'input-error' : ''}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
              <span className="char-count">{form.title.length}/100</span>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Optional details..."
                maxLength={500}
                rows={3}
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
              <span className="char-count">{form.description.length}/500</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="importance">
                  Importance: <strong style={{ color: importanceColors[form.importance] }}>{importanceLabels[form.importance]}</strong>
                </label>
                <input
                  id="importance"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={form.importance}
                  onChange={handleChange('importance')}
                  className="range-input"
                />
                <div className="range-labels">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date <span className="required">*</span></label>
                <input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange('dueDate')}
                  min={minDate}
                  className={errors.dueDate ? 'input-error' : ''}
                />
                {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setIsOpen(false); setErrors({}); setSubmitError(null); }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
