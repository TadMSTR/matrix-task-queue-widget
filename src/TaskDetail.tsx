import { useState } from 'react';
import type { Task } from './types';
import type { ThemeColors } from './theme';
import { statusColor, priorityColor, ago } from './theme';

interface TaskDetailProps {
  task: Task;
  theme: ThemeColors;
  onBack: () => void;
  onApprove: (taskId: string) => void;
  onStart: (taskId: string, mode: 'review' | 'auto') => void;
}

export function TaskDetail({ task, theme: c, onBack, onApprove, onStart }: TaskDetailProps) {
  const sc = statusColor(task.status, c);
  const priority = task.payload.priority ?? 'normal';
  const pc = priorityColor(priority, c);

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'transparent', color: c.muted, border: 'none',
          cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
          padding: '4px 0', marginBottom: 12,
        }}
      >
        &larr; Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ color: c.muted, fontSize: 12 }}>{task.id}</span>
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            borderRadius: '50%', background: sc,
          }} />
          <span style={{ color: sc, fontSize: 13, fontWeight: 600 }}>{task.status}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{task.summary}</div>
      </div>

      {/* Metadata */}
      <div style={{
        display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 12px',
        fontSize: 12, marginBottom: 16, padding: 12,
        background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4,
      }}>
        <span style={{ color: c.muted }}>Source</span><span>{task.source_agent}</span>
        <span style={{ color: c.muted }}>Target</span><span>{task.target_agent}</span>
        <span style={{ color: c.muted }}>Type</span><span>{task.task_type}</span>
        <span style={{ color: c.muted }}>Priority</span><span style={{ color: pc }}>{priority}</span>
        <span style={{ color: c.muted }}>Risk</span><span>{task.risk_level}</span>
        <span style={{ color: c.muted }}>Created</span><span>{ago(task.created)}</span>
        <span style={{ color: c.muted }}>TTL</span><span>{task.ttl_days}d</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {task.status === 'approved' && (
          <>
            <ActionBtn label="Start (Review)" color={c.accent} dim={c.dim} onClick={() => onStart(task.id, 'review')} />
            <ActionBtn label="Start (Auto)" color={c.warn} dim={c.dim} onClick={() => onStart(task.id, 'auto')} />
          </>
        )}
        {(task.status === 'pending-approval' || task.status === 'submitted') && (
          <ActionBtn label="Approve" color={c.ok} dim={c.dim} onClick={() => onApprove(task.id)} />
        )}
      </div>

      {/* Description */}
      {task.payload.description && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader color={c.accent}>Description</SectionHeader>
          <pre style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, lineHeight: 1.5,
            padding: 12, background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 4, margin: 0, fontFamily: 'inherit',
          }}>
            {task.payload.description}
          </pre>
        </div>
      )}

      {/* History */}
      {task.history.length > 0 && (
        <div>
          <SectionHeader color={c.accent}>History</SectionHeader>
          {task.history.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start', padding: '4px 0',
              fontSize: 12, borderLeft: `2px solid ${c.border}`, paddingLeft: 12, marginLeft: 4,
            }}>
              <span style={{ color: c.muted, minWidth: 55, fontSize: 11 }}>{ago(entry.timestamp)}</span>
              <span style={{ color: statusColor(entry.status, c), minWidth: 90 }}>{entry.status}</span>
              <span style={{ color: c.muted, minWidth: 70 }}>{entry.actor}</span>
              <span style={{ flex: 1 }}>{entry.note}</span>
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {task.result.output && (
        <div style={{ marginTop: 16 }}>
          <SectionHeader color={c.accent}>Result</SectionHeader>
          <pre style={{
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, lineHeight: 1.5,
            padding: 12, background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 4, margin: 0, fontFamily: 'inherit',
          }}>
            {task.result.output}
          </pre>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      color, fontSize: 12, fontWeight: 600, marginBottom: 6,
      textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      {children}
    </div>
  );
}

function ActionBtn({ label, color, dim, onClick }: { label: string; color: string; dim: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? dim : 'transparent', color, border: `1px solid ${color}`,
        borderRadius: 4, padding: '6px 16px', fontSize: 12, cursor: 'pointer',
        fontFamily: 'inherit', transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  );
}
