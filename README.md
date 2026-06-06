# matrix-task-queue-widget

Matrix Element widget for task queue management on forge. A React + TypeScript dashboard that renders inside Element as an embedded widget, communicating with the Matrix room via custom events routed through `matrix-task-queue-bot`.

## Overview

The widget uses the Matrix Widget API (`matrix-widget-api`) to send and receive custom `com.helmforge.task.*` room events. All data flows through the Matrix room — the widget never makes direct HTTP calls to forge infrastructure. The bot (`matrix-task-queue-bot`) handles the events and responds with task data.

Built with React 19, TypeScript, and Vite. Served as a static site from a Docker nginx container on port 8497, accessible via SWAG at `widgets.helmforge.me`.

## Features

- Task list view with filter controls (agent, status)
- Task detail view with history timeline
- Session launch: review mode (agent summarizes, waits) or auto mode (agent executes)
- Task approval
- Live connection indicator (Matrix Widget API connection state)
- Manual refresh

## Architecture

```
Element (browser)
  └── Widget iframe (widgets.helmforge.me/task-queue/)
        └── matrix-widget-api
              └── Matrix room events (com.helmforge.task.*)
                    └── matrix-task-queue-bot
                          └── ~/.claude/task-queue/*.yml
```

## Widget API event types

| Event type (outgoing) | Purpose |
|----------------------|---------|
| `com.helmforge.task.list` | Request task list (with optional filters) |
| `com.helmforge.task.detail` | Request single task by ID |
| `com.helmforge.task.start` | Launch agent session; payload: `{task_id, mode}` |
| `com.helmforge.task.approve` | Approve task; payload: `{task_id}` |

| Event type (incoming) | Purpose |
|----------------------|---------|
| `com.helmforge.task.data` | Task list response |
| `com.helmforge.task.response` | Response to detail/start/approve actions |

Each request includes a `request_id` field; responses echo it for correlation.

Mutating actions (`start`, `approve`) require the sender to be in `AUTHORIZED_MXIDS` on the bot side. The widget sends these under the room member's identity — authorization is enforced by the bot, not the widget.

## Environment variables

No runtime environment variables. Configuration is baked at build time via Vite.

The Vite build assumes the nginx base path is `/task-queue/` (see `nginx.conf`).

## Installation

Requires Node.js 22+.

```bash
cd ~/repos/personal/matrix-task-queue-widget
npm install
npm run build      # outputs to dist/
```

## Deployment (Docker)

```bash
docker build -t matrix-task-queue-widget .
docker run -d -p 8497:8080 --name task-queue-widget matrix-task-queue-widget
```

The Docker image is a two-stage build:
1. `node:22-alpine` — builds the React app
2. `nginx:alpine` — serves `dist/` from `/usr/share/nginx/html/task-queue`

nginx listens on port 8080 (mapped to 8497 on the host). nginx runs unprivileged (UID 101).

SWAG proxies `widgets.helmforge.me` → `http://localhost:8497`. The widget is registered in Element at `https://widgets.helmforge.me/task-queue/`.

## Adding the widget to Element

In the Matrix room (`#task-queue:helmforge.me`), run the slash command:

```
/addwidget https://widgets.helmforge.me/task-queue/
```

Or use Element's room settings → Widgets → Add Widget with the URL above.

## Development

```bash
npm run dev        # Vite dev server (hot reload)
npm run build      # Production build
npm run preview    # Preview production build locally
```

## Forge deployment

- Docker stack: `~/docker/task-queue-widget/`
- Port: `127.0.0.1:8497`
- Public URL: `widgets.helmforge.me`
- Matrix room: `#task-queue:helmforge.me`
- Repo: `~/repos/personal/matrix-task-queue-widget/`
