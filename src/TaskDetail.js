import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { statusColor, priorityColor, ago } from './theme';
export function TaskDetail({ task, theme: c, onBack, onApprove, onStart }) {
    const sc = statusColor(task.status, c);
    const priority = task.payload.priority ?? 'normal';
    const pc = priorityColor(priority, c);
    return (_jsxs("div", { children: [_jsx("button", { onClick: onBack, style: {
                    background: 'transparent', color: c.muted, border: 'none',
                    cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                    padding: '4px 0', marginBottom: 12,
                }, children: "\u2190 Back" }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }, children: [_jsx("span", { style: { color: c.muted, fontSize: 12 }, children: task.id }), _jsx("span", { style: {
                                    display: 'inline-block', width: 8, height: 8,
                                    borderRadius: '50%', background: sc,
                                } }), _jsx("span", { style: { color: sc, fontSize: 13, fontWeight: 600 }, children: task.status })] }), _jsx("div", { style: { fontSize: 15, fontWeight: 600, marginBottom: 8 }, children: task.summary })] }), _jsxs("div", { style: {
                    display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 12px',
                    fontSize: 12, marginBottom: 16, padding: 12,
                    background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4,
                }, children: [_jsx("span", { style: { color: c.muted }, children: "Source" }), _jsx("span", { children: task.source_agent }), _jsx("span", { style: { color: c.muted }, children: "Target" }), _jsx("span", { children: task.target_agent }), _jsx("span", { style: { color: c.muted }, children: "Type" }), _jsx("span", { children: task.task_type }), _jsx("span", { style: { color: c.muted }, children: "Priority" }), _jsx("span", { style: { color: pc }, children: priority }), _jsx("span", { style: { color: c.muted }, children: "Risk" }), _jsx("span", { children: task.risk_level }), _jsx("span", { style: { color: c.muted }, children: "Created" }), _jsx("span", { children: ago(task.created) }), _jsx("span", { style: { color: c.muted }, children: "TTL" }), _jsxs("span", { children: [task.ttl_days, "d"] })] }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 16 }, children: [task.status === 'approved' && (_jsxs(_Fragment, { children: [_jsx(ActionBtn, { label: "Start (Review)", color: c.accent, dim: c.dim, onClick: () => onStart(task.id, 'review') }), _jsx(ActionBtn, { label: "Start (Auto)", color: c.warn, dim: c.dim, onClick: () => onStart(task.id, 'auto') })] })), (task.status === 'pending-approval' || task.status === 'submitted') && (_jsx(ActionBtn, { label: "Approve", color: c.ok, dim: c.dim, onClick: () => onApprove(task.id) }))] }), task.payload.description && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx(SectionHeader, { color: c.accent, children: "Description" }), _jsx("pre", { style: {
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, lineHeight: 1.5,
                            padding: 12, background: c.surface, border: `1px solid ${c.border}`,
                            borderRadius: 4, margin: 0, fontFamily: 'inherit',
                        }, children: task.payload.description })] })), task.history.length > 0 && (_jsxs("div", { children: [_jsx(SectionHeader, { color: c.accent, children: "History" }), task.history.map((entry, i) => (_jsxs("div", { style: {
                            display: 'flex', gap: 10, alignItems: 'flex-start', padding: '4px 0',
                            fontSize: 12, borderLeft: `2px solid ${c.border}`, paddingLeft: 12, marginLeft: 4,
                        }, children: [_jsx("span", { style: { color: c.muted, minWidth: 55, fontSize: 11 }, children: ago(entry.timestamp) }), _jsx("span", { style: { color: statusColor(entry.status, c), minWidth: 90 }, children: entry.status }), _jsx("span", { style: { color: c.muted, minWidth: 70 }, children: entry.actor }), _jsx("span", { style: { flex: 1 }, children: entry.note })] }, i)))] })), task.result.output && (_jsxs("div", { style: { marginTop: 16 }, children: [_jsx(SectionHeader, { color: c.accent, children: "Result" }), _jsx("pre", { style: {
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, lineHeight: 1.5,
                            padding: 12, background: c.surface, border: `1px solid ${c.border}`,
                            borderRadius: 4, margin: 0, fontFamily: 'inherit',
                        }, children: task.result.output })] }))] }));
}
function SectionHeader({ color, children }) {
    return (_jsx("div", { style: {
            color, fontSize: 12, fontWeight: 600, marginBottom: 6,
            textTransform: 'uppercase', letterSpacing: '0.5px',
        }, children: children }));
}
function ActionBtn({ label, color, dim, onClick }) {
    const [hover, setHover] = useState(false);
    return (_jsx("button", { onClick: onClick, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: {
            background: hover ? dim : 'transparent', color, border: `1px solid ${color}`,
            borderRadius: 4, padding: '6px 16px', fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'background 0.15s',
        }, children: label }));
}
