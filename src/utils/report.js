import { SCHEDULE } from '../constants/schedule'
import { longDate } from './dates'
import {
  submissionEntries,
  blocksDone,
  completionRatio,
} from '../context/AppContext'

// Build a plain-text report for a single day's record. Shared by the Daily
// Report card and the Daily Tracking history so the copy format is identical.
export function buildDayReport(record, dateKey) {
  const company = submissionEntries(record.submissions?.company)
  const project = submissionEntries(record.submissions?.project)
  const reading = record.reading?.submittedAt ? record.reading : null

  const lines = [`🗓️  Daily Report — ${longDate(dateKey)}`, '']
  lines.push(
    `Schedule: ${blocksDone(record)}/${SCHEDULE.length} blocks (${Math.round(
      completionRatio(record) * 100
    )}%)`
  )

  const pri = (record.priorities || []).filter((p) => p.trim())
  if (pri.length) {
    lines.push('', 'Top priorities:')
    pri.forEach((p, i) => lines.push(`  ${i + 1}. ${p}`))
  }
  if (company.length) {
    lines.push('', `💼 Company work (${company.length} submissions):`)
    company.forEach((e, i) => lines.push(`  ${i + 1}. (${e.count} tasks) ${e.text}`))
  }
  if (project.length) {
    lines.push('', `🚀 Project work (${project.length} submissions):`)
    project.forEach((e, i) => lines.push(`  ${i + 1}. (${e.count} tasks) ${e.text}`))
  }
  if (reading) {
    lines.push(
      '',
      `📚 Reading — ${reading.pages || 0} pages · ${reading.topic || 'General'}:`,
      reading.summary
    )
  }
  if (record.skill?.trim()) lines.push('', `🧠 New skill: ${record.skill}`)
  if (record.focusScore) lines.push(`⭐ Focus score: ${record.focusScore}/5`)
  if (record.notes?.trim()) lines.push('', `📝 Notes: ${record.notes}`)
  return lines.join('\n')
}
