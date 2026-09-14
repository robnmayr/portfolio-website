import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { useLenis } from './hooks/useLenis'
import { Header } from './components/Header/Header'
import { Footer } from './components/Footer/Footer'
import { Hero } from './components/Hero/Hero'
import { About } from './components/About/About'
import { Projects } from './components/Projects/Projects'

function AppShell() {
  const { t } = useLanguage()
  useLenis()

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t.a11y.skipToContent}
      </a>

      <Header />

      <main id="main-content">
        <Hero />
        <About />
        <Projects />
      </main>

      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </ThemeProvider>
  )
}
