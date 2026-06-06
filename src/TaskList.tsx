import { useState } from 'react';
import type { Task } from './types';
import type { ThemeColors } from './theme';
import { statusColor, priorityColor, ago } from './theme';

interface TaskListProps {
  tasks: Task[];
  theme: ThemeColors;
  onSelect: (taskId: string) => void;
  onApprove: (taskId: string) => void;
  onStart: (taskId: string, mode: 'review' | 'auto') => void;
}

const STATUS_ORDER: Record<string, number> = {
  'in-progress': 0, approved: 1, 'pending-approval': 2,
  submitted: 3, completed: 4, failed: 5,
};

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0, high: 1, normal: 2,
};

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.payload.priority ?? 'normal'] ?? 2;
    const pb = PRIORITY_ORDER[b.payload.priority ?? 'normal'] ?? 2;
    if (pa !== pb) return pa - pb;
    const sa = STATUS_ORDER[a.status] ?? 9;
    const sb = STATUS_ORDER[b.status] ?? 9;
    if (sa !== sb) return sa - sb;
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });
}

export function TaskList({ tasks, theme: c, onSelect, onApprove, onStart }: TaskListProps) {
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const agents = [...new Set(tasks.map(t => t.target_agent))].sort();
  const statuses = [...new Set(tasks.map(t => t.status))].sort();

  let filtered = tasks;
  if (filterAgent) filtered = filtered.filter(t => t.target_agent === filterAgent);
  if (filterStatus) filtered = filtered.filter(t => t.status === filterStatus);

  const sorted = sortTasks(filtered);

  const selectStyle: React.CSSProperties = {
    background: c.surface, color: c.text, border: `1px solid ${c.border}`,
    borderRadius: 4, padding: '4px 8px', fontSize: 12, fontFamily: 'inherit',
  };

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ color: c.muted, fontSize: 12 }}>
          Agent{' '}
          <select style={selectStyle} value={filterAgent} onChange={e => setFilterAgent(e.target.value)}>
            <option value="">all</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label style={{ color: c.muted, fontSize: 12 }}>
          Status{' '}
          <select style={selectStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">all</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <span style={{ color: c.muted, fontSize: 11, marginLeft: 'auto' }}>
          {filtered.length} of {tasks.length} tasks
        </span>
      </div>

      {/* Task rows */}
      {sorted.length === 0 && (
        <div style={{ color: c.muted, textAlign: 'center', padding: 32, fontSize: 13 }}>
          No tasks match filters.
        </div>
      )}
      {sorted.map(task => {
        const sc = statusColor(task.status, c);
        const priority = task.payload.priority ?? 'normal';
        const pc = priorityColor(priority, c);
        const pIcon = priority === 'urgent' ? '!!!' : priority === 'high' ? '!!' : '';

        return (
          <div
            key={task.id}
            onClick={() => onSelect(task.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', marginBottom: 2,
              background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4,
              cursor: 'pointer', fontSize: 12, transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = c.accent)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
          >
            <span style={{ color: c.muted, minWidth: 64, fontSize: 11 }} title={task.id}>
              {task.id.slice(0, 8)}
            </span>
            {pIcon && <span style={{ color: pc, fontSize: 11, fontWeight: 700, minWidth: 24 }}>{pIcon}</span>}
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: sc, flexShrink: 0,
            }} title={task.status} />
            <span style={{ color: sc, minWidth: 90, fontSize: 11 }}>{task.status}</span>
            <span style={{ color: c.muted, minWidth: 60, fontSize: 11 }}>{task.target_agent}</span>
            <span style={{
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }} title={task.summary}>{task.summary}</span>
            <span style={{ color: c.muted, fontSize: 11, minWidth: 55, textAlign: 'right' }}>
              {ago(task.created)}
            </span>
            <span style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {task.status === 'approved' && (
                <>
                  <ActionButton label="Review" color={c.accent} dim={c.dim} onClick={() => onStart(task.id, 'review')} />
                  <ActionButton label="Auto" color={c.warn} dim={c.dim} onClick={() => onStart(task.id, 'auto')} />
                </>
              )}
              {(task.status === 'pending-approval' || task.status === 'submitted') && (
                <ActionButton label="Approve" color={c.ok} dim={c.dim} onClick={() => onApprove(task.id)} />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ActionButton({ label, color, dim, onClick }: { label: string; color: string; dim: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? dim : 'transparent', color, border: `1px solid ${color}`,
        borderRadius: 3, padding: '2px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}
