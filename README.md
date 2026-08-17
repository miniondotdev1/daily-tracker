# 🎯 Daily Life & Productivity Tracker

A premium, offline-first React app to help you stay ruthlessly consistent with a
fixed daily schedule, complete **3+ hours of personal project work every day**,
build new skills, track deep focus with Pomodoro, and stay motivated long-term
through streaks, milestones, and visual progress.

All data lives in your browser via **localStorage** — no backend, no accounts,
nothing leaves your device.

![Tech](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## ✨ Features

| # | Feature | Where |
|---|---------|-------|
| 1 | **Daily Block Tracker** — the fixed schedule with per-type styling; the Project block visually stands out | Today |
| 2 | **Circular Progress** — large animated ring, motivational toasts on completion, "Up next" highlight | Today |
| 3 | **Contribution Graph** — 16-week rolling heatmap, intensity by blocks + 3h project days, current & longest streak | Momentum |
| 4 | **Pomodoro + Focus Tracker** — 50/10 or 25/5, choose Company vs Project, auto-logs focused minutes, daily/weekly totals, project goal meter | Today |
| 5 | **Skills, Focus & Notes** — log a new skill, 1–5 focus score, reflection notes, skill streak | Today |
| 6 | **Top Dashboard** — completion %, project hours, skill, focus score, streak | Today |
| 7 | **Daily Top 3 Priorities** | Today |
| 8 | **Project Milestone Tracker** — progress %, complete/delete | Momentum |
| 9 | **Streak Freeze** — 1 free freeze per week protects a missed day | Today |
| 10 | **Focus Mode** — distraction-free full-screen timer (Space = pause, Esc = exit) | Today |
| 11 | **Achievement Badges** — 8 unlockable badges in a grid | Momentum |
| 12 | **Habit Strength Meter** — per-habit consistency over the last 21 days | Momentum |
| 13 | **Energy Log** — 1-tap Low/Medium/High for morning & post-gym | Today |
| 14 | **Weekly & Monthly Reports** — focused hours, avg focus, skills, streak, completion rate, best day + reflection | Reports |
| 15 | **Motivational Messages** — special celebration for the Project block & streak milestones | everywhere |
| 16 | **Data Export / Import** — full JSON backup & restore | Header → Data |
| 17 | **Extras** — dark mode (system + manual), smooth animations, satisfying micro-interactions, clear-all, clean empty states, mobile-optimized with a bottom tab bar |
| 18 | **Color-shifting progress ring** — the daily ring warms red → orange → yellow → green as you fill the day | Today |
| 19 | **5-min block reminders** — a live "Up next" countdown banner + optional browser notifications 5 minutes before each block | everywhere |
| 20 | **Work Submissions** — log Company and Project work **as many times a day as you want**; each entry is recorded in sequence, locked (immutable), and copyable. The draft resets after every submission so you can log the next one | Work |
| 21 | **Reading Log** — pages read, topic, and a short "what I understood" summary; submit to lock + get **rewarded**; all-time pages & reading streak | Work |
| 22 | **Daily Report** — see which of the 3 submissions are in, then **copy the whole day** as one report | Work |
| 23 | **Rewards** — earn points for real progress and cash them in for treats you pick (☕ → ✈️) | Momentum |
| 24 | **Plan Tomorrow (Elon-style)** — ruthless, time-boxed next-day task planning; appears as your "Battle Plan" the next day | Work / Today |
| 25 | **Records viewer** — right-hand panel with 3 tabs (Company / Project / Reading), a "latest update" highlight on top, each entry dated & timed | Work |
| 26 | **Daily Tracking history** — every finished day is archived and expandable: blocks %, all submitted work, reading, skill, notes & priorities, with a per-day copy | Work |
| 27 | **Live "running now" banner** — shows the current block with a second-by-second background progress fill (right→left) that shifts color green→red as time runs out, plus the **next task** in the right corner | everywhere |
| 28 | **Accountability & penalties** — highlights finished vs **missed** blocks (missed = time passed, not done); each missed block earns a workout penalty (10 push-ups, 50 jumping jacks…) you can mark done | Today |
| 29 | **Away mode** — heading out? Per-block "I was away" excuse, or one tap to **excuse the rest of today** so nothing counts against you | Today |
| 30 | **Submission stats & shipping streak** — submissions/tasks per day & per month, plus a **no-gap daily shipping streak** with 10 / 20 / 25 / 50 / 100-day rewards and badges | Work |
| 31 | **Cloud accounts & cross-device sync** *(optional)* — sign in with email/password, Google, or a magic link and your data follows you to every device. Offline-first, per-user row-level security. See **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | Header |

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## 🧱 Project structure

```
src/
├─ App.jsx                 # layout + tab navigation
├─ main.jsx                # React entry + <AppProvider>
├─ index.css               # Tailwind layers + component classes
├─ constants/
│  ├─ schedule.js          # ← EDIT HERE to change the daily schedule
│  └─ badges.js            # achievement definitions
├─ context/
│  └─ AppContext.jsx       # single source of truth: state, actions, derived stats
├─ hooks/
│  └─ useLocalStorage.js   # persistent, multi-instance-synced state
├─ utils/
│  ├─ dates.js             # date keys, streaks, contribution grid
│  ├─ motivational.js      # quote pools
│  └─ toast.js             # tiny toast event bus
└─ components/             # one file per feature (Dashboard, Pomodoro, …)
```

## ✏️ Changing the schedule

Open [`src/constants/schedule.js`](src/constants/schedule.js) and edit the
`SCHEDULE` array. Each block is:

```js
{ id: 'project', start: '19:00', end: '22:15', title: '…', type: 'project', hero: true }
```

`type` picks the color/emoji (`company`, `project`, `gym`, `meal`, `skill`,
`routine`, `sleep`). Set `hero: true` to make a block visually special (the
Project block). Everything else — dashboard, graph, habit meter — follows
automatically.

## 🌗 Dark mode

Toggle Light / System / Dark from the header. The choice persists and the
correct theme is applied before first paint (no flash).

## ☁️ Deploy to Vercel

1. Push this folder to a Git repo.
2. Import it in Vercel — it auto-detects Vite (build: `npm run build`, output:
   `dist`). `vercel.json` is included for SPA routing.
3. Deploy. Done.

## 🔒 Your data

Everything is stored under `dt.*` keys in `localStorage`. Use **Data → Export
JSON** regularly to back up, and **Import JSON** to restore or move to another
device.
