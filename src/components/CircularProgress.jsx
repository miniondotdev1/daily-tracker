// A reusable animated SVG ring. `value` is 0..1. The stroke smoothly animates
// via CSS transition on strokeDashoffset.
// Map a 0..1 value to a hue that sweeps red → orange → yellow → green so the
// ring visibly "warms up" as the day fills in. Exported so the % label and
// other bits can match the ring exactly.
export function progressHue(value) {
  const clamped = Math.max(0, Math.min(1, value))
  return Math.round(clamped * 140) // 0deg (red) → 140deg (green)
}
export function progressColor(value) {
  return `hsl(${progressHue(value)}, 85%, 52%)`
}

export default function CircularProgress({
  value = 0,
  size = 200,
  stroke = 14,
  children,
  trackClass = 'text-slate-200 dark:text-slate-800',
  progressClass = 'text-project-500',
  // When true, the stroke color animates across the spectrum with `value`.
  // You can also pass an explicit CSS color string via `color`.
  dynamicColor = false,
  color = null,
  rounded = true,
}) {
  const clamped = Math.max(0, Math.min(1, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - clamped)
  const strokeColor = color || (dynamicColor ? progressColor(clamped) : null)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClass}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap={rounded ? 'round' : 'butt'}
          className={strokeColor ? '' : progressClass}
          stroke={strokeColor || 'currentColor'}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition:
              'stroke-dashoffset 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.7s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}
