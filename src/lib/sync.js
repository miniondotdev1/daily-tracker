// Pure helpers for moving the tracker's data between localStorage and the
// cloud. No React, no Supabase imports here — just data.

// The localStorage keys that make up a user's account data. `dt.theme` is
// intentionally NOT synced — theme is a per-device preference.
export const SYNC_KEYS = [
  'dt.days',
  'dt.milestones',
  'dt.settings',
  'dt.badges',
  'dt.reflections',
  'dt.schedule',
]

function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

// Read the current local data as one object.
export function readLocalBlob() {
  return {
    days: safeGet('dt.days', {}),
    milestones: safeGet('dt.milestones', []),
    settings: safeGet('dt.settings', {}),
    badges: safeGet('dt.badges', {}),
    reflections: safeGet('dt.reflections', {}),
    // undefined (not null) when unset, so a fresh device adopts the cloud copy.
    schedule: safeGet('dt.schedule', undefined),
  }
}

// Write a blob back to localStorage and notify the app (the useLocalStorage
// hook listens for this event, so the UI updates instantly).
export function writeLocalBlob(blob) {
  const set = (key, value) => {
    if (value === undefined) return
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }))
  }
  set('dt.days', blob.days)
  set('dt.milestones', blob.milestones)
  set('dt.settings', blob.settings)
  set('dt.badges', blob.badges)
  set('dt.reflections', blob.reflections)
  set('dt.schedule', blob.schedule)
}

// Stable-ish serialization for cheap change detection.
export function blobHash(blob) {
  try {
    return JSON.stringify(blob)
  } catch {
    return ''
  }
}

// ---- Merge logic ----------------------------------------------------------
// When a user logs in on a device that already has local data, we must NOT
// clobber either side. We merge conservatively, preferring the "richer" copy
// on any conflict so nothing meaningful is lost.

function submissionsLen(val) {
  if (Array.isArray(val)) return val.length
  return val && val.submittedAt ? 1 : 0
}

// A heuristic "how much is filled in" score for one day, used to break ties.
function activityScore(rec = {}) {
  let s = 0
  s += Object.keys(rec.blocks || {}).length * 2
  s += submissionsLen(rec.submissions?.company) * 3
  s += submissionsLen(rec.submissions?.project) * 3
  s += rec.reading?.submittedAt ? 3 : 0
  s += (rec.focus?.company || 0) + (rec.focus?.project || 0)
  s += rec.skill?.trim() ? 2 : 0
  s += rec.notes?.trim() ? 1 : 0
  s += (rec.priorities || []).filter((p) => p && p.trim()).length
  s += (rec.plan || []).length
  s += Object.keys(rec.excused || {}).length
  s += Object.keys(rec.skipped || {}).length
  s += Object.keys(rec.punishmentsDone || {}).length
  return s
}

function mergeDays(a = {}, b = {}) {
  const out = { ...a }
  for (const [key, rec] of Object.entries(b)) {
    if (!out[key]) out[key] = rec
    else out[key] = activityScore(rec) > activityScore(out[key]) ? rec : out[key]
  }
  return out
}

function mergeMilestones(a = [], b = []) {
  const map = new Map()
  for (const m of [...(a || []), ...(b || [])]) {
    if (!m || !m.id) continue
    const existing = map.get(m.id)
    // Prefer a completed copy, else the one with more progress.
    if (!existing || (m.completed && !existing.completed) || (m.current || 0) > (existing.current || 0)) {
      map.set(m.id, m)
    }
  }
  return [...map.values()]
}

function mergeBadges(a = {}, b = {}) {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) {
    // Keep the earliest unlock date.
    if (!out[k] || String(v) < String(out[k])) out[k] = v
  }
  return out
}

function mergeReflections(a = {}, b = {}) {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) {
    if (!out[k] || (v && v.length > (out[k] || '').length)) out[k] = v
  }
  return out
}

// Merge two full blobs. `local` wins for plain settings (device-active), but
// day/milestone/badge/reflection data is unioned so no history is lost.
export function mergeBlobs(local = {}, cloud = {}) {
  return {
    days: mergeDays(local.days, cloud.days),
    milestones: mergeMilestones(local.milestones, cloud.milestones),
    badges: mergeBadges(local.badges, cloud.badges),
    reflections: mergeReflections(local.reflections, cloud.reflections),
    settings: { ...(cloud.settings || {}), ...(local.settings || {}) },
    // Schedule is a single shared object, not per-item mergeable — the cloud
    // (shared) copy wins when present so edits propagate between devices.
    schedule:
      (Array.isArray(cloud.schedule) && cloud.schedule.length && cloud.schedule) ||
      local.schedule,
  }
}
