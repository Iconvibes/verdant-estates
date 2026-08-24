import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import gsap from 'gsap'
import { useSavedHomes } from '../context/SavedHomesContext'
import { CloseIcon, HeartIcon, HomeIcon, MenuIcon } from './icons'
import CurrencyToggle from './CurrencyToggle'
import NavbarDropdown from './NavbarDropdown'

const exploreItems = [
  { to: '/listings', label: 'Listings' },
  { to: '/areas', label: 'Neighbourhoods' },
  { to: '/agents', label: 'Our Team' },
]

const companyItems = [
  { to: '/about', label: 'About Us' },
  { to: '/blog', label: 'Market Insights' },
  { to: '/contact', label: 'Contact' },
]

const allLinks = [
  { to: '/', label: 'Home' },
  ...exploreItems,
  ...companyItems,
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { savedIds } = useSavedHomes()
  const savedCount = savedIds.length
  const menuRef = useRef(null)
  const menuItemsRef = useRef([])
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Auto-hide: show on scroll up, hide on scroll down
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY
          const isScrolled = currentY > 60
          setScrolled(isScrolled)

          // Always show at top
          if (currentY <= 60) {
            setHidden(false)
          }
          // Scrolling down + past threshold → hide
          else if (currentY > lastScrollY.current && currentY > 150) {
            setHidden(true)
          }
          // Scrolling up → show
          else if (currentY < lastScrollY.current) {
            setHidden(false)
          }

          lastScrollY.current = currentY
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on nav hide
  useEffect(() => {
    if (hidden) setOpen(false)
  }, [hidden])

  // Animate mobile menu open/close
  useEffect(() => {
    if (!menuRef.current) return undefined
    const items = menuItemsRef.current.filter(Boolean)

    if (open) {
      gsap.set(menuRef.current, { height: 'auto', display: 'block' })
      const fullHeight = menuRef.current.offsetHeight
      gsap.fromTo(
        menuRef.current,
        { height: 0, autoAlpha: 0 },
        { height: fullHeight, autoAlpha: 1, duration: 0.35, ease: 'power2.out' },
      )
      gsap.fromTo(
        items,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out', delay: 0.1 },
      )
    } else {
      gsap.to(menuRef.current, {
        height: 0,
        autoAlpha: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          if (menuRef.current) gsap.set(menuRef.current, { display: 'none' })
        },
      })
    }
  }, [open])

  // Close menu on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const headerClass = [
    'fixed inset-x-0 top-0 z-50 text-cream transition-all duration-300 ease-out',
    hidden ? '-translate-y-full' : 'translate-y-0',
    scrolled
      ? 'border-b border-cream/10 bg-forest/85 shadow-lg backdrop-blur-xl'
      : 'bg-forest shadow-soft',
  ].join(' ')

  const navClass = [
    'container-x flex items-center justify-between transition-all duration-300 ease-out',
    scrolled ? 'py-2.5' : 'py-4',
  ].join(' ')

  const logoSize = scrolled ? 'h-8 w-8' : 'h-10 w-10'
  const iconSize = scrolled ? 'h-4 w-4' : 'h-5 w-5'
  const textSize = scrolled ? 'text-lg' : 'text-xl'
  const heartSize = scrolled ? 'h-4 w-4' : 'h-5 w-5'
  const savedSize = scrolled ? 'h-8 w-8' : 'h-10 w-10'

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold tracking-wide transition-colors duration-200 ${
      isActive ? 'text-bronze' : 'text-cream/85 hover:text-cream'
    }`

  return (
    <>
      <header className={headerClass}>
        <nav className={navClass} aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className={`flex items-center justify-center rounded-md bg-bronze text-forest-deep transition-all duration-300 ${logoSize}`}>
              <HomeIcon className={iconSize} />
            </span>
            <span className="leading-tight">
              <span className={`block font-serif font-bold tracking-wide text-cream transition-all duration-300 ${textSize}`}>
                Verdant <span className="text-bronze">Estates</span>
              </span>
              <span className={`block text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-cream/60 transition-all duration-300 ${scrolled ? 'hidden' : 'block'}`}>
                Sustainable Luxury &middot; Lagos
              </span>
            </span>
          </Link>

          {/* Desktop nav — compact with dropdowns */}
          <div className="hidden items-center gap-5 md:flex" role="menubar">
            <NavLink to="/" className={linkClass} end role="menuitem">
              Home
            </NavLink>
            <NavbarDropdown label="Explore" items={exploreItems} />
            <NavbarDropdown label="Company" items={companyItems} />
            <CurrencyToggle />
            <Link
              to="/saved"
              aria-label={`Saved homes: ${savedCount}`}
              role="menuitem"
              className={`relative flex items-center justify-center rounded-md text-cream/85 transition-all duration-300 hover:bg-forest-deep hover:text-cream ${savedSize}`}
            >
              <HeartIcon className={heartSize} filled={savedCount > 0} />
              {savedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-bronze px-1 text-[0.65rem] font-bold leading-none text-forest-deep" aria-hidden="true">
                  {savedCount}
                </span>
              )}
            </Link>
            <Link to="/contact" className="btn-bronze !px-5 !py-2.5 text-xs" role="menuitem">
              Book a Tour
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="rounded-md p-2 text-cream hover:bg-forest-deep md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          ref={menuRef}
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation"
          className="overflow-hidden border-t border-cream/10 bg-forest px-5 pt-2 md:hidden"
          style={{ height: 0, autoAlpha: 0, display: 'none' }}
        >
          <div className="flex flex-col gap-1 pb-4">
            <div className="px-3 py-2">
              <CurrencyToggle />
            </div>
            {allLinks.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                role="menuitem"
                ref={(el) => { menuItemsRef.current[i] = el }}
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-sm font-semibold ${
                    isActive ? 'bg-forest-deep text-bronze' : 'text-cream/90 hover:bg-forest-deep'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/saved"
              onClick={() => setOpen(false)}
              role="menuitem"
              ref={(el) => { menuItemsRef.current[allLinks.length] = el }}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-md px-3 py-3 text-sm font-semibold ${
                  isActive ? 'bg-forest-deep text-bronze' : 'text-cream/90 hover:bg-forest-deep'
                }`
              }
            >
              <span>Saved Homes</span>
              {savedCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bronze px-1.5 text-[0.65rem] font-bold text-forest-deep" aria-hidden="true">
                  {savedCount}
                </span>
              )}
            </NavLink>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              role="menuitem"
              ref={(el) => { menuItemsRef.current[allLinks.length + 1] = el }}
              className="btn-bronze mt-3 w-full !py-3 text-xs"
            >
              Book a Tour
            </Link>
          </div>
        </div>
      </header>
      <div className="pt-[60px] md:pt-[72px]" aria-hidden="true" />
    </>
  )
}

export default Navbar
