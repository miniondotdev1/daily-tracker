// Lightweight inline SVG icons so we ship zero icon dependencies. Each accepts
// standard SVG props (className, etc.) and inherits `currentColor`.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  width: '1em',
  height: '1em',
}

export const Sun = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const Moon = (p) => (
  <svg {...base} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

export const Monitor = (p) => (
  <svg {...base} {...p}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
)

export const Check = (p) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const Flame = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M12 2c1 3-1 4-2 6-1 1.8-.5 3.5.8 4.3.4-1 .9-1.7 1.7-2.3-.2 1.6.6 2.7 1.6 3.5 1.4 1 1.6 2.6.9 3.9C16.9 20.8 15 22 12 22c-3.9 0-7-2.7-7-6.4 0-2.6 1.6-4.6 2.7-6C9.2 7.5 11 5.6 12 2z" />
  </svg>
)

export const Trophy = (p) => (
  <svg {...base} {...p}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4a2 2 0 0 0 2 4M17 6h3a2 2 0 0 1-2 4" />
  </svg>
)

export const Target = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
)

export const Bolt = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
  </svg>
)

export const Play = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M6 4l14 8-14 8V4z" />
  </svg>
)

export const Pause = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

export const Reset = (p) => (
  <svg {...base} {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

export const Expand = (p) => (
  <svg {...base} {...p}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
)

export const Close = (p) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const Plus = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const Trash = (p) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
)

export const Download = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
)

export const Snow = (p) => (
  <svg {...base} {...p}>
    <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19M12 5l-2.5 2M12 5l2.5 2M12 19l-2.5-2M12 19l2.5-2" />
  </svg>
)

export const Chevron = (p) => (
  <svg {...base} {...p}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export const Star = (p) => (
  <svg {...base} {...p}>
    <path d="M12 2l3 6.5 7 .9-5 4.9 1.2 7-6.2-3.4L5.8 21 7 14.3 2 9.4l7-.9L12 2z" />
  </svg>
)

export const Book = (p) => (
  <svg {...base} {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2V5z" />
    <path d="M4 5v14" />
  </svg>
)

export const Chart = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 15l3-4 3 2 4-6" />
  </svg>
)

export const Bell = (p) => (
  <svg {...base} {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
)

export const BellOff = (p) => (
  <svg {...base} {...p}>
    <path d="M13.7 21a2 2 0 0 1-3.4 0M18.6 13A17 17 0 0 1 18 8M6 8a6 6 0 0 1 10-4.5M3 3l18 18M17 17H3s3-2 3-9" />
  </svg>
)

export const Copy = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const Lock = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

export const Send = (p) => (
  <svg {...base} {...p}>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)

export const Gift = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13M5 12v9h14v-9" />
    <path d="M12 8S10.5 3 7.5 4.2 9 8 12 8zM12 8s1.5-5 4.5-3.8S15 8 12 8z" />
  </svg>
)

export const Rocket = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8a2 2 0 0 0-2.9-.2zM12 15l-3-3a12 12 0 0 1 3-6c1.6-1.6 4-2.4 6-2 .4 2-.4 4.4-2 6a12 12 0 0 1-4 3.5z" />
    <path d="M9 12H4s.5-2.8 2-4 5 0 5 0M12 15v5s2.8-.5 4-2 0-5 0-5" />
  </svg>
)

export const Clock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const Dumbbell = (p) => (
  <svg {...base} {...p}>
    <path d="M6 7v10M4 9v6M18 7v10M20 9v6M6 12h12" />
  </svg>
)

export const DoorOpen = (p) => (
  <svg {...base} {...p}>
    <path d="M13 4v16M13 4l6 2v12l-6 2M4 21h16" />
    <circle cx="11" cy="12" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)

export const User = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)

export const LogOut = (p) => (
  <svg {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)

export const Mail = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

export const Cloud = (p) => (
  <svg {...base} {...p}>
    <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6.5 19h11z" />
  </svg>
)

// Google 'G' in brand colors — used on the OAuth button.
export const GoogleG = (p) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" {...p}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
)
