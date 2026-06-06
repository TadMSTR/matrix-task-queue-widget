export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  dim: string;
  ok: string;
  warn: string;
  error: string;
}

export function getTheme(dark: boolean): ThemeColors {
  return dark
    ? {
        bg: '#08080f',
        surface: '#0e0e1a',
        border: '#1a1a2c',
        text: '#e2e0f0',
        muted: '#52507a',
        accent: '#fbbf24',
        dim: 'rgba(251,191,36,0.1)',
        ok: '#22c55e',
        warn: '#f59e0b',
        error: '#ef4444',
      }
    : {
        bg: '#fafaf9',
        surface: '#ffffff',
        border: '#e8e6f0',
        text: '#0f0e1a',
        muted: '#9490b0',
        accent: '#d97706',
        dim: 'rgba(217,119,6,0.08)',
        ok: '#16a34a',
        warn: '#d97706',
        error: '#dc2626',
      };
}

export function statusColor(status: string, c: ThemeColors): string {
  const map: Record<string, string> = {
    approved: c.ok,
    'in-progress': c.accent,
    submitted: c.muted,
    'pending-approval': c.warn,
    completed: c.ok,
    failed: c.error,
  };
  return map[status] ?? c.muted;
}

export function priorityColor(priority: string, c: ThemeColors): string {
  const map: Record<string, string> = { urgent: c.error, high: c.warn };
  return map[priority] ?? c.muted;
}

export function ago(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return 'just now';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
