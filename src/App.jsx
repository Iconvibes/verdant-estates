import { BrowserRouter, Link, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import WhatsAppButton from './components/WhatsAppButton'
import CompareBar from './components/CompareBar'
import ScrollProgress from './components/ScrollProgress'
import { SavedHomesProvider } from './context/SavedHomesContext'
import { CompareProvider } from './context/CompareContext'
import { CurrencyProvider } from './context/CurrencyContext'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import SavedHomes from './pages/SavedHomes'
import About from './pages/About'
import Contact from './pages/Contact'
import Compare from './pages/Compare'
import Agents from './pages/Agents'
import RegisteredAgents from './pages/RegisteredAgents'
import AgentProfile from './pages/AgentProfile'
import Areas from './pages/Areas'
import AreaProfile from './pages/AreaProfile'
import Admin from './pages/Admin'
import AgentLogin from './pages/AgentLogin'
import AgentRegister from './pages/AgentRegister'
import AgentDashboard from './pages/AgentDashboard'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'

const NotFound = () => (
  <section className="section bg-cream">
    <div className="container-x mx-auto max-w-xl text-center">
      <h1 className="font-serif text-4xl font-bold">Page Not Found</h1>
      <p className="mt-4 text-text/70">
        The page you&rsquo;re looking for doesn&rsquo;t exist — but our listings do.
      </p>
      <Link to="/listings" className="btn-forest mt-8 inline-flex">
        Browse Listings
      </Link>
    </div>
  </section>
)

const AppContent = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname === '/agent/dashboard'

  return (
      <CurrencyProvider>
      <SavedHomesProvider>
        <CompareProvider>
          <div className={"flex flex-col bg-cream text-text " + (isAdmin ? "h-screen overflow-hidden" : "min-h-screen")}>
            {!isAdmin && (
              <>
                <a href="#main-content" className="skip-link">
                  Skip to content
                </a>
                <Navbar />
                <ScrollProgress />
                <WhatsAppButton />
              </>
            )}
          <main id="main-content" className={"flex-1" + (isAdmin ? " overflow-hidden" : "")} tabIndex="-1">
              <Routes>
                <Route element={<PageTransition />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/saved" element={<SavedHomes />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/areas" element={<Areas />} />
                  <Route path="/areas/:id" element={<AreaProfile />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/registered-agents" element={<RegisteredAgents />} />
                  <Route path="/agents/:id" element={<AgentProfile />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/admin" element={<Admin />} />
                <Route path="/agent/login" element={<AgentLogin />} />
                <Route path="/agent/register" element={<AgentRegister />} />
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
              </Routes>
            </main>
            {!isAdmin && <Footer />}
            {!isAdmin && <CompareBar />}
          </div>
        </CompareProvider>
      </SavedHomesProvider>
      </CurrencyProvider>
  )
}

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
)

export default App
