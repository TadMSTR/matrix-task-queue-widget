/**
 * Hook for Matrix Widget API communication.
 * Sends custom events to the room and listens for responses from the bot.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { WidgetApi } from 'matrix-widget-api';
// Custom event types
const EVENT_TASK_LIST = 'com.helmforge.task.list';
const EVENT_TASK_DETAIL = 'com.helmforge.task.detail';
const EVENT_TASK_START = 'com.helmforge.task.start';
const EVENT_TASK_APPROVE = 'com.helmforge.task.approve';
const EVENT_TASK_RESPONSE = 'com.helmforge.task.response';
const EVENT_TASK_DATA = 'com.helmforge.task.data';
let requestCounter = 0;
function nextRequestId() {
    return `tq-${++requestCounter}-${Date.now()}`;
}
export function useWidgetApi() {
    const [state, setState] = useState({
        tasks: [],
        loading: true,
        error: null,
        connected: false,
    });
    const widgetApiRef = useRef(null);
    const pendingRef = useRef(new Map());
    // Initialize Widget API
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const widgetId = params.get('widgetId');
        if (!widgetId) {
            setState(s => ({ ...s, loading: false, error: 'No widgetId in URL — not running inside Element' }));
            return;
        }
        const api = new WidgetApi(widgetId);
        // Request capabilities
        api.requestCapabilityToSendEvent(EVENT_TASK_LIST);
        api.requestCapabilityToSendEvent(EVENT_TASK_DETAIL);
        api.requestCapabilityToSendEvent(EVENT_TASK_START);
        api.requestCapabilityToSendEvent(EVENT_TASK_APPROVE);
        api.requestCapabilityToReceiveEvent(EVENT_TASK_RESPONSE);
        api.requestCapabilityToReceiveEvent(EVENT_TASK_DATA);
        api.on('ready', () => {
            setState(s => ({ ...s, connected: true }));
            // Initial task load
            sendEvent(api, EVENT_TASK_LIST, { filters: {} });
        });
        // Listen for response events
        api.on(`action:${EVENT_TASK_DATA}`, (ev) => {
            const content = ev.detail?.data?.content ?? {};
            const requestId = content.request_id;
            if (content.tasks) {
                setState(s => ({ ...s, tasks: content.tasks, loading: false }));
            }
            if (requestId && pendingRef.current.has(requestId)) {
                const { resolve, timer } = pendingRef.current.get(requestId);
                clearTimeout(timer);
                pendingRef.current.delete(requestId);
                resolve(content);
            }
            // Acknowledge
            api.transport.reply(ev.detail, {});
        });
        api.on(`action:${EVENT_TASK_RESPONSE}`, (ev) => {
            const content = ev.detail?.data?.content ?? {};
            const requestId = content.request_id;
            if (requestId && pendingRef.current.has(requestId)) {
                const { resolve, timer } = pendingRef.current.get(requestId);
                clearTimeout(timer);
                pendingRef.current.delete(requestId);
                resolve(content);
            }
            api.transport.reply(ev.detail, {});
        });
        api.start();
        widgetApiRef.current = api;
        return () => {
            // Cleanup pending requests
            for (const { timer } of pendingRef.current.values()) {
                clearTimeout(timer);
            }
            pendingRef.current.clear();
        };
    }, []);
    function sendEvent(api, eventType, content) {
        const requestId = nextRequestId();
        content.request_id = requestId;
        api.sendRoomEvent(eventType, content).catch(err => {
            console.error('Failed to send widget event:', err);
        });
        return requestId;
    }
    function waitForResponse(requestId, timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                pendingRef.current.delete(requestId);
                reject(new Error('Response timeout'));
            }, timeoutMs);
            pendingRef.current.set(requestId, { resolve, timer });
        });
    }
    const refreshTasks = useCallback((filters) => {
        const api = widgetApiRef.current;
        if (!api)
            return;
        setState(s => ({ ...s, loading: true }));
        sendEvent(api, EVENT_TASK_LIST, { filters: filters ?? {} });
    }, []);
    const getTaskDetail = useCallback(async (taskId) => {
        const api = widgetApiRef.current;
        if (!api)
            return null;
        const requestId = sendEvent(api, EVENT_TASK_DETAIL, { task_id: taskId });
        try {
            const resp = await waitForResponse(requestId);
            return resp.task ?? null;
        }
        catch {
            return null;
        }
    }, []);
    const startTask = useCallback(async (taskId, mode) => {
        const api = widgetApiRef.current;
        if (!api)
            return false;
        const requestId = sendEvent(api, EVENT_TASK_START, { task_id: taskId, mode });
        try {
            const resp = await waitForResponse(requestId);
            return resp.result?.ok === 'true';
        }
        catch {
            return false;
        }
    }, []);
    const approveTask = useCallback(async (taskId) => {
        const api = widgetApiRef.current;
        if (!api)
            return false;
        const requestId = sendEvent(api, EVENT_TASK_APPROVE, { task_id: taskId });
        try {
            const resp = await waitForResponse(requestId);
            return resp.ok ?? false;
        }
        catch {
            return false;
        }
    }, []);
    return [state, { refreshTasks, getTaskDetail, startTask, approveTask }];
}
