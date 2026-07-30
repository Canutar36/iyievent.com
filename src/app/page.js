'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { translations } from '@/translations'
import Preloader from '@/components/Preloader'

// Dynamic imports — sadece client'a bundle edilsin
const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
const About = dynamic(() => import('@/components/About'), { ssr: false })
const Services = dynamic(() => import('@/components/Services'), { ssr: false })
const Portfolio = dynamic(() => import('@/components/Portfolio'), { ssr: false })
const Metrics = dynamic(() => import('@/components/Metrics'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const ContactForm = dynamic(() => import('@/components/ContactForm'), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false })

export default function LandingPage() {
  const [lang, setLang] = useState('tr')
  const [loaded, setLoaded] = useState(false)
  const t = translations[lang]

  return (
    <>
      <Preloader onFinish={() => setLoaded(true)} />
      <div style={{
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}>
        <Header t={t} lang={lang} setLang={setLang} />
        <main className="snap-container">
          <Hero t={t} lang={lang} />
          <About t={t} />
          <Services t={t} />
          <Portfolio t={t} />
          <Metrics lang={lang} />
          <Testimonials t={t} lang={lang} />
          <ContactForm t={t} />
        </main>
        <Footer t={t} lang={lang} />
      </div>
    </>
  )
}
