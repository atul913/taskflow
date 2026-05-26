/**
 * Returns a human-readable relative date string.
 * e.g. "in 3 days", "tomorrow", "overdue by 2 days"
 */
export function formatRelativeDate(dateStr) {
  const now = new Date();
  const due = new Date(dateStr);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.floor((due - now) / msPerDay);

  if (diffDays < 0) {
    const over = Math.abs(diffDays);
    return `overdue by ${over} day${over !== 1 ? 's' : ''}`;
  }
  if (diffDays === 0) return 'due today';
  if (diffDays === 1) return 'tomorrow';
  return `in ${diffDays} days`;
}

/**
 * Formats a date for display: "May 25, 2026"
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns today's date + 1 day as a string for the date input min attribute.
 */
export function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}
