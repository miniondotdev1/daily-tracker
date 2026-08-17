// The fixed daily schedule. This is the single source of truth for the day's
// blocks — edit this array to change the schedule and the whole app follows.
//
// `type` drives the visual style and which blocks count toward special goals:
//   project  -> the most important block (3+ hrs of personal project work)
//   company  -> deep-focus company work
//   gym      -> exercise
//   meal     -> food / rest
//   skill    -> reading / learning
//   routine  -> morning / wind-down routines
//   sleep    -> sleep
//
// `projectMinutes` on the project block is used by the contribution graph and
// goal meters to know how many project minutes a completed block represents.

export const BLOCK_TYPES = {
  company: {
    label: 'Company',
    emoji: '💼',
    accent: 'sky',
  },
  project: {
    label: 'Project',
    emoji: '🚀',
    accent: 'project',
  },
  gym: {
    label: 'Gym',
    emoji: '🏋️',
    accent: 'emerald',
  },
  meal: {
    label: 'Meal / Rest',
    emoji: '🍽️',
    accent: 'amber',
  },
  skill: {
    label: 'Reading',
    emoji: '📚',
    accent: 'rose',
  },
  routine: {
    label: 'Routine',
    emoji: '🧘',
    accent: 'violet',
  },
  sleep: {
    label: 'Sleep',
    emoji: '😴',
    accent: 'slate',
  },
}

// The built-in default. The user's edited schedule is stored in localStorage
// (`dt.schedule`) and provided through AppContext; `SCHEDULE` below is a live
// binding that AppProvider keeps pointed at whichever is active, so every
// component and helper that imports `SCHEDULE` reflects edits automatically.
export const DEFAULT_SCHEDULE = [
  { id: 'wake', start: '07:00', end: '07:30', title: 'Wake up + Morning routine', type: 'routine' },
  { id: 'breakfast', start: '07:30', end: '08:00', title: 'Breakfast + Plan the day', type: 'meal' },
  { id: 'company1', start: '08:00', end: '12:00', title: 'Company Work (Deep Focus)', type: 'company' },
  { id: 'lunch', start: '12:00', end: '13:00', title: 'Lunch + Rest', type: 'meal' },
  { id: 'company2', start: '13:00', end: '15:30', title: 'Company Work (2nd block)', type: 'company' },
  { id: 'transition', start: '15:30', end: '16:00', title: 'Transition / Snack', type: 'meal' },
  { id: 'gym', start: '16:00', end: '18:00', title: 'Gym', type: 'gym' },
  { id: 'dinner', start: '18:00', end: '19:00', title: 'Dinner + Shower + Rest', type: 'meal' },
  {
    id: 'project',
    start: '19:00',
    end: '22:15',
    title: 'Personal Project (3+ hours)',
    type: 'project',
    projectMinutes: 195,
    hero: true, // the single most important block of the day
  },
  { id: 'reading', start: '22:15', end: '23:15', title: 'Reading (1 hour book)', type: 'skill' },
  { id: 'winddown', start: '23:15', end: '00:00', title: 'Wind-down routine', type: 'routine' },
  { id: 'sleep', start: '00:00', end: '00:30', title: 'Sleep', type: 'sleep' },
]

// Live "active" schedule. Reassigned by setActiveSchedule() from AppProvider.
// Thanks to ES-module live bindings, every `import { SCHEDULE }` sees updates.
export let SCHEDULE = DEFAULT_SCHEDULE

export function setActiveSchedule(next) {
  SCHEDULE = Array.isArray(next) && next.length ? next : DEFAULT_SCHEDULE
}

// Create a blank new block with a stable unique id.
export function makeBlock(seed = 0) {
  return {
    id: `blk_${seed}_${Math.random().toString(36).slice(2, 7)}`,
    start: '12:00',
    end: '13:00',
    title: 'New task',
    type: 'routine',
  }
}

// Goal: how many focused project minutes per day count as a "full" project day.
export const PROJECT_MINUTES_GOAL = 180

// Tailwind class maps per accent so we can style blocks/badges dynamically.
// (Tailwind needs the full class strings present in source to include them.)
export const ACCENT_CLASSES = {
  project: {
    ring: 'ring-project-500',
    text: 'text-project-600 dark:text-project-300',
    bgSoft: 'bg-project-50 dark:bg-project-500/10',
    border: 'border-project-300 dark:border-project-500/40',
    dot: 'bg-project-500',
    solid: 'bg-project-600',
  },
  sky: {
    ring: 'ring-sky-500',
    text: 'text-sky-600 dark:text-sky-300',
    bgSoft: 'bg-sky-50 dark:bg-sky-500/10',
    border: 'border-sky-200 dark:border-sky-500/30',
    dot: 'bg-sky-500',
    solid: 'bg-sky-600',
  },
  emerald: {
    ring: 'ring-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
    bgSoft: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
    solid: 'bg-emerald-600',
  },
  amber: {
    ring: 'ring-amber-500',
    text: 'text-amber-600 dark:text-amber-300',
    bgSoft: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
    solid: 'bg-amber-600',
  },
  rose: {
    ring: 'ring-rose-500',
    text: 'text-rose-600 dark:text-rose-300',
    bgSoft: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/30',
    dot: 'bg-rose-500',
    solid: 'bg-rose-600',
  },
  violet: {
    ring: 'ring-violet-500',
    text: 'text-violet-600 dark:text-violet-300',
    bgSoft: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200 dark:border-violet-500/30',
    dot: 'bg-violet-500',
    solid: 'bg-violet-600',
  },
  slate: {
    ring: 'ring-slate-400',
    text: 'text-slate-500 dark:text-slate-400',
    bgSoft: 'bg-slate-100 dark:bg-slate-800/60',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
    solid: 'bg-slate-500',
  },
}
