import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { statusColor, priorityColor, ago } from './theme';
const STATUS_ORDER = {
    'in-progress': 0, approved: 1, 'pending-approval': 2,
    submitted: 3, completed: 4, failed: 5,
};
const PRIORITY_ORDER = {
    urgent: 0, high: 1, normal: 2,
};
function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.payload.priority ?? 'normal'] ?? 2;
        const pb = PRIORITY_ORDER[b.payload.priority ?? 'normal'] ?? 2;
        if (pa !== pb)
            return pa - pb;
        const sa = STATUS_ORDER[a.status] ?? 9;
        const sb = STATUS_ORDER[b.status] ?? 9;
        if (sa !== sb)
            return sa - sb;
        return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
}
export function TaskList({ tasks, theme: c, onSelect, onApprove, onStart }) {
    const [filterAgent, setFilterAgent] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const agents = [...new Set(tasks.map(t => t.target_agent))].sort();
    const statuses = [...new Set(tasks.map(t => t.status))].sort();
    let filtered = tasks;
    if (filterAgent)
        filtered = filtered.filter(t => t.target_agent === filterAgent);
    if (filterStatus)
        filtered = filtered.filter(t => t.status === filterStatus);
    const sorted = sortTasks(filtered);
    const selectStyle = {
        background: c.surface, color: c.text, border: `1px solid ${c.border}`,
        borderRadius: 4, padding: '4px 8px', fontSize: 12, fontFamily: 'inherit',
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsxs("label", { style: { color: c.muted, fontSize: 12 }, children: ["Agent", ' ', _jsxs("select", { style: selectStyle, value: filterAgent, onChange: e => setFilterAgent(e.target.value), children: [_jsx("option", { value: "", children: "all" }), agents.map(a => _jsx("option", { value: a, children: a }, a))] })] }), _jsxs("label", { style: { color: c.muted, fontSize: 12 }, children: ["Status", ' ', _jsxs("select", { style: selectStyle, value: filterStatus, onChange: e => setFilterStatus(e.target.value), children: [_jsx("option", { value: "", children: "all" }), statuses.map(s => _jsx("option", { value: s, children: s }, s))] })] }), _jsxs("span", { style: { color: c.muted, fontSize: 11, marginLeft: 'auto' }, children: [filtered.length, " of ", tasks.length, " tasks"] })] }), sorted.length === 0 && (_jsx("div", { style: { color: c.muted, textAlign: 'center', padding: 32, fontSize: 13 }, children: "No tasks match filters." })), sorted.map(task => {
                const sc = statusColor(task.status, c);
                const priority = task.payload.priority ?? 'normal';
                const pc = priorityColor(priority, c);
                const pIcon = priority === 'urgent' ? '!!!' : priority === 'high' ? '!!' : '';
                return (_jsxs("div", { onClick: () => onSelect(task.id), style: {
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', marginBottom: 2,
                        background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4,
                        cursor: 'pointer', fontSize: 12, transition: 'border-color 0.15s',
                    }, onMouseEnter: e => (e.currentTarget.style.borderColor = c.accent), onMouseLeave: e => (e.currentTarget.style.borderColor = c.border), children: [_jsx("span", { style: { color: c.muted, minWidth: 64, fontSize: 11 }, title: task.id, children: task.id.slice(0, 8) }), pIcon && _jsx("span", { style: { color: pc, fontSize: 11, fontWeight: 700, minWidth: 24 }, children: pIcon }), _jsx("span", { style: {
                                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                                background: sc, flexShrink: 0,
                            }, title: task.status }), _jsx("span", { style: { color: sc, minWidth: 90, fontSize: 11 }, children: task.status }), _jsx("span", { style: { color: c.muted, minWidth: 60, fontSize: 11 }, children: task.target_agent }), _jsx("span", { style: {
                                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }, title: task.summary, children: task.summary }), _jsx("span", { style: { color: c.muted, fontSize: 11, minWidth: 55, textAlign: 'right' }, children: ago(task.created) }), _jsxs("span", { style: { display: 'flex', gap: 4, flexShrink: 0 }, onClick: e => e.stopPropagation(), children: [task.status === 'approved' && (_jsxs(_Fragment, { children: [_jsx(ActionButton, { label: "Review", color: c.accent, dim: c.dim, onClick: () => onStart(task.id, 'review') }), _jsx(ActionButton, { label: "Auto", color: c.warn, dim: c.dim, onClick: () => onStart(task.id, 'auto') })] })), (task.status === 'pending-approval' || task.status === 'submitted') && (_jsx(ActionButton, { label: "Approve", color: c.ok, dim: c.dim, onClick: () => onApprove(task.id) }))] })] }, task.id));
            })] }));
}
function ActionButton({ label, color, dim, onClick }) {
    const [hover, setHover] = useState(false);
    return (_jsx("button", { onClick: onClick, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: {
            background: hover ? dim : 'transparent', color, border: `1px solid ${color}`,
            borderRadius: 3, padding: '2px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
        }, children: label }));
}
