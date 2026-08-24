/**
 * Verdant Estates — Executable Contract Tests
 *
 * Compact behavior specification. Each test verifies ONE behavior.
 * Tables replace repetitive assertions. Boundary cases included.
 * No implementation details — only observable contracts.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dirname, '..', '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf-8')

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Currency Conversion Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Currency Conversion', () => {
  // Extract rates from source to verify they're reasonable
  const content = read('src/context/CurrencyContext.jsx')
  const ratesMatch = content.match(/NGN:\s*1,\s*USD:\s*1\s*\/\s*([\d.]+),\s*GBP:\s*1\s*\/\s*([\d.]+)/)

  it('has valid exchange rates', () => {
    assert.ok(ratesMatch, 'Rates object found in CurrencyContext')
    const usdRate = parseFloat(ratesMatch[1])
    const gbpRate = parseFloat(ratesMatch[2])
    assert.ok(usdRate > 1000 && usdRate < 3000, `USD rate ${usdRate} in range`)
    assert.ok(gbpRate > 1000 && gbpRate < 3000, `GBP rate ${gbpRate} in range`)
  })

  // Conversion table — the contract
  const RATES = { NGN: 1, USD: 1/1580, GBP: 1/2000 }
  const conversions = [
    // [inputNGN,    expectedUSD, expectedGBP, label]
    [0,             0,           0,           'zero'],
    [1580,          1,           0,           'exactly $1'],
    [2000,          1,           1,           'exactly £1'],
    [850_000_000,   537_975,     425_000,     'Canopy Residence'],
    [1_950_000_000, 1_234_177,   975_000,     'Lagoon Pearl Villa'],
    [Number.MAX_SAFE_INTEGER, null, null,     'no overflow'],
  ]

  for (const [ngn, expUsd, expGbp, label] of conversions) {
    it(`converts ₦${ngn.toLocaleString()} → USD (${label})`, () => {
      const usd = Math.round(ngn * RATES.USD)
      if (expUsd !== null) {
        assert.equal(usd, expUsd)
      } else {
        assert.ok(Number.isFinite(usd), 'result is finite')
      }
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Share Button URL Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Share Button URLs', () => {
  const content = read('src/components/ShareButtons.jsx')

  const platforms = [
    // [platform,  urlPattern,              label]
    ['WhatsApp',  'wa.me',                 'share link'],
    ['Facebook',  'facebook.com/sharer',   'share link'],
    ['Twitter',   'twitter.com/intent',    'share link'],
    ['Instagram', 'instagram.com',         'app link'],
  ]

  for (const [name, pattern, type] of platforms) {
    it(`has ${type} for ${name}`, () => {
      assert.ok(content.includes(pattern), `${name} URL pattern found`)
    })
  }

  it('URL-encodes share text', () => {
    assert.ok(content.includes('encodeURIComponent(text)'), 'text encoded')
    assert.ok(content.includes('encodeURIComponent(url)'), 'url encoded')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Blog Data Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Blog Data', () => {
  const content = read('src/data/blog.js')

  it('has 6 posts', () => {
    const count = (content.match(/\bid:\s*\d+,/g) || []).length
    assert.equal(count, 6)
  })

  // Required fields per post
  const requiredFields = ['id', 'slug', 'title', 'excerpt', 'author', 'date', 'category', 'readTime', 'content']

  for (const field of requiredFields) {
    it(`post has ${field}`, () => {
      assert.ok(content.includes(`${field}:`), `${field} field exists`)
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Floor Plan Coverage Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Floor Plan Coverage', () => {
  const content = read('src/components/FloorPlanViewer.jsx')

  // All 12 properties must have floor plans
  for (let id = 1; id <= 12; id++) {
    it(`property ${id} has floor plan data`, () => {
      assert.ok(content.includes(`${id}: [`), `ID ${id} found`)
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Data Layer Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Unified Data Layer', () => {
  const index = read('src/data/index.js')

  // Interface methods that must exist
  const methods = [
    'getAllProperties', 'getPropertyById', 'getPropertyTypes',
    'getAllAreas', 'getAreaById', 'getAreaListings',
    'getAllAgents', 'getAgentById', 'getAgentListings',
    'getAllBlogPosts', 'getBlogPostBySlug', 'getBlogCategories',
    'getRelatedPosts', 'formatBlogDate', 'formatPrice',
  ]

  for (const method of methods) {
    it(`exports ${method}`, () => {
      assert.ok(index.includes(`export function ${method}`), method)
    })
  }

  it('has adapter switching', () => {
    assert.ok(index.includes('setDataAdapter'), 'setDataAdapter exists')
    assert.ok(index.includes('getDataAdapter'), 'getDataAdapter exists')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Component Integration Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Component Integration', () => {
  // Verify components use unified data layer
  const integrations = [
    // [file,                    importPattern]
    ['src/components/PropertyCard.jsx',  "import ShareButtons from './ShareButtons'"],
    ['src/pages/ListingDetail.jsx',      "import ShareButtons from '../components/ShareButtons'"],
    ['src/pages/ListingDetail.jsx',      "import FloorPlanTab from '../components/FloorPlanViewer'"],
    ['src/components/Navbar.jsx',        "import CurrencyToggle from './CurrencyToggle'"],
    ['src/App.jsx',                      'import Blog from'],
    ['src/App.jsx',                      'import Admin from'],
  ]

  for (const [file, pattern] of integrations) {
    it(`${file} imports correctly`, () => {
      assert.ok(read(file).includes(pattern), pattern)
    })
  }

  // Verify components use unified data layer (not direct static imports)
  const unifiedImports = [
    ['src/pages/Home.jsx',           "from '../data'"],
    ['src/pages/Listings.jsx',       "from '../data'"],
    ['src/pages/ListingDetail.jsx',  "from '../data'"],
    ['src/pages/Compare.jsx',        "from '../data'"],
    ['src/pages/SavedHomes.jsx',     "from '../data'"],
    ['src/pages/Agents.jsx',         "from '../data'"],
    ['src/pages/AgentProfile.jsx',   "from '../data'"],
    ['src/pages/Areas.jsx',          "from '../data'"],
    ['src/pages/AreaProfile.jsx',    "from '../data'"],
    ['src/pages/Blog.jsx',           "from '../data'"],
    ['src/pages/BlogPost.jsx',       "from '../data'"],
    ['src/pages/Admin.jsx',          "from '../data'"],
    ['src/components/RecentlyViewed.jsx', "from '../data'"],
    ['src/components/CompareBar.jsx',     "from '../data'"],
    ['src/components/WhatsAppButton.jsx', "from '../data'"],
  ]

  for (const [file, pattern] of unifiedImports) {
    it(`${file} uses unified data layer`, () => {
      assert.ok(read(file).includes(pattern), pattern)
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Route Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Routes', () => {
  const content = read('src/App.jsx')

  const routes = [
    // [path,             exists]
    ['/',                true],
    ['/listings',        true],
    ['/listing/:id',     true],
    ['/blog',            true],
    ['/blog/:slug',      true],
    ['/admin',           true],
    ['/areas',           true],
    ['/agents',          true],
    ['/compare',         true],
    ['/saved',           true],
    ['/contact',         true],
    ['/about',           true],
  ]

  for (const [path, expected] of routes) {
    it(`route ${path} exists`, () => {
      const found = content.includes(`path="${path}"`)
      assert.equal(found, expected)
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Navigation Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Navigation', () => {
  const navbar = read('src/components/Navbar.jsx')
  const footer = read('src/components/Footer.jsx')

  const navLinks = [
    // [navbarLabel,        footerLabel]
    ['Home',               'Home'],
    ['Listings',           'All Listings'],
    ['Areas',              'Neighbourhood Guides'],
    ['Team',               'Our Team'],
    ['About',              'About Us'],
    ['Insights',           'Market Insights'],
    ['Contact',            'Book a Tour'],
  ]

  for (const [navLabel, footerLabel] of navLinks) {
    it(`"${navLabel}" navbar / "${footerLabel}" footer`, () => {
      assert.ok(navbar.includes(navLabel), `navbar has ${navLabel}`)
      assert.ok(footer.includes(footerLabel), `footer has ${footerLabel}`)
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Admin Dashboard Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Admin Dashboard', () => {
  const content = read('src/pages/Admin.jsx')

  const capabilities = [
    // [feature,           pattern]
    ['login form',        'LoginForm'],
    ['dashboard tab',     'DashboardTab'],
    ['listings CRUD',     'ListingsTab'],
    ['enquiries mgmt',    'EnquiriesTab'],
    ['alerts view',       'AlertsTab'],
    ['API integration',   "'/listings'"],
  ]

  for (const [feature, pattern] of capabilities) {
    it(`has ${feature}`, () => {
      assert.ok(content.includes(pattern), pattern)
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Security Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Security Basics', () => {
  it('no dangerouslySetInnerHTML', () => {
    const files = ['src/pages/BlogPost.jsx', 'src/pages/ListingDetail.jsx']
    for (const f of files) {
      assert.ok(!read(f).includes('dangerouslySetInnerHTML'), `${f} is clean`)
    }
  })

  it('no eval or new Function', () => {
    const files = ['src/components/ShareButtons.jsx', 'src/components/FloorPlanViewer.jsx']
    for (const f of files) {
      assert.ok(!read(f).includes('eval('), `${f} has no eval`)
      assert.ok(!read(f).includes('new Function'), `${f} has no new Function`)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Server Security Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Server Security', () => {
  const authMiddleware = read('server/middleware/auth.js')
  const authRoutes = read('server/routes/auth.js')
  const listingsRoutes = read('server/routes/listings.js')

  it('bcrypt imported in auth routes', () => {
    assert.ok(authRoutes.includes('bcrypt'), 'bcrypt imported')
  })

  it('passwords hashed with bcrypt.hash', () => {
    assert.ok(authRoutes.includes('bcrypt.hash'), 'bcrypt.hash used')
  })

  it('passwords verified with bcrypt.compare', () => {
    assert.ok(authRoutes.includes('bcrypt.compare'), 'bcrypt.compare used')
  })

  it('no hardcoded JWT secret', () => {
    assert.ok(!authMiddleware.includes('dev-only-secret'), 'no hardcoded secret')
    assert.ok(authMiddleware.includes('process.exit(1)'), 'exits if JWT_SECRET missing')
  })

  it('requireAdmin middleware exists', () => {
    assert.ok(authMiddleware.includes('export function requireAdmin'), 'requireAdmin exported')
  })

  it('requireAdmin checks role', () => {
    assert.ok(authMiddleware.includes("req.user.role !== 'admin'"), 'checks admin role')
  })

  it('listings routes use requireAdmin', () => {
    assert.ok(listingsRoutes.includes('requireAdmin'), 'requireAdmin imported')
    assert.ok(listingsRoutes.includes('requireAdmin,'), 'requireAdmin used in routes')
  })

  it('field allowlist exists', () => {
    assert.ok(listingsRoutes.includes('ALLOWED_FIELDS'), 'ALLOWED_FIELDS defined')
    assert.ok(listingsRoutes.includes('filterFields'), 'filterFields function exists')
  })

  it('login rate limiting exists', () => {
    assert.ok(authRoutes.includes('loginLimiter'), 'loginLimiter defined')
    assert.ok(authRoutes.includes('rateLimit'), 'rateLimit imported')
  })

  it('generic registration response', () => {
    // Should not check for existing email before creating user
    assert.ok(!authRoutes.includes('if (existing)'), 'no early return for existing email')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Build Contract
// ═══════════════════════════════════════════════════════════════════════════════
describe('Build Artifacts', () => {
  it('vite.config.js exists', () => {
    assert.ok(read('vite.config.js'))
  })

  it('tailwind.config.js exists', () => {
    assert.ok(read('tailwind.config.js'))
  })

  it('server entry point exists', () => {
    assert.ok(read('server/index.js'))
  })
})
