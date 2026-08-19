const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export const BedIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
    <path d="M3 18h18M5 10V6h14v4M7 10V7h10v3" />
    <path d="M3 15h18" />
  </svg>
)

export const BathIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12h16a2 2 0 0 1 2 2 6 6 0 0 1-6 6H8a6 6 0 0 1-6-6 2 2 0 0 1 2-2Z" />
    <path d="M6 12V5a2 2 0 0 1 4 0M18 12V6a2 2 0 0 0-2-2M8 5h8" />
  </svg>
)

export const AreaIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v6H3M15 21v-6h6" />
    <path d="m3 9 6-6m6 12 6-6" />
  </svg>
)

export const CheckIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
)

export const MapPinIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
)

export const PhoneIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 5c0 8 7 15 15 15l2-4-4-2-2 2c-3-1-6-4-7-7l2-2-2-4-4 2Z" />
  </svg>
)

export const MailIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

export const ClockIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

export const ArrowRightIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12h16m-6-6 6 6-6 6" />
  </svg>
)

export const LeafIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M5 19C5 9 12 4 20 4c0 9-5 15-14 15" />
    <path d="M5 19c2-5 6-9 11-11" />
  </svg>
)

export const SunIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const ShieldIcon = ({ filled, ...props }) => (
  <svg {...base} {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const HomeIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 9.5V21h14V9.5M9 21v-6h6v6" />
  </svg>
)

export const MenuIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const KeyIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="8" cy="14" r="4.5" />
    <path d="m11.5 10.5 8-8M16 6l3 3M13.5 8.5 17 12" />
  </svg>
)

export const HeartIcon = ({ filled = false, ...props }) => (
  <svg {...base} {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.3C6.6 16.5 3 13.2 3 9.6 3 7.1 5 5 7.5 5c1.7 0 3.3.9 4.5 2.3C13.2 5.9 14.8 5 16.5 5 19 5 21 7.1 21 9.6c0 3.6-3.6 6.9-9 10.7Z" />
  </svg>
)

export const LinkIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M9.5 14.5l5-5" />
    <path d="M7.2 16.8 5.6 18.4a3.5 3.5 0 0 1-5-5L4.8 9.2a3.5 3.5 0 0 1 5 0l1.6 1.6M16.8 7.2l1.6-1.6a3.5 3.5 0 0 1 5 5l-4.2 4.2a3.5 3.5 0 0 1-5 0l-1.6-1.6" />
  </svg>
)

export const SearchIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const CompareIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="2" y="3" width="8" height="18" rx="1" />
    <rect x="14" y="3" width="8" height="18" rx="1" />
    <path d="M10 9h4M10 15h4" />
  </svg>
)

export const CalculatorIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h8M8 14h4M8 18h4M16 14v4" />
  </svg>
)

export const ChevronDownIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const TrashIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

export const BellIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

export const StarIcon = ({ filled = false, ...props }) => (
  <svg {...base} {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
  </svg>
)

export const BriefcaseIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
)

export const LanguagesIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M5 8l6 6" />
    <path d="M4 14l6-6 2-3" />
    <path d="M2 5h12" />
    <path d="M7 2h1" />
    <path d="m22 22-5-10-5 10" />
    <path d="M14 18h6" />
  </svg>
)

export const WalkIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="14" cy="4" r="2" />
    <path d="M16.5 7.5 13 12l3 4" />
    <path d="M10 12h8" />
    <path d="m11 17 2 5 2-5" />
    <path d="M7 12l2.5-2.5" />
  </svg>
)

export const UsersIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

export const TreeIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 22v-7" />
    <path d="M12 15c-3.3 0-6-2.7-6-6 0-2.2 1.2-4.2 3-5.3C10.8 2.6 12 1 12 1s1.2 1.6 3 2.7c1.8 1.1 3 3.1 3 5.3 0 3.3-2.7 6-6 6Z" />
  </svg>
)

export const GridIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

export const MapIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20.5 3l-.16.03L15 5.1 3 3.5 2.8 5l9.9 8.3-7.8 3.5L4 18l2.1-.5 7.9-3.5 5.5 1.2.1-.03L21 5.5 21 3l-.5-.5Z" />
    <path d="M12 22V8" />
  </svg>
)
