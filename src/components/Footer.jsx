import { Link } from 'react-router-dom'
import { ClockIcon, HomeIcon, MailIcon, MapPinIcon, PhoneIcon } from './icons'

const Footer = () => {
  return (
    <footer className="bg-forest-deep text-cream/80">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bronze text-forest-deep">
              <HomeIcon className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-bold text-cream">
              Verdant <span className="text-bronze">Estates</span>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed">
            We design and sell sustainable luxury homes in Lagos — light-filled residences
            wrapped in greenery, from Ikoyi to Eko Atlantic.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.25em] text-bronze">
            Forest Luxury · Est. 2014
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-cream">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link to="/" className="transition-colors hover:text-bronze">Home</Link></li>
            <li><Link to="/listings" className="transition-colors hover:text-bronze">All Listings</Link></li>
            <li><Link to="/areas" className="transition-colors hover:text-bronze">Neighbourhood Guides</Link></li>
            <li><Link to="/agents" className="transition-colors hover:text-bronze">Our Team</Link></li>
            <li><Link to="/about" className="transition-colors hover:text-bronze">About Us</Link></li>
            <li><Link to="/blog" className="transition-colors hover:text-bronze">Market Insights</Link></li>
            <li><Link to="/contact" className="transition-colors hover:text-bronze">Book a Tour</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-cream">Contact</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
              <span>18B Akin Adesola Street, Victoria Island, Lagos</span>
            </li>
            <li className="flex items-center gap-3">
              <PhoneIcon className="h-4 w-4 shrink-0 text-bronze" />
              <a href="tel:+2348000000000" className="hover:text-bronze">+234 800 000 0000</a>
            </li>
            <li className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 shrink-0 text-bronze" />
              <a href="mailto:hello@verdantestates.ng" className="hover:text-bronze">hello@verdantestates.ng</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-cream">Visit Us</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <ClockIcon className="h-4 w-4 shrink-0 text-bronze" />
              <span>Mon – Fri: 9:00 – 18:00</span>
            </li>
            <li className="flex items-center gap-3">
              <ClockIcon className="h-4 w-4 shrink-0 text-bronze" />
              <span>Saturday: 10:00 – 16:00</span>
            </li>
            <li className="flex items-center gap-3">
              <ClockIcon className="h-4 w-4 shrink-0 text-bronze" />
              <span>Sunday: Private viewings only</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Verdant Estates. All rights reserved.</p>
          <p>Lagos, Nigeria · Built with you in mind</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
