import { useState, useCallback } from 'react';
import { useWidgetApi } from './hooks/useWidgetApi';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';
import { getTheme } from './theme';
import type { Task } from './types';

export function App() {
  // Detect dark mode from Element's theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = getTheme(prefersDark);

  const [widgetState, actions] = useWidgetApi();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSelect = useCallback(async (taskId: string) => {
    const task = await actions.getTaskDetail(taskId);
    if (task) setSelectedTask(task);
  }, [actions]);

  const handleApprove = useCallback(async (taskId: string) => {
    await actions.approveTask(taskId);
    actions.refreshTasks();
    if (selectedTask?.id === taskId) {
      const updated = await actions.getTaskDetail(taskId);
      if (updated) setSelectedTask(updated);
    }
  }, [actions, selectedTask]);

  const handleStart = useCallback(async (taskId: string, mode: 'review' | 'auto') => {
    await actions.startTask(taskId, mode);
  }, [actions]);

  return (
    <div style={{
      height: '100%', overflowY: 'auto', boxSizing: 'border-box',
      padding: 16, fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
      background: theme.bg, color: theme.text, fontSize: 13,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, paddingBottom: 12,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: theme.accent }}>Task Queue</span>
        <span style={{ color: theme.muted, fontSize: 11 }}>
          {widgetState.tasks.length} tasks
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: widgetState.connected ? theme.ok : theme.muted,
          }} />
          <span style={{ color: theme.muted, fontSize: 11 }}>
            {widgetState.connected ? 'connected' : 'connecting...'}
          </span>
        </span>
        <button
          onClick={() => actions.refreshTasks()}
          style={{
            background: 'transparent', color: theme.muted,
            border: `1px solid ${theme.border}`, borderRadius: 3,
            padding: '2px 8px', fontSize: 14, cursor: 'pointer',
          }}
        >
          &#8635;
        </button>
      </div>

      {/* Loading */}
      {widgetState.loading && (
        <div style={{ color: theme.muted, textAlign: 'center', padding: 32, fontSize: 13 }}>
          Loading...
        </div>
      )}

      {/* Error */}
      {widgetState.error && (
        <div style={{
          color: theme.error, padding: '8px 12px', marginBottom: 12, fontSize: 12,
          background: theme.surface, border: `1px solid ${theme.error}`, borderRadius: 4,
        }}>
          {widgetState.error}
        </div>
      )}

      {/* Content */}
      {!widgetState.loading && !selectedTask && (
        <TaskList
          tasks={widgetState.tasks}
          theme={theme}
          onSelect={handleSelect}
          onApprove={handleApprove}
          onStart={handleStart}
        />
      )}

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          theme={theme}
          onBack={() => setSelectedTask(null)}
          onApprove={handleApprove}
          onStart={handleStart}
        />
      )}
    </div>
  );
}
