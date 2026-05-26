import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', minImportance: '' });

  const fetchTasks = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(currentFilters);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {
      // Stats are bonus — don't surface this error prominently
    }
  }, []);

  useEffect(() => {
    fetchTasks(filters);
    fetchStats();
  }, [filters, fetchTasks, fetchStats]);

  const createTask = async (taskData) => {
    const newTask = await api.createTask(taskData);
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      return updated.sort((a, b) => b.priorityScore - a.priorityScore);
    });
    fetchStats();
    return newTask;
  };

  const markComplete = async (id) => {
    const updated = await api.updateTask(id, { status: 'completed' });
    setTasks((prev) =>
      prev
        .map((t) => (t._id === id ? updated : t))
        .sort((a, b) => b.priorityScore - a.priorityScore)
    );
    fetchStats();
    return updated;
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    fetchStats();
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    tasks,
    stats,
    loading,
    error,
    filters,
    createTask,
    markComplete,
    deleteTask,
    updateFilters,
    refetch: () => fetchTasks(filters),
  };
}
