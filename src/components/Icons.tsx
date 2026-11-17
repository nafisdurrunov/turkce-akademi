import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = (p: P) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const Icons = {
  home: (p: P) => (
    <svg {...base(p)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  ),
  book: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z" />
      <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
      <path d="M8 6h8" />
    </svg>
  ),
  note: (p: P) => (
    <svg {...base(p)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  ),
  user: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  ),
  flame: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 22c4 0 7-2.8 7-6.6 0-3.4-2.4-5.6-3.8-7.8-.4 1.5-1.1 2.6-2.2 3.4.2-3.2-1-5.6-2.5-7.5C9.5 6 5 9.2 5 15.4 5 19.2 8 22 12 22Z" />
      <path d="M12 18.5c1.6 0 2.7-1.1 2.7-2.6 0-1.4-1-2.3-1.6-3.4-.5.9-1.6 1.7-1.6 3.4 0 1.5.5 2.6.5 2.6Z" />
    </svg>
  ),
  sun: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  ),
  moon: (p: P) => (
    <svg {...base(p)}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  ),
  volume: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 9.5h3l4.5-4v13L7 14.5H4z" />
      <path d="M16 8.8a4.5 4.5 0 0 1 0 6.4M18.6 6.2a8 8 0 0 1 0 11.6" />
    </svg>
  ),
  check: (p: P) => (
    <svg {...base(p)}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </svg>
  ),
  checkCircle: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.6 2.6L16 9.5" />
    </svg>
  ),
  circle: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  arrowRight: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />
    </svg>
  ),
  arrowLeft: (p: P) => (
    <svg {...base(p)}>
      <path d="M20 12H5M11 5.5 4.5 12 11 18.5" />
    </svg>
  ),
  chevronDown: (p: P) => (
    <svg {...base(p)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  sparkles: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 3l1.8 4.6L18.5 9.5l-4.7 1.9L12 16l-1.8-4.6L5.5 9.5l4.7-1.9z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </svg>
  ),
  keyboard: (p: P) => (
    <svg {...base(p)}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8" />
    </svg>
  ),
  cards: (p: P) => (
    <svg {...base(p)}>
      <rect x="7" y="3" width="12" height="16" rx="2.5" />
      <path d="M4.5 6.5v12A2.5 2.5 0 0 0 7 21h9" />
    </svg>
  ),
  quiz: (p: P) => (
    <svg {...base(p)}>
      <path d="M9.5 9a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1 1-1.1 1.8v.3" />
      <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  shuffle: (p: P) => (
    <svg {...base(p)}>
      <path d="M17 3.5 20.5 7 17 10.5M17 13.5 20.5 17 17 20.5" />
      <path d="M3.5 7h3.2c1.4 0 2.7.7 3.4 1.9l4 6.5c.7 1.2 2 1.9 3.4 1.9h3" />
      <path d="M3.5 17h3.2c1.4 0 2.7-.7 3.4-1.9l.7-1.1M20.5 7h-3" />
    </svg>
  ),
  cloud: (p: P) => (
    <svg {...base(p)}>
      <path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7A5.5 5.5 0 0 0 7.3 10 4.3 4.3 0 0 0 7 18.5Z" />
    </svg>
  ),
  cloudOff: (p: P) => (
    <svg {...base(p)}>
      <path d="M8.6 5.6A5.5 5.5 0 0 1 17.9 10a3.9 3.9 0 0 1 2.7 5.2M17 18.5H7A4.3 4.3 0 0 1 5.6 10.2" />
      <path d="m3 3 18 18" />
    </svg>
  ),
  refresh: (p: P) => (
    <svg {...base(p)}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4.5V11h-6" />
    </svg>
  ),
  logout: (p: P) => (
    <svg {...base(p)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 8 4 4-4 4M20 12H9" />
    </svg>
  ),
  download: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 3v12M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4 19.5h16" />
    </svg>
  ),
  upload: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 15V3M7.5 7.5 12 3l4.5 4.5" />
      <path d="M4 19.5h16" />
    </svg>
  ),
  trash: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 6.5h16M9 6.5V4h6v2.5" />
      <path d="M6.5 6.5 7.5 21h9l1-14.5" />
      <path d="M10.5 11v5M13.5 11v5" />
    </svg>
  ),
  copy: (p: P) => (
    <svg {...base(p)}>
      <rect x="9" y="9" width="12" height="12" rx="2.5" />
      <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3h-7A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
    </svg>
  ),
  play: (p: P) => (
    <svg {...base(p)}>
      <path d="M7.5 5.5 18 12 7.5 18.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  pause: (p: P) => (
    <svg {...base(p)}>
      <rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  x: (p: P) => (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  menu: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  target: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none" />
    </svg>
  ),
  trophy: (p: P) => (
    <svg {...base(p)}>
      <path d="M8 4h8v5.5a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5.5V7a3.5 3.5 0 0 0 3.5 3.5M16 5.5h2.5V7A3.5 3.5 0 0 1 15 10.5" />
      <path d="M12 13.5V17M8.5 20.5h7l-.7-3.5h-5.6z" />
    </svg>
  ),
  clock: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  layers: (p: P) => (
    <svg {...base(p)}>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" />
    </svg>
  ),
  lock: (p: P) => (
    <svg {...base(p)}>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  mail: (p: P) => (
    <svg {...base(p)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  ),
  eye: (p: P) => (
    <svg {...base(p)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.8 3.6M6.6 8A17 17 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.4-.7" />
    </svg>
  ),
  info: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r=".7" fill="currentColor" stroke="none" />
    </svg>
  ),
  warn: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 3.5 21.5 20h-19z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />
    </svg>
  ),
  globe: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9.5h17M3.5 14.5h17" />
      <path d="M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21c-2.2-2.4-3.4-5.4-3.4-9S9.8 5.4 12 3Z" />
    </svg>
  ),
  star: (p: P) => (
    <svg {...base(p)}>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.9-5.2 2.9 1-5.9L3.5 9.7l5.9-.8z" />
    </svg>
  ),
  pin: (p: P) => (
    <svg {...base(p)}>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  search: (p: P) => (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.2 16.2 4.3 4.3" />
    </svg>
  ),
}

export type IconName = keyof typeof Icons

export function Icon({ name, ...rest }: { name: IconName } & P) {
  const Cmp = Icons[name]
  return <Cmp {...rest} />
}
