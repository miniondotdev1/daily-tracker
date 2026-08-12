import { useApp } from '../context/AppContext'
import { Sun, Moon, Monitor } from './Icons'

// Segmented control: Light / System / Dark. Choice persists via context.
export default function ThemeToggle() {
  const { theme, setTheme } = useApp()
  const options = [
    { key: 'light', label: 'Light', Icon: Sun },
    { key: 'system', label: 'System', Icon: Monitor },
    { key: 'dark', label: 'Dark', Icon: Moon },
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
    >
      {options.map(({ key, label, Icon }) => {
        const active = theme === key
        return (
          <button
            key={key}
            role="radio"
            aria-checked={active}
            title={label}
            onClick={() => setTheme(key)}
            className={`flex h-8 w-9 items-center justify-center rounded-lg text-base transition-all ${
              active
                ? 'bg-white text-project-600 shadow-sm dark:bg-slate-950 dark:text-project-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Icon />
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
