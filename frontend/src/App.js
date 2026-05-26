import React from 'react';
import { useTasks } from './hooks/useTasks';
import { StatsCard } from './components/StatsCard';
import { CreateTaskForm } from './components/CreateTaskForm';
import { Filters } from './components/Filters';
import { TaskList } from './components/TaskList';
import './styles/App.css';

function App() {
  const { tasks, stats, loading, error, filters, createTask, markComplete, deleteTask, updateFilters } =
    useTasks();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <h1>TaskFlow</h1>
          </div>
          <p className="tagline">Smart priority scoring for your tasks</p>
        </div>
      </header>

      <main className="app-main">
        <StatsCard stats={stats} />
        <CreateTaskForm onSubmit={createTask} />
        <Filters filters={filters} onChange={updateFilters} />
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onMarkComplete={markComplete}
          onDelete={deleteTask}
        />
      </main>

      <footer className="app-footer">
        <p>TaskFlow — Priority Score = (importance × 10) + (100 / daysUntilDue)</p>
      </footer>
    </div>
  );
}

export default App;
