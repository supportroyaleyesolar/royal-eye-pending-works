# Royal Eye Solar Power – Work Progress & Status

Solar installation project tracker (React + Vite).

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Open in Antigravity
File → Open Folder → select `royal-eye-work-progress`, then run the commands above in its terminal.

## Structure
- `src/data/works.js` – seed projects (15 works, 15–19 Oct 2026)
- `src/hooks/useWorks.js` – state + localStorage persistence (add / update / remove)
- `src/components/` – Sidebar, Header, StatCards, FilterTabs, DayColumn, WorkCard, AddWorkModal
- `src/styles.css` – all styling

## Features
Live status counts, filter tabs, search (title / customer / location / team), Add Work form,
per-card menu (advance +10%, mark completed, delete). Data persists in the browser.
