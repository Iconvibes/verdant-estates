import { useState } from 'react'

/**
 * Generates a professional SVG floor plan from property specifications.
 * Each property type gets a unique, architecturally plausible layout.
 */

const PALETTE = {
  wall: '#1D4235',
  wallLight: '#2D5A4A',
  fill: '#FAF6F0',
  room: '#F5F0E8',
  bedroom: '#E8F0E5',
  bathroom: '#D6E8F0',
  kitchen: '#F0E8D6',
  living: '#F5F0E8',
  outdoor: '#E5EDE5',
  text: '#3D3D3D',
  accent: '#B49054',
  grid: '#E5E0D8',
}

const ROOM_COLORS = {
  living: PALETTE.living,
  lounge: PALETTE.living,
  'family lounge': PALETTE.living,
  dining: PALETTE.living,
  kitchen: PALETTE.kitchen,
  'gourmet kitchen': PALETTE.kitchen,
  'open kitchen': PALETTE.kitchen,
  pantry: PALETTE.kitchen,
  'butler\'s pantry': PALETTE.kitchen,
  scullery: PALETTE.kitchen,
  master: PALETTE.bedroom,
  'master suite': PALETTE.bedroom,
  bedroom: PALETTE.bedroom,
  'guest suite': PALETTE.bedroom,
  study: PALETTE.living,
  'reading nook': PALETTE.living,
  office: PALETTE.living,
  bathroom: PALETTE.bathroom,
  ensuite: PALETTE.bathroom,
  'rainfall shower': PALETTE.bathroom,
  garage: PALETTE.outdoor,
  'car garage': PALETTE.outdoor,
  carport: PALETTE.outdoor,
  terrace: PALETTE.outdoor,
  veranda: PALETTE.outdoor,
  lanai: PALETTE.outdoor,
  'sky terrace': PALETTE.outdoor,
  balcony: PALETTE.outdoor,
  courtyard: PALETTE.outdoor,
  'water feature': PALETTE.outdoor,
  pool: PALETTE.bathroom,
  'infinity pool': PALETTE.bathroom,
  garden: PALETTE.outdoor,
  'forest garden': PALETTE.outdoor,
  laundry: PALETTE.kitchen,
  'utility room': PALETTE.kitchen,
  store: PALETTE.kitchen,
  cinema: PALETTE.living,
  gym: PALETTE.living,
  'wine cellar': PALETTE.kitchen,
  'media room': PALETTE.living,
  'staff quarters': PALETTE.bedroom,
  'lift lobby': PALETTE.outdoor,
  entrance: PALETTE.outdoor,
  foyer: PALETTE.outdoor,
  hallway: PALETTE.fill,
  corridor: PALETTE.fill,
}

function getRoomColor(name) {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(ROOM_COLORS)) {
    if (lower.includes(key)) return color
  }
  if (lower.includes('bed') || lower.includes('suite')) return PALETTE.bedroom
  if (lower.includes('bath') || lower.includes('shower') || lower.includes('wc')) return PALETTE.bathroom
  if (lower.includes('kit')) return PALETTE.kitchen
  if (lower.includes('living') || lower.includes('lounge') || lower.includes('dining')) return PALETTE.living
  return PALETTE.room
}

/**
 * Floor plan definitions for each property.
 * Coordinates are in a 600×400 viewBox.
 */
const FLOOR_PLANS = {
  1: [ // The Canopy Residence — 5 bed, 6 bath, 640m² Detached Duplex
    {
      label: 'Ground Floor',
      rooms: [
        { name: 'Entrance Foyer', x: 240, y: 340, w: 120, h: 50 },
        { name: 'Living Room', x: 40, y: 180, w: 200, h: 160, note: 'Double Height' },
        { name: 'Dining', x: 240, y: 180, w: 140, h: 100 },
        { name: 'Gourmet Kitchen', x: 380, y: 180, w: 180, h: 100 },
        { name: "Butler's Pantry", x: 380, y: 280, w: 100, h: 60 },
        { name: 'Guest Suite', x: 240, y: 280, w: 140, h: 60 },
        { name: 'Staff Quarters', x: 480, y: 280, w: 80, h: 60 },
        { name: 'Garage', x: 40, y: 340, w: 200, h: 50, note: 'Triple' },
        { name: 'Veranda', x: 40, y: 140, w: 200, h: 40, note: 'Wrap-around' },
        { name: 'Courtyard', x: 380, y: 140, w: 180, h: 40, note: 'Rain Garden' },
      ],
    },
    {
      label: 'First Floor',
      rooms: [
        { name: 'Master Suite', x: 40, y: 140, w: 200, h: 120, note: 'Walk-in' },
        { name: 'Ensuite', x: 40, y: 260, w: 100, h: 60 },
        { name: 'Bedroom 2', x: 240, y: 140, w: 140, h: 100 },
        { name: 'Bedroom 3', x: 240, y: 240, w: 140, h: 80 },
        { name: 'Bedroom 4', x: 380, y: 140, w: 140, h: 100 },
        { name: 'Study', x: 380, y: 240, w: 100, h: 80 },
        { name: 'Sky Terrace', x: 480, y: 240, w: 80, h: 80 },
        { name: 'Hallway', x: 140, y: 260, w: 100, h: 60 },
        { name: 'Ensuite', x: 240, y: 320, w: 140, h: 40 },
        { name: 'Ensuite', x: 380, y: 320, w: 140, h: 40 },
      ],
    },
  ],
  2: [ // Lagoon Pearl Villa — 6 bed, 7 bath, 980m² Waterfront Villa
    {
      label: 'Ground Floor',
      rooms: [
        { name: 'Entrance', x: 240, y: 350, w: 120, h: 40 },
        { name: 'Living Room', x: 40, y: 180, w: 220, h: 170, note: 'Double Height' },
        { name: 'Dining', x: 260, y: 180, w: 160, h: 100 },
        { name: 'Gourmet Kitchen', x: 420, y: 180, w: 160, h: 100 },
        { name: 'Guest Suite', x: 260, y: 280, w: 160, h: 70 },
        { name: 'Staff Quarters', x: 420, y: 280, w: 160, h: 70 },
        { name: 'Courtyard', x: 260, y: 140, w: 160, h: 40, note: 'Rain Garden' },
        { name: 'Veranda', x: 40, y: 140, w: 220, h: 40 },
        { name: 'Infinity Pool', x: 40, y: 40, w: 300, h: 100, note: 'Lagoon-facing' },
        { name: 'Jetty', x: 340, y: 40, w: 100, h: 100 },
        { name: 'Garage', x: 420, y: 40, w: 160, h: 100, note: 'Triple' },
      ],
    },
    {
      label: 'First Floor',
      rooms: [
        { name: 'Master Suite', x: 40, y: 120, w: 200, h: 140, note: 'Lagoon View' },
        { name: 'Ensuite', x: 40, y: 260, w: 100, h: 60 },
        { name: 'Bedroom 2', x: 240, y: 120, w: 130, h: 100 },
        { name: 'Bedroom 3', x: 370, y: 120, w: 130, h: 100 },
        { name: 'Bedroom 4', x: 40, y: 320, w: 130, h: 60 },
        { name: 'Bedroom 5', x: 170, y: 320, w: 130, h: 60 },
        { name: 'Bedroom 6', x: 300, y: 320, w: 130, h: 60 },
        { name: 'Hallway', x: 240, y: 220, w: 260, h: 40 },
        { name: 'Cinema', x: 370, y: 260, w: 130, h: 60 },
        { name: 'Wine Cellar', x: 500, y: 120, w: 80, h: 100 },
        { name: 'Gym', x: 500, y: 220, w: 80, h: 40 },
      ],
    },
  ],
  3: [ // Jasmine Court — 4 bed, 5 bath, 420m² Terrace Duplex
    {
      label: 'Ground Floor',
      rooms: [
        { name: 'Entrance', x: 220, y: 350, w: 160, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 240, h: 190, note: 'Open-plan' },
        { name: 'Kitchen', x: 280, y: 160, w: 160, h: 120 },
        { name: 'Guest Suite', x: 280, y: 280, w: 160, h: 70 },
        { name: 'Utility', x: 440, y: 160, w: 80, h: 120 },
        { name: 'Courtyard', x: 440, y: 280, w: 80, h: 70 },
        { name: 'Balcony', x: 40, y: 120, w: 240, h: 40, note: 'Planted' },
      ],
    },
    {
      label: 'First Floor',
      rooms: [
        { name: 'Master Suite', x: 40, y: 120, w: 200, h: 140, note: 'Walk-in' },
        { name: 'Ensuite', x: 40, y: 260, w: 100, h: 60 },
        { name: 'Bedroom 2', x: 240, y: 120, w: 140, h: 100 },
        { name: 'Bedroom 3', x: 240, y: 220, w: 140, h: 100 },
        { name: 'Bedroom 4', x: 380, y: 120, w: 140, h: 100 },
        { name: 'Hallway', x: 140, y: 260, w: 100, h: 60 },
        { name: 'Balcony', x: 380, y: 220, w: 140, h: 100, note: 'Planted' },
      ],
    },
  ],
  4: [ // Palm Boulevard Penthouse — 4 bed, 4 bath, 380m² Penthouse
    {
      label: 'Single Floor',
      rooms: [
        { name: 'Private Lift Lobby', x: 250, y: 350, w: 100, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 220, h: 190, note: 'Full height' },
        { name: 'Chef\'s Kitchen', x: 260, y: 160, w: 160, h: 120 },
        { name: 'Master Suite', x: 420, y: 160, w: 160, h: 120, note: 'Corner' },
        { name: 'Bedroom 2', x: 260, y: 280, w: 160, h: 70 },
        { name: 'Bedroom 3', x: 420, y: 280, w: 160, h: 70 },
        { name: 'Bedroom 4', x: 40, y: 280, w: 220, h: 70 },
        { name: 'Sky Terrace', x: 40, y: 40, w: 540, h: 120, note: 'Wraparound' },
        { name: 'Ensuite', x: 420, y: 120, w: 160, h: 40 },
      ],
    },
  ],
  5: [ // Fern House — 4 bed, 4 bath, 360m² Semi-Detached
    {
      label: 'Ground Floor',
      rooms: [
        { name: 'Entrance', x: 220, y: 350, w: 160, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 200, h: 190, note: 'Green wall' },
        { name: 'Kitchen', x: 240, y: 160, w: 160, h: 120 },
        { name: 'Study Nook', x: 400, y: 160, w: 100, h: 80 },
        { name: 'Guest Suite', x: 240, y: 280, w: 160, h: 70 },
        { name: 'Sunken Courtyard', x: 400, y: 240, w: 100, h: 110, note: 'Water feature' },
        { name: 'Veranda', x: 40, y: 120, w: 200, h: 40 },
      ],
    },
    {
      label: 'First Floor',
      rooms: [
        { name: 'Master Suite', x: 40, y: 120, w: 200, h: 140 },
        { name: 'Ensuite', x: 40, y: 260, w: 100, h: 60 },
        { name: 'Bedroom 2', x: 240, y: 120, w: 140, h: 100 },
        { name: 'Bedroom 3', x: 240, y: 220, w: 140, h: 100 },
        { name: 'Bedroom 4', x: 380, y: 120, w: 120, h: 100 },
        { name: 'Hallway', x: 140, y: 260, w: 100, h: 60 },
        { name: 'Balcony', x: 380, y: 220, w: 120, h: 100 },
      ],
    },
  ],
  6: [ // Cedar Villa — 5 bed, 6 bath, 560m² Detached Villa
    {
      label: 'Ground Floor',
      rooms: [
        { name: 'Foyer', x: 220, y: 350, w: 160, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 200, h: 190, note: 'Cedar ceilings' },
        { name: 'Kitchen', x: 240, y: 160, w: 180, h: 120 },
        { name: 'Dining', x: 240, y: 280, w: 180, h: 70 },
        { name: 'Guest House', x: 420, y: 160, w: 140, h: 120, note: 'Private entrance' },
        { name: 'Lanai', x: 40, y: 120, w: 200, h: 40, note: 'Covered' },
        { name: 'Forest Garden', x: 420, y: 280, w: 140, h: 70, note: 'Native species' },
        { name: 'Garage', x: 420, y: 40, w: 140, h: 120 },
      ],
    },
    {
      label: 'First Floor',
      rooms: [
        { name: 'Master Suite 1', x: 40, y: 120, w: 200, h: 140, note: 'Dressing room' },
        { name: 'Master Suite 2', x: 240, y: 120, w: 200, h: 140, note: 'Dressing room' },
        { name: 'Bedroom 3', x: 440, y: 120, w: 120, h: 100 },
        { name: 'Bedroom 4', x: 40, y: 260, w: 200, h: 80 },
        { name: 'Bedroom 5', x: 240, y: 260, w: 200, h: 80 },
        { name: 'Media Room', x: 440, y: 220, w: 120, h: 120 },
        { name: 'Hallway', x: 240, y: 340, w: 200, h: 40 },
      ],
    },
  ],
  7: [ // Osborne Sky Residence — 3 bed, 4 bath, 250m² Apartment
    {
      label: 'Single Floor',
      rooms: [
        { name: 'Entrance', x: 240, y: 350, w: 120, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 220, h: 190, note: 'Lagoon view' },
        { name: 'Kitchen', x: 260, y: 160, w: 140, h: 120 },
        { name: 'Master Suite', x: 400, y: 160, w: 160, h: 140, note: 'Corner' },
        { name: 'Bedroom 2', x: 260, y: 280, w: 140, h: 70 },
        { name: 'Bedroom 3', x: 400, y: 300, w: 160, h: 50 },
        { name: 'Balcony', x: 40, y: 120, w: 220, h: 40, note: 'Lagoon-facing' },
      ],
    },
  ],
  8: [ // Canopy Loft — 3 bed, 3 bath, 210m² Duplex Apartment
    {
      label: 'Lower Level',
      rooms: [
        { name: 'Entrance', x: 220, y: 350, w: 160, h: 40 },
        { name: 'Living Volume', x: 40, y: 140, w: 240, h: 210, note: 'Double-height' },
        { name: 'Kitchen', x: 280, y: 140, w: 160, h: 120 },
        { name: 'Utility', x: 280, y: 260, w: 160, h: 90 },
        { name: 'Co-working', x: 440, y: 140, w: 120, h: 120 },
        { name: 'Bike Store', x: 440, y: 260, w: 120, h: 90 },
      ],
    },
    {
      label: 'Upper Level',
      rooms: [
        { name: 'Master Suite', x: 40, y: 120, w: 220, h: 140 },
        { name: 'Bedroom 2', x: 260, y: 120, w: 160, h: 100 },
        { name: 'Bedroom 3', x: 420, y: 120, w: 140, h: 100 },
        { name: 'Hallway', x: 260, y: 220, w: 300, h: 40 },
        { name: 'Roof Terrace', x: 40, y: 260, w: 520, h: 80, note: 'Entertaining' },
      ],
    },
  ],
  9: [ // Veranda House — 3 bed, 3 bath, 240m² Townhouse
    {
      label: 'Ground Floor',
      rooms: [
        { name: 'Entrance', x: 220, y: 350, w: 160, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 220, h: 190, note: 'Timber louvers' },
        { name: 'Kitchen', x: 260, y: 160, w: 160, h: 120 },
        { name: 'Dining', x: 260, y: 280, w: 160, h: 70 },
        { name: 'Courtyard', x: 420, y: 160, w: 120, h: 120, note: 'Rain capture' },
        { name: 'Deep Veranda', x: 40, y: 120, w: 220, h: 40 },
      ],
    },
    {
      label: 'First Floor',
      rooms: [
        { name: 'Master Suite', x: 40, y: 120, w: 220, h: 140 },
        { name: 'Bedroom 2', x: 260, y: 120, w: 160, h: 100 },
        { name: 'Bedroom 3', x: 420, y: 120, w: 120, h: 100 },
        { name: 'Hallway', x: 260, y: 220, w: 280, h: 40 },
        { name: 'Balcony', x: 40, y: 260, w: 220, h: 80 },
      ],
    },
  ],
  10: [ // Moss & Stone House — 4 bed, 5 bath, 330m² Bungalow
    {
      label: 'Single Floor',
      rooms: [
        { name: 'Entrance', x: 250, y: 350, w: 100, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 220, h: 190, note: 'Accessible' },
        { name: 'Kitchen', x: 260, y: 160, w: 160, h: 120 },
        { name: 'Master Suite', x: 420, y: 160, w: 140, h: 140 },
        { name: 'Bedroom 2', x: 260, y: 280, w: 80, h: 70 },
        { name: 'Bedroom 3', x: 340, y: 280, w: 80, h: 70 },
        { name: 'Bedroom 4', x: 420, y: 300, w: 140, h: 50 },
        { name: 'Garden Room', x: 40, y: 280, w: 220, h: 70, note: 'Green wall' },
        { name: 'Veranda', x: 40, y: 120, w: 220, h: 40 },
        { name: 'Lawn', x: 420, y: 40, w: 140, h: 120 },
      ],
    },
  ],
  11: [ // Garden Terrace — 4 bed, 4 bath, 280m² Terrace Duplex
    {
      label: 'Ground Floor',
      rooms: [
        { name: 'Entrance', x: 220, y: 350, w: 160, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 220, h: 190 },
        { name: 'Open Kitchen', x: 260, y: 160, w: 180, h: 120 },
        { name: 'Dining', x: 260, y: 280, w: 180, h: 70 },
        { name: 'Laundry', x: 440, y: 160, w: 100, h: 80 },
        { name: 'Service', x: 440, y: 240, w: 100, h: 110 },
      ],
    },
    {
      label: 'First Floor',
      rooms: [
        { name: 'Master Suite', x: 40, y: 120, w: 220, h: 140 },
        { name: 'Bedroom 2', x: 260, y: 120, w: 150, h: 100 },
        { name: 'Bedroom 3', x: 260, y: 220, w: 150, h: 100 },
        { name: 'Bedroom 4', x: 410, y: 120, w: 130, h: 100 },
        { name: 'Rooftop Terrace', x: 410, y: 220, w: 130, h: 120, note: 'Planted beds' },
        { name: 'Hallway', x: 260, y: 320, w: 280, h: 40 },
      ],
    },
  ],
  12: [ // Atlantic View Apartment — 2 bed, 2 bath, 160m² Apartment
    {
      label: 'Single Floor',
      rooms: [
        { name: 'Entrance', x: 240, y: 350, w: 120, h: 40 },
        { name: 'Living Room', x: 40, y: 160, w: 240, h: 190, note: 'Ocean view' },
        { name: 'Kitchen', x: 280, y: 160, w: 140, h: 120 },
        { name: 'Master Suite', x: 420, y: 160, w: 140, h: 120 },
        { name: 'Bedroom 2', x: 280, y: 280, w: 140, h: 70 },
        { name: 'Storage', x: 420, y: 280, w: 140, h: 70 },
        { name: 'Balcony', x: 40, y: 120, w: 240, h: 40, note: 'Ocean-facing' },
      ],
    },
  ],
}

/* ──────────── SVG Components ──────────── */

function FloorPlanSVG({ rooms, width = 600, height = 400 }) {
  const padding = 20
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      role="img"
      aria-label="Floor plan layout"
    >
      {/* Background */}
      <rect x="0" y="0" width={width} height={height} fill={PALETTE.fill} />

      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={PALETTE.grid} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x={padding} y={padding} width={innerW} height={innerH} fill="url(#grid)" />

      {/* Outer walls */}
      <rect
        x={padding}
        y={padding}
        width={innerW}
        height={innerH}
        fill="none"
        stroke={PALETTE.wall}
        strokeWidth="3"
        rx="2"
      />

      {/* Rooms */}
      {rooms.map((room, i) => {
        const color = getRoomColor(room.name)
        const isOutdoor = color === PALETTE.outdoor
        const fontSize = room.w < 80 || room.h < 50 ? 7 : room.w < 120 ? 8 : 9

        return (
          <g key={i}>
            {/* Room fill */}
            <rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              fill={color}
              stroke={PALETTE.wallLight}
              strokeWidth="1.5"
              strokeDasharray={isOutdoor ? '4,2' : 'none'}
            />

            {/* Room name */}
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 - (room.note ? 4 : 0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={PALETTE.text}
              fontSize={fontSize}
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              {room.name}
            </text>

            {/* Note / label */}
            {room.note && (
              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2 + fontSize + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={PALETTE.accent}
                fontSize={fontSize - 2}
                fontStyle="italic"
                fontFamily="system-ui, sans-serif"
              >
                {room.note}
              </text>
            )}
          </g>
        )
      })}

      {/* Compass rose */}
      <g transform={`translate(${width - 40}, 35)`}>
        <circle cx="0" cy="0" r="14" fill="white" stroke={PALETTE.wall} strokeWidth="1" />
        <text x="0" y="-4" textAnchor="middle" fontSize="8" fontWeight="700" fill={PALETTE.wall} fontFamily="system-ui">N</text>
        <path d="M0,-10 L2,-6 L-2,-6 Z" fill={PALETTE.wall} />
        <text x="0" y="10" textAnchor="middle" fontSize="6" fill={PALETTE.text} fontFamily="system-ui">S</text>
      </g>

      {/* Scale bar */}
      <g transform={`translate(${padding}, ${height - 12})`}>
        <line x1="0" y1="0" x2="80" y2="0" stroke={PALETTE.wall} strokeWidth="1.5" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke={PALETTE.wall} strokeWidth="1.5" />
        <line x1="80" y1="-3" x2="80" y2="3" stroke={PALETTE.wall} strokeWidth="1.5" />
        <text x="40" y="-5" textAnchor="middle" fontSize="6" fill={PALETTE.text} fontFamily="system-ui">~5m</text>
      </g>
    </svg>
  )
}

/* ──────────── Floor Plan Tab ──────────── */

const FloorPlanTab = ({ property }) => {
  const plans = FLOOR_PLANS[property.id]
  const [activeFloor, setActiveFloor] = useState(0)

  if (!plans) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream">
          <svg className="h-8 w-8 text-text/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 3v18" />
          </svg>
        </div>
        <h3 className="mt-4 font-serif text-xl font-bold text-forest">Floor Plan Coming Soon</h3>
        <p className="mt-2 max-w-sm mx-auto text-sm text-text/60">
          Detailed floor plans for {property.name} are being prepared. Contact{' '}
          {property.agent.name} for a full layout.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Floor selector */}
      {plans.length > 1 && (
        <div className="flex gap-2">
          {plans.map((plan, i) => (
            <button
              key={plan.label}
              type="button"
              onClick={() => setActiveFloor(i)}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeFloor === i
                  ? 'bg-forest text-cream'
                  : 'bg-cream text-text/70 hover:bg-forest/10 hover:text-forest'
              }`}
            >
              {plan.label}
            </button>
          ))}
        </div>
      )}

      {/* SVG Floor Plan */}
      <div className="overflow-hidden rounded-xl bg-white shadow-soft">
        <div className="p-4 sm:p-6">
          <FloorPlanSVG rooms={plans[activeFloor].rooms} />
        </div>
        <div className="border-t border-cream bg-cream/50 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">
                {plans[activeFloor].label}
              </h3>
              <p className="text-xs text-text/60">
                {plans[activeFloor].rooms.length} rooms · {property.area} m² total
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text/50">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE.living }} /> Living
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE.bedroom }} /> Bedroom
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE.bathroom }} /> Bathroom
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE.kitchen }} /> Kitchen
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PALETTE.outdoor, border: '1px dashed #999' }} /> Outdoor
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Room breakdown */}
      <div className="rounded-xl bg-white p-6 shadow-soft">
        <h3 className="font-serif text-lg font-bold text-forest">Room Summary</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans[activeFloor].rooms.map((room, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg bg-cream p-3"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ background: getRoomColor(room.name) }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-forest">{room.name}</p>
                {room.note && (
                  <p className="text-[0.65rem] text-bronze">{room.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FloorPlanTab
