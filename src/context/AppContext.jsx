import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  SCHEDULE,
  DEFAULT_SCHEDULE,
  setActiveSchedule,
  makeBlock,
  PROJECT_MINUTES_GOAL,
} from '../constants/schedule'
import { BADGES } from '../constants/badges'
import { POINTS, REWARD_TIERS } from '../constants/rewards'
import {
  todayKey,
  addDays,
  weekKey,
  toKey,
  WRAP_HOUR,
} from '../utils/dates'

const AppContext = createContext(null)

// A fresh, empty record for a single day.
function emptyDay() {
  return {
    blocks: {}, // { [blockId]: true }
    priorities: ['', '', ''],
    skill: '',
    focusScore: 0, // 1..5, 0 = not set
    notes: '',
    energy: { morning: null, afterGym: null }, // 'low' | 'medium' | 'high'
    focus: { company: 0, project: 0 }, // logged focused minutes
    freeze: false, // whether a streak-freeze was spent on this day
    // Work submissions — an append-only LOG per category. You can submit as many
    // times a day as you like; each entry { id, text, count, submittedAt } is
    // recorded in sequence and is immutable once submitted.
    submissions: { company: [], project: [] },
    // The in-progress draft for each category (not yet submitted). Cleared and
    // reset every time you submit, so you can immediately log the next one.
    workDrafts: { company: { text: '', count: 0 }, project: { text: '', count: 0 } },
    // Reading log: { pages, topic, summary, submittedAt } — immutable once
    // submittedAt is set.
    reading: null,
    // Elon-style time-boxed plan authored the night before:
    // [{ id, text, mins, done }]
    plan: [],
    // Blocks the user marked "away/excused" — they don't count as missed and
    // incur no punishment.
    excused: {}, // { [blockId]: true }
    // Blocks the user deliberately marked "not done" — these DO count as a miss
    // (and earn a penalty), unlike excused.
    skipped: {}, // { [blockId]: true }
    // Missed-block punishments the user has completed.
    punishmentsDone: {}, // { [blockId]: true }
  }
}

// Normalize a category's submissions into an array of entries. Tolerates the
// legacy single-object shape ({ text, count, submittedAt }) so older data and
// exports keep working.
export function submissionEntries(val) {
  if (Array.isArray(val)) return val
  if (val && typeof val === 'object' && val.submittedAt) {
    return [{ id: val.id || 's_legacy', ...val }]
  }
  return []
}

// Deep-ish merge helper for patching a day record.
function mergeDay(base, patch) {
  const next = { ...base, ...patch }
  if (patch.blocks) next.blocks = { ...base.blocks, ...patch.blocks }
  if (patch.energy) next.energy = { ...base.energy, ...patch.energy }
  if (patch.focus) next.focus = { ...base.focus, ...patch.focus }
  if (patch.submissions)
    next.submissions = { ...(base.submissions || {}), ...patch.submissions }
  if (patch.excused) next.excused = { ...(base.excused || {}), ...patch.excused }
  if (patch.skipped) next.skipped = { ...(base.skipped || {}), ...patch.skipped }
  if (patch.punishmentsDone)
    next.punishmentsDone = { ...(base.punishmentsDone || {}), ...patch.punishmentsDone }
  return next
}

// ---- Pure helpers used across the app --------------------------------------
// These read the live `SCHEDULE` binding at call time, so they always reflect
// the user's current (possibly edited) schedule.

export function blocksDone(record) {
  if (!record || !record.blocks) return 0
  return SCHEDULE.reduce((n, b) => n + (record.blocks[b.id] ? 1 : 0), 0)
}

export function completionRatio(record) {
  if (!record) return 0
  // Blocks marked "away" (excused, not completed) don't count against you — drop
  // them from the denominator so the completion % reflects only what you owned.
  const excusedNotDone = SCHEDULE.reduce(
    (n, b) => n + (record.excused?.[b.id] && !record.blocks?.[b.id] ? 1 : 0),
    0
  )
  const denom = Math.max(1, SCHEDULE.length - excusedNotDone)
  return Math.min(1, blocksDone(record) / denom)
}

// Did the day hit 3+ project hours? Either the project block is checked, or the
// user logged enough focused project minutes via the Pomodoro timer.
export function projectHoursMet(record) {
  if (!record) return false
  const logged = record.focus?.project || 0
  return Boolean(record.blocks?.project) || logged >= PROJECT_MINUTES_GOAL
}

// A day "counts" for the streak when the user completed a solid majority of the
// day (>=70%), or when a freeze was spent to protect it.
export function daySucceeded(record) {
  if (!record) return false
  if (record.freeze) return true
  return completionRatio(record) >= 0.7
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('dt.theme', 'system')
  const [days, setDays] = useLocalStorage('dt.days', {})
  const [milestones, setMilestones] = useLocalStorage('dt.milestones', [])
  const [settings, setSettings] = useLocalStorage('dt.settings', {
    pomodoroMode: '50/10', // '50/10' | '25/5'
  })
  // Persisted unlock timestamps so a badge stays unlocked even if stats dip.
  const [badgeUnlocks, setBadgeUnlocks] = useLocalStorage('dt.badges', {})
  // The user's (editable) daily schedule.
  const [schedule, setScheduleState] = useLocalStorage('dt.schedule', DEFAULT_SCHEDULE)

  // Keep the live SCHEDULE binding in sync so every helper/component that reads
  // it reflects edits. Done in render (idempotent) so it's applied before
  // children read the schedule.
  setActiveSchedule(schedule)

  // ---- Schedule editing --------------------------------------------------
  const updateSchedule = useCallback(
    (next) => setScheduleState(Array.isArray(next) && next.length ? next : DEFAULT_SCHEDULE),
    [setScheduleState]
  )
  const resetSchedule = useCallback(
    () => setScheduleState(DEFAULT_SCHEDULE),
    [setScheduleState]
  )
  const addBlock = useCallback(
    (block) =>
      setScheduleState((prev) => [...prev, block || makeBlock(prev.length)]),
    [setScheduleState]
  )
  const updateBlock = useCallback(
    (id, patch) =>
      setScheduleState((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      ),
    [setScheduleState]
  )
  const removeBlock = useCallback(
    (id) => setScheduleState((prev) => prev.filter((b) => b.id !== id)),
    [setScheduleState]
  )
  // Move a block up (-1) or down (+1) in the list.
  const moveBlock = useCallback(
    (id, dir) =>
      setScheduleState((prev) => {
        const i = prev.findIndex((b) => b.id === id)
        const j = i + dir
        if (i < 0 || j < 0 || j >= prev.length) return prev
        const next = [...prev]
        ;[next[i], next[j]] = [next[j], next[i]]
        return next
      }),
    [setScheduleState]
  )
  // Sort blocks by start time (the after-midnight tail sorts last).
  const sortSchedule = useCallback(
    () =>
      setScheduleState((prev) =>
        [...prev].sort((a, b) => {
          const key = (t) => {
            const [h, m] = t.split(':').map(Number)
            return (h < WRAP_HOUR ? h + 24 : h) * 60 + m
          }
          return key(a.start) - key(b.start)
        })
      ),
    [setScheduleState]
  )

  // ---- Theme -------------------------------------------------------------
  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mql.matches)
      root.classList.toggle('dark', dark)
    }
    apply()
    if (theme === 'system') {
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [theme])

  // ---- Day accessors -----------------------------------------------------
  const getDay = useCallback(
    (key = todayKey()) => days[key] || emptyDay(),
    [days]
  )

  const updateDay = useCallback(
    (key, patch) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        return { ...prev, [key]: mergeDay(base, patch) }
      })
    },
    [setDays]
  )

  const setBlock = useCallback(
    (key, blockId, done) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const blocks = { ...base.blocks }
        if (done) blocks[blockId] = true
        else delete blocks[blockId]
        return { ...prev, [key]: { ...base, blocks } }
      })
    },
    [setDays]
  )

  const toggleBlock = useCallback(
    (key, blockId) => {
      const cur = Boolean(getDay(key).blocks[blockId])
      setBlock(key, blockId, !cur)
      return !cur
    },
    [getDay, setBlock]
  )

  const addFocusMinutes = useCallback(
    (category, minutes, key = todayKey()) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const focus = { ...base.focus }
        focus[category] = (focus[category] || 0) + minutes
        return { ...prev, [key]: { ...base, focus } }
      })
    },
    [setDays]
  )

  // ---- Work submissions (append-only log) --------------------------------
  // Edit the current, not-yet-submitted draft for a category.
  const updateWorkDraft = useCallback(
    (category, patch, key = todayKey()) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const drafts = { ...(base.workDrafts || {}) }
        const cur = drafts[category] || { text: '', count: 0 }
        drafts[category] = { ...cur, ...patch }
        return { ...prev, [key]: { ...base, workDrafts: drafts } }
      })
    },
    [setDays]
  )

  // Record a submission: append the draft as a new immutable entry, then reset
  // the draft so the next one can be logged straight away. Many per day allowed.
  const submitWork = useCallback(
    (category, key = todayKey()) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const drafts = { ...(base.workDrafts || {}) }
        const draft = drafts[category] || { text: '', count: 0 }
        if (!draft.text?.trim()) return prev
        const list = submissionEntries(base.submissions?.[category])
        const entry = {
          id: `s_${Date.now()}_${list.length}`,
          text: draft.text.trim(),
          count: draft.count || 0,
          submittedAt: new Date().toISOString(),
        }
        const submissions = {
          ...(base.submissions || {}),
          [category]: [...list, entry],
        }
        drafts[category] = { text: '', count: 0 } // recode/reset after submit
        return {
          ...prev,
          [key]: { ...base, submissions, workDrafts: drafts },
        }
      })
    },
    [setDays]
  )

  // ---- Reading log -------------------------------------------------------
  const updateReadingDraft = useCallback(
    (patch, key = todayKey()) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const cur = base.reading || {
          pages: '',
          topic: '',
          summary: '',
          submittedAt: null,
        }
        if (cur.submittedAt) return prev
        return { ...prev, [key]: { ...base, reading: { ...cur, ...patch } } }
      })
    },
    [setDays]
  )

  const submitReading = useCallback(
    (key = todayKey()) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const cur = base.reading
        if (!cur || cur.submittedAt || !cur.summary?.trim()) return prev
        return {
          ...prev,
          [key]: {
            ...base,
            reading: { ...cur, submittedAt: new Date().toISOString() },
          },
        }
      })
    },
    [setDays]
  )

  // ---- Next-day plan (Elon-style) ---------------------------------------
  const setPlan = useCallback(
    (key, plan) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        return { ...prev, [key]: { ...base, plan } }
      })
    },
    [setDays]
  )

  const togglePlanTask = useCallback(
    (key, id) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const plan = (base.plan || []).map((t) =>
          t.id === id ? { ...t, done: !t.done } : t
        )
        return { ...prev, [key]: { ...base, plan } }
      })
    },
    [setDays]
  )

  // ---- Away / not-done / punishments -------------------------------------
  // "Away" (excused): doesn't count as finished OR missed, no penalty.
  const toggleExcused = useCallback(
    (key, blockId) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const excused = { ...(base.excused || {}) }
        const skipped = { ...(base.skipped || {}) }
        if (excused[blockId]) delete excused[blockId]
        else {
          excused[blockId] = true
          delete skipped[blockId] // away and not-done are mutually exclusive
        }
        return { ...prev, [key]: { ...base, excused, skipped } }
      })
    },
    [setDays]
  )

  // "Not done" (skipped): you deliberately didn't do it — counts as a miss and
  // earns a penalty, unlike "away".
  const toggleSkipped = useCallback(
    (key, blockId) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const skipped = { ...(base.skipped || {}) }
        const excused = { ...(base.excused || {}) }
        if (skipped[blockId]) delete skipped[blockId]
        else {
          skipped[blockId] = true
          delete excused[blockId]
        }
        return { ...prev, [key]: { ...base, skipped, excused } }
      })
    },
    [setDays]
  )

  // Clear away/not-done flags (e.g. when a block is completed after all).
  const clearBlockFlags = useCallback(
    (key, blockId) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const excused = { ...(base.excused || {}) }
        const skipped = { ...(base.skipped || {}) }
        delete excused[blockId]
        delete skipped[blockId]
        return { ...prev, [key]: { ...base, excused, skipped } }
      })
    },
    [setDays]
  )

  // Mark a set of blocks as excused in one shot (e.g. "going out — excuse the
  // rest of today").
  const excuseBlocks = useCallback(
    (key, blockIds) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const excused = { ...(base.excused || {}) }
        blockIds.forEach((id) => {
          excused[id] = true
        })
        return { ...prev, [key]: { ...base, excused } }
      })
    },
    [setDays]
  )

  const markPunishmentDone = useCallback(
    (key, blockId) => {
      setDays((prev) => {
        const base = prev[key] || emptyDay()
        const punishmentsDone = { ...(base.punishmentsDone || {}), [blockId]: true }
        return { ...prev, [key]: { ...base, punishmentsDone } }
      })
    },
    [setDays]
  )

  // ---- Streak freeze -----------------------------------------------------
  // One free freeze per ISO week. Returns true if the freeze was applied.
  const freezesUsedThisWeek = useCallback(
    (key) => {
      const wk = weekKey(key)
      return Object.entries(days).filter(
        ([k, rec]) => rec?.freeze && weekKey(k) === wk
      ).length
    },
    [days]
  )

  const canFreeze = useCallback(
    (key) => !getDay(key).freeze && freezesUsedThisWeek(key) < 1,
    [getDay, freezesUsedThisWeek]
  )

  const toggleFreeze = useCallback(
    (key) => {
      const cur = getDay(key).freeze
      if (!cur && !canFreeze(key)) return false
      updateDay(key, { freeze: !cur })
      return !cur
    },
    [getDay, canFreeze, updateDay]
  )

  // ---- Milestones --------------------------------------------------------
  const addMilestone = useCallback(
    ({ title, target }) => {
      const id = `m_${Object.keys(days).length}_${milestones.length}_${title
        .slice(0, 4)
        .replace(/\s/g, '')}`
      setMilestones((prev) => [
        ...prev,
        {
          id: id + '_' + prev.length,
          title,
          target: Math.max(1, Number(target) || 1),
          current: 0,
          completed: false,
          completedAt: null,
        },
      ])
    },
    [setMilestones, days, milestones.length]
  )

  const updateMilestone = useCallback(
    (id, patch) => {
      setMilestones((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m
          const next = { ...m, ...patch }
          next.current = Math.max(0, Math.min(next.current, next.target))
          if (next.current >= next.target) {
            next.completed = true
            next.completedAt = next.completedAt || todayKey()
          } else {
            next.completed = false
            next.completedAt = null
          }
          return next
        })
      )
    },
    [setMilestones]
  )

  const removeMilestone = useCallback(
    (id) => setMilestones((prev) => prev.filter((m) => m.id !== id)),
    [setMilestones]
  )

  // ---- Derived: streaks --------------------------------------------------
  const streaks = useMemo(() => {
    // Current streak: walk back from today while days succeed.
    let current = 0
    let cursor = todayKey()
    // If today isn't done yet, don't break the streak — start from yesterday.
    if (!daySucceeded(days[cursor])) cursor = addDays(cursor, -1)
    void schedule // recompute when the schedule changes
    while (daySucceeded(days[cursor])) {
      current += 1
      cursor = addDays(cursor, -1)
    }

    // Longest streak (and longest project streak) across all recorded days.
    const keys = Object.keys(days).sort()
    let longest = 0
    let run = 0
    let longestProject = 0
    let projRun = 0
    if (keys.length) {
      let k = keys[0]
      const last = todayKey()
      // Iterate every calendar day from first record to today.
      while (k <= last) {
        if (daySucceeded(days[k])) {
          run += 1
          longest = Math.max(longest, run)
        } else {
          run = 0
        }
        if (projectHoursMet(days[k])) {
          projRun += 1
          longestProject = Math.max(longestProject, projRun)
        } else {
          projRun = 0
        }
        k = addDays(k, 1)
      }
    }

    // Current project streak walking back from today.
    let projectCurrent = 0
    let pc = todayKey()
    if (!projectHoursMet(days[pc])) pc = addDays(pc, -1)
    while (projectHoursMet(days[pc])) {
      projectCurrent += 1
      pc = addDays(pc, -1)
    }

    return {
      current,
      longest: Math.max(longest, current),
      projectCurrent,
      longestProject: Math.max(longestProject, projectCurrent),
    }
  }, [days, schedule])

  // ---- Derived: skill streak --------------------------------------------
  const skillStreak = useMemo(() => {
    let count = 0
    let cursor = todayKey()
    const hasSkill = (k) => Boolean(days[k]?.skill?.trim())
    if (!hasSkill(cursor)) cursor = addDays(cursor, -1)
    while (hasSkill(cursor)) {
      count += 1
      cursor = addDays(cursor, -1)
    }
    return count
  }, [days])

  // ---- Derived: reward points -------------------------------------------
  const rewards = useMemo(() => {
    let points = 0
    let totalSubmissions = 0
    let totalPages = 0
    let readingSummaries = 0
    Object.values(days).forEach((rec) => {
      if (rec.blocks?.project) points += POINTS.projectBlock
      if (completionRatio(rec) === 1) points += POINTS.perfectDay
      if (rec.skill?.trim()) points += POINTS.skill
      if (daySucceeded(rec)) points += POINTS.streakDay
      const s = rec.submissions || {}
      ;['company', 'project'].forEach((c) => {
        const list = submissionEntries(s[c])
        points += list.length * POINTS.submission
        totalSubmissions += list.length
      })
      if (rec.reading?.submittedAt) {
        points += POINTS.reading
        readingSummaries += 1
        totalPages += Number(rec.reading.pages) || 0
      }
    })
    let milestonesCompleted = 0
    milestones.forEach((m) => {
      if (m.completed) {
        points += POINTS.milestone
        milestonesCompleted += 1
      }
    })
    const nextTier = REWARD_TIERS.find((t) => points < t.at) || null
    const unlockedRewards = REWARD_TIERS.filter((t) => points >= t.at)
    const prevTierAt = unlockedRewards.length
      ? unlockedRewards[unlockedRewards.length - 1].at
      : 0
    return {
      points,
      totalSubmissions,
      totalPages,
      readingSummaries,
      milestonesCompleted,
      nextTier,
      prevTierAt,
      unlockedRewards,
    }
  }, [days, milestones, schedule])

  // ---- Derived: aggregate stats for badges & reports --------------------
  const achievementStats = useMemo(() => {
    let totalFocusMinutes = 0
    let totalSkills = 0
    let perfectDays = 0
    Object.values(days).forEach((rec) => {
      totalFocusMinutes += (rec.focus?.company || 0) + (rec.focus?.project || 0)
      if (rec.skill?.trim()) totalSkills += 1
      if (completionRatio(rec) === 1) perfectDays += 1
    })

    // Streak helper: count consecutive days ending today for a predicate.
    const backStreak = (pred) => {
      let n = 0
      let cursor = todayKey()
      if (!pred(cursor)) cursor = addDays(cursor, -1)
      while (pred(cursor)) {
        n += 1
        cursor = addDays(cursor, -1)
      }
      return n
    }

    const morningStreak = backStreak((k) => Boolean(days[k]?.blocks?.wake))
    const readingStreak = backStreak((k) => Boolean(days[k]?.reading?.submittedAt))
    const planStreak = backStreak((k) => (days[k]?.plan?.length || 0) > 0)
    const hasSubmission = (k) =>
      submissionEntries(days[k]?.submissions?.company).length > 0 ||
      submissionEntries(days[k]?.submissions?.project).length > 0
    const submissionStreak = backStreak(hasSubmission)

    return {
      totalFocusMinutes,
      totalSkills,
      perfectDays,
      morningStreak,
      readingStreak,
      planStreak,
      submissionStreak,
      longestStreak: streaks.longest,
      longestProjectStreak: streaks.longestProject,
      totalSubmissions: rewards.totalSubmissions,
      totalPages: rewards.totalPages,
      milestonesCompleted: rewards.milestonesCompleted,
      rewardPoints: rewards.points,
    }
  }, [days, streaks, rewards, schedule])

  // Evaluate badges and persist unlock timestamps the first time each unlocks.
  useEffect(() => {
    setBadgeUnlocks((prev) => {
      let changed = false
      const next = { ...prev }
      BADGES.forEach((b) => {
        if (!next[b.id] && b.check(achievementStats)) {
          next[b.id] = todayKey()
          changed = true
        }
      })
      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievementStats])

  const badges = useMemo(
    () =>
      BADGES.map((b) => ({
        ...b,
        unlocked: Boolean(badgeUnlocks[b.id]),
        unlockedAt: badgeUnlocks[b.id] || null,
      })),
    [badgeUnlocks]
  )

  // ---- Data management ---------------------------------------------------
  const exportData = useCallback(() => {
    const payload = {
      app: 'daily-tracker',
      version: 1,
      exportedAt: new Date().toISOString(),
      theme,
      settings,
      days,
      milestones,
      badges: badgeUnlocks,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-tracker-${todayKey()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [theme, settings, days, milestones, badgeUnlocks])

  const importData = useCallback(
    (payload) => {
      if (!payload || typeof payload !== 'object') return false
      if (payload.days) setDays(payload.days)
      if (payload.milestones) setMilestones(payload.milestones)
      if (payload.settings) setSettings(payload.settings)
      if (payload.badges) setBadgeUnlocks(payload.badges)
      if (payload.theme) setTheme(payload.theme)
      return true
    },
    [setDays, setMilestones, setSettings, setBadgeUnlocks, setTheme]
  )

  const clearAll = useCallback(() => {
    setDays({})
    setMilestones([])
    setBadgeUnlocks({})
    setSettings({ pomodoroMode: '50/10' })
  }, [setDays, setMilestones, setBadgeUnlocks, setSettings])

  const value = {
    // raw
    theme,
    setTheme,
    days,
    settings,
    setSettings,
    milestones,
    // schedule (editable)
    schedule,
    updateSchedule,
    resetSchedule,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    sortSchedule,
    // day ops
    getDay,
    updateDay,
    setBlock,
    toggleBlock,
    addFocusMinutes,
    // submissions / reading / plan
    updateWorkDraft,
    submitWork,
    updateReadingDraft,
    submitReading,
    setPlan,
    togglePlanTask,
    // away / not-done / punishments
    toggleExcused,
    toggleSkipped,
    clearBlockFlags,
    excuseBlocks,
    markPunishmentDone,
    // freeze
    canFreeze,
    toggleFreeze,
    freezesUsedThisWeek,
    // milestones
    addMilestone,
    updateMilestone,
    removeMilestone,
    // derived
    streaks,
    skillStreak,
    achievementStats,
    rewards,
    badges,
    // data
    exportData,
    importData,
    clearAll,
    // helpers (re-exported for convenience)
    helpers: { blocksDone, completionRatio, projectHoursMet, daySucceeded },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
