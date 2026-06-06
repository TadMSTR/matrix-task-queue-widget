export interface TaskHistoryEntry {
  timestamp: string;
  status: string;
  actor: string;
  note: string;
}

export interface Task {
  id: string;
  created: string;
  source_agent: string;
  target_agent: string;
  task_type: string;
  risk_level: string;
  requires_approval: boolean;
  status: string;
  summary: string;
  ttl_days: number;
  payload: {
    description: string;
    context_refs?: string[];
    priority?: string;
  };
  result: {
    output: string | null;
    completed_by: string | null;
    completed_at: string | null;
  };
  history: TaskHistoryEntry[];
}
