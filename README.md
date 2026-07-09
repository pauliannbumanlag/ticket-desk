# Ticket Desk — Task Tracker

A lightweight ticket/task tracker built with vanilla JavaScript, HTML, and CSS — no framework, no backend. Designed to mirror how a freelance developer would triage real client bug-fix and maintenance requests.

**[Live demo →](#)** *https://pauliannbumanlag.github.io/ticket-desk/*

![Ticket Desk screenshot](#) *<img width="1920" height="945" alt="image" src="https://github.com/user-attachments/assets/97a0c5fa-f548-40ee-973d-441c29f53921" />
*

## Why this project

Freelance and part-time frontend work often involves *fixing and maintaining* existing systems rather than building from scratch. This project is meant to demonstrate exactly that skill set: clean vanilla JS logic, state management without a framework, persistent data, and a UI that holds up on mobile — the kind of thing a client evaluating a bug-fix hire would actually want to see.

## Features

- **Create, edit, delete tickets** — title, description, priority, status, and optional due date
- **Search** by title, live as you type
- **Filter** by status (open / in progress / closed) and priority (low → urgent)
- **Sort** by newest, oldest, priority, or due date
- **Persistent storage** via `localStorage` — data survives a page refresh
- **Live stats bar** — open / in-progress / closed counts update in real time
- **Empty state** — clear messaging when filters return nothing
- **Fully responsive** — usable down to small mobile widths
- **Accessible** — visible keyboard focus states, semantic form labels, `Escape` closes the form
- **XSS-safe rendering** — user input is escaped before being inserted into the DOM

## Tech stack

- HTML5
- CSS3 (custom properties, CSS Grid, no framework)
- Vanilla JavaScript (ES6+, no build step, no dependencies)
- Browser `localStorage` for persistence

No Node, no npm install, no bundler — open `index.html` and it runs.

## Project structure

```
ticket-tracker/
├── index.html    # Markup and structure
├── styles.css    # Design system + component styles
├── script.js     # State, CRUD logic, rendering, persistence
└── README.md
```

## Running locally

Just open `index.html` in a browser. For a local server (recommended so relative paths and fonts behave consistently):

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploying for free

This is a static site — any of these work with zero config:

- **GitHub Pages** — push to a repo, enable Pages on the `main` branch
- **Netlify** — drag-and-drop the folder into Netlify's deploy UI
- **Vercel** — `vercel deploy` from inside the folder

## Design notes

The UI treats each task as a physical ticket stub: a perforated edge separates a stamped ticket ID and priority badge from the ticket's details, echoing a claim-check or work-order slip. The intent is to make ticket priority scannable at a glance without relying on color alone (the stamp uses distinct labels: `urgent`, `high`, `medium`, `low`).

## Possible next steps

- Drag-and-drop reordering or a kanban-style board view
- Export tickets to CSV
- Multi-user support with a small backend (Node/Express + SQLite)
- Tagging / categories in addition to priority and status

---

Built as a portfolio piece to demonstrate JavaScript fundamentals, DOM manipulation, and UI craft without relying on a framework.
