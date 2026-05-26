const BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Central fetch wrapper that handles JSON parsing and error extraction.
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.minImportance) query.set('minImportance', params.minImportance);
    const qs = query.toString();
    return apiFetch(`/bfhl/tasks${qs ? `?${qs}` : ''}`);
  },

  createTask: (data) =>
    apiFetch('/bfhl/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id, data) =>
    apiFetch(`/bfhl/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTask: (id) =>
    apiFetch(`/bfhl/tasks/${id}`, { method: 'DELETE' }),

  getStats: () => apiFetch('/bfhl/tasks/stats'),
};
