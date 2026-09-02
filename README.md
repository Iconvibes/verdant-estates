# Verdant Estates
a real estate website
**Sustainable Luxury Real Estate in Lagos**

A premium property listing platform for Lagos's most exclusive neighbourhoods — Ikoyi, Banana Island, Lekki, Victoria Island, Eko Atlantic, and Oniru.

![Built with React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat&logo=greensock&logoColor=black)

---

## What is it?

Verdant Estates is a luxury real estate website that combines high-end design with functional property search. It features a curated portfolio of 12+ properties ranging from ₦120M to ₦3.2B, complete with neighbourhood guides, mortgage calculations, agent profiles, and a full backend API.

## Live Sections

| Page | What it does |
|------|-------------|
| **Home** | Cinematic scroll walkthrough, animated stats, featured listings, testimonials |
| **Listings** | Filterable property grid — by type, price, bedrooms, and keyword search |
| **Listing Detail** | Full property page with parallax hero, photo gallery, mortgage calculator, related homes, and recently viewed |
| **Saved Homes** | Persist your favourite properties across sessions |
| **Compare** | Side-by-side comparison of up to 3 properties — price, features, specs |
| **Areas** | Neighbourhood guides for 6 Lagos districts — walkability scores, schools, restaurants, amenities |
| **Team** | Agent profiles with bios, active listings, and direct contact forms |
| **About** | Brand story, values, testimonials |
| **Contact** | Enquiry form, office details, WhatsApp integration |

## Design Highlights

- **Parallax depth layers** — Hero images shift on scroll via GSAP ScrollTrigger
- **Animated number counters** — Stats count up on scroll entry
- **Staggered card reveals** — Property grids animate in with sequential delays
- **Blur-up image placeholders** — Smooth crossfade from blurred thumbnail to sharp image
- **Custom cursor follower** — Decorative ring + text labels that track the mouse
- **Scroll progress indicator** — Thin bronze-to-green bar at the top of the viewport
- **GSAP page transitions** — Smooth fade transitions between routes
- **Shrink-on-scroll navbar** — Glass-blur effect with size reduction after 60px scroll

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Tailwind CSS v4, GSAP + ScrollTrigger |
| Backend | Express.js, JWT auth, JSON file storage |
| Maps | Mapbox GL (code-split, lazy-loaded) |
| Build | Vite |

## Key Features

- 🔍 **Smart filtering** — URL-synced filters so search states are shareable
- 📱 **Mobile-first** — Responsive across all breakpoints with animated hamburger menu
- ♿ **Accessible** — Skip-to-content link, aria-labels, keyboard-navigable filters, focus-visible states
- 💰 **Mortgage calculator** — Nigerian bank rates, adjustable term, amortisation schedule
- 🏘️ **Neighbourhood guides** — Walkability scores, nearby schools, restaurants, and transport
- 💬 **WhatsApp integration** — Floating button with pre-filled property messages
- 📧 **Email alerts** — Subscribe to receive notifications when matching properties are listed
- 🔄 **Recently viewed** — Tracks browsing history across property pages
- ⚖️ **Property comparison** — Compare up to 3 homes side-by-side

## Pages & Routes

```
/              → Home
/listings      → All properties (filterable)
/listing/:id   → Property detail
/saved         → Saved homes
/compare       → Side-by-side comparison
/areas         → Neighbourhood guides
/areas/:id     → Individual area guide
/agents        → Team directory
/agents/:id    → Agent profile + contact
/about         → About Verdant Estates
/contact       → Contact & enquiry form
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `forest` | `#1D4235` | Primary brand — headings, buttons, navbar |
| `forest-deep` | `#0F2920` | Dark variant — gradients, hover states |
| `cream` | `#FAF6F0` | Page background, light text on dark |
| `bronze` | `#B49054` | Accent — prices, icons, CTAs, active states |
| `text` | `#3D3D3D` | Body copy |

---

*Built with care for Lagos's luxury property market.*
