'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PortfolioGrid } from '@/components/features';
import { PricingGrid } from '@/components/features';
import { getLatestPortfolioItems } from '@/data/portfolio';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedSection, AnimatedItem } from '@/components/ui/AnimatedSection';
import { FloatingElement, GlowPulse } from '@/components/ui/ParallaxContainer';
import { GradientText } from '@/components/ui/TextAnimations';

interface HomeClientProps {
  locale: string;
}

export function HomeClient({ locale }: HomeClientProps) {
  const t = useTranslations('home');
  const latestProjects = getLatestPortfolioItems(4);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <HeroSection t={t} locale={locale} />
      <StatsSection t={t} />
      <PortfolioPreviewSection t={t} locale={locale} items={latestProjects} />
      <ProcessSection t={t} />
      <PricingPreviewSection t={t} locale={locale} />
      <TestimonialsSection t={t} />
      <PartnersSection t={t} />
      <CTASection t={t} locale={locale} />
    </main>
  );
}

function HeroSection({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid */}
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                              linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Main Glow */}
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
          style={{ backgroundColor: 'var(--color-lime)' }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Orbs */}
        <FloatingElement className="absolute top-1/3 left-1/4" duration={4} distance={20} delay={0}>
          <div className="w-4 h-4 rounded-full bg-[var(--color-lime)]/30 blur-sm" />
        </FloatingElement>
        <FloatingElement className="absolute top-2/3 right-1/4" duration={5} distance={15} delay={1}>
          <div className="w-3 h-3 rounded-full bg-purple-500/30 blur-sm" />
        </FloatingElement>
        <FloatingElement className="absolute top-1/2 right-1/3" duration={6} distance={25} delay={2}>
          <div className="w-2 h-2 rounded-full bg-blue-500/30 blur-sm" />
        </FloatingElement>

        {/* Corner Gradients */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10"
          style={{
            background: 'radial-gradient(circle at top right, var(--color-lime), transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10"
          style={{
            background: 'radial-gradient(circle at bottom left, var(--color-lime), transparent 60%)',
          }}
        />
      </div>

      <div className="relative z-10 site-container py-20 lg:py-32">
        <div className="text-center">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-sm"
            style={{
              backgroundColor: 'rgba(57, 255, 20, 0.1)',
              color: 'var(--color-lime)',
              border: '1px solid rgba(57, 255, 20, 0.3)',
            }}
          >
            <motion.span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-lime)' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {t('heroTagline')}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.1] mb-8"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            Integre-se ao{' '}
            <span className="relative inline-block">
              <GradientText animate={true}>FUTURO</GradientText>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-lime)] to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto text-lg lg:text-xl mb-12 leading-relaxed"
            style={{
              color: 'var(--foreground-muted)',
              fontFamily: 'var(--font-primary)',
            }}
          >
            {t('heroDescription')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <GlowPulse duration={3}>
              <Link
                href={`/${locale}/contact?tab=consultation`}
                className="px-10 py-4 rounded-xl font-semibold text-base transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-lime)',
                  color: 'var(--color-black)',
                }}
              >
                {t('ctaPrimary')}
              </Link>
            </GlowPulse>
            <Link
              href={`/${locale}/plans`}
              className="group px-10 py-4 rounded-xl font-semibold text-base transition-all duration-300 border-2 flex items-center gap-2"
              style={{
                borderColor: 'var(--card-border)',
                color: 'var(--foreground)',
              }}
            >
              {t('ctaSecondary')}
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ x: 5 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </motion.svg>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-[var(--color-gray-600)] flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-[var(--color-lime)]"
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const endValue = value;
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(easeOutQuart * endValue);
            
            setCount(currentValue);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(endValue);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function StatsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const stats = [
    { 
      numericValue: 50,
      suffix: '+', 
      label: t('statsClients'), 
      gradient: 'from-[var(--color-lime)] to-emerald-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      numericValue: 100,
      suffix: '+', 
      label: t('statsProjects'), 
      gradient: 'from-blue-400 to-cyan-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      numericValue: 5,
      suffix: '+', 
      label: t('statsYears'), 
      gradient: 'from-purple-400 to-pink-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      numericValue: 98,
      suffix: '%', 
      label: t('statsSatisfaction'), 
      gradient: 'from-amber-400 to-orange-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
  ];

  return (
    <section
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--background-secondary) 50%, var(--background) 100%)',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-lime)]/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="site-container relative z-10">
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <AnimatedItem>
            <span className="inline-block px-5 py-2 mb-6 text-xs font-semibold uppercase tracking-widest rounded-full border border-[var(--color-lime)]/20 text-[var(--color-lime)] bg-[var(--color-lime)]/5">
              {t('ourNumbers') || 'Nossos Números'}
            </span>
          </AnimatedItem>
          <AnimatedItem>
            <h2 
              className="text-3xl lg:text-4xl font-bold"
              style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
            >
              {t('statsTitle') || 'Resultados que falam por si'}
            </h2>
          </AnimatedItem>
        </AnimatedSection>

        {/* Stats grid */}
        <AnimatedSection className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" staggerChildren={0.1}>
          {stats.map((stat, index) => (
            <AnimatedItem key={index} direction="up">
              <motion.div
                className="group relative text-center p-6 lg:p-8"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Background card with gradient border */}
                <div 
                  className="absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.1) 0%, transparent 50%)',
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-2xl border border-white/[0.05] group-hover:border-white/[0.1] transition-all duration-500"
                  style={{
                    backgroundColor: 'rgba(17, 17, 17, 0.4)',
                    backdropFilter: 'blur(10px)',
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon with gradient background */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>

                  {/* Animated number */}
                  <div
                    className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 tracking-tight"
                    style={{
                      fontFamily: 'var(--font-title)',
                      background: `linear-gradient(135deg, var(--foreground) 0%, var(--foreground-muted) 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    <AnimatedCounter value={stat.numericValue} suffix={stat.suffix} duration={2.5} />
                  </div>

                  {/* Label with decorative line */}
                  <div className="relative">
                    <div 
                      className={`mx-auto mb-3 h-0.5 w-8 rounded-full bg-gradient-to-r ${stat.gradient} opacity-50 group-hover:w-12 group-hover:opacity-100 transition-all duration-500`}
                    />
                    <div 
                      className="text-sm lg:text-base font-medium tracking-wide"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}

function PortfolioPreviewSection({
  t,
  locale,
  items,
}: {
  t: ReturnType<typeof useTranslations>;
  locale: string;
  items: ReturnType<typeof getLatestPortfolioItems>;
}) {
  return (
    <section className="py-20 lg:py-32 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-lime)]/5 to-transparent pointer-events-none" />

      <div className="site-container relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-5 py-2 mb-6 text-xs font-semibold uppercase tracking-widest rounded-full border border-[var(--color-lime)]/20 text-[var(--color-lime)] bg-[var(--color-lime)]/5">
            {t('portfolioSubtitle')}
          </span>
          <h2
            className="text-3xl lg:text-5xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            {t('portfolioTitle')}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            {t('portfolioDesc')}
          </p>
        </ScrollReveal>

        {/* Portfolio Grid */}
        <PortfolioGrid items={items} showFilters={false} locale={locale} maxItems={4} />

        {/* View All Link */}
        <ScrollReveal delay={0.4} className="text-center mt-12">
          <Link
            href={`/${locale}/portfolio`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 border-2 border-[var(--color-lime)]/50 text-[var(--color-lime)] hover:bg-[var(--color-lime)] hover:text-[var(--color-black)]"
          >
            {t('portfolioViewAll')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

function ProcessSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [activeStep, setActiveStep] = useState(0);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [mobileSelectedStep, setMobileSelectedStep] = useState(0);

  const steps = [
    { 
      number: '01', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      largeIcon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: t('process1Title'), 
      desc: t('process1Desc'),
      details: t('process1Details') || 'Realizamos uma análise completa do seu negócio, entendendo suas necessidades, desafios e objetivos. Esta etapa é fundamental para criar uma solução que realmente faça diferença.',
      duration: t('process1Duration') || '1-2 semanas',
    },
    { 
      number: '02', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      largeIcon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      title: t('process2Title'), 
      desc: t('process2Desc'),
      details: t('process2Details') || 'Criamos wireframes e protótipos interativos para visualizar a solução antes do desenvolvimento. Você participa ativamente das decisões de design.',
      duration: t('process2Duration') || '2-3 semanas',
    },
    { 
      number: '03', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      largeIcon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: t('process3Title'), 
      desc: t('process3Desc'),
      details: t('process3Details') || 'Desenvolvemos seu projeto utilizando as tecnologias mais modernas do mercado, com sprints semanais e entregas constantes para você acompanhar.',
      duration: t('process3Duration') || '4-8 semanas',
    },
    { 
      number: '04', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      largeIcon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('process4Title'), 
      desc: t('process4Desc'),
      details: t('process4Details') || 'Treinamos sua equipe para utilizar todas as funcionalidades da solução, garantindo que todos estejam preparados para extrair o máximo valor.',
      duration: t('process4Duration') || '1 semana',
    },
    { 
      number: '05', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      largeIcon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: t('process5Title'), 
      desc: t('process5Desc'),
      details: t('process5Details') || 'Oferecemos suporte contínuo e manutenção para garantir que sua solução continue funcionando perfeitamente e evoluindo com seu negócio.',
      duration: t('process5Duration') || 'Contínuo',
    },
  ];

  const openMobileModal = (index: number) => {
    setMobileSelectedStep(index);
    setMobileModalOpen(true);
  };

  return (
    <section
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, var(--background-secondary) 50%, var(--background) 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--color-lime)]/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[200px]" />
      </div>

      <div className="site-container relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center mb-16 lg:mb-20">
          <span className="inline-block px-5 py-2 mb-6 text-xs font-semibold uppercase tracking-widest rounded-full border border-[var(--color-lime)]/20 text-[var(--color-lime)] bg-[var(--color-lime)]/5">
            {t('processSubtitle')}
          </span>
          <h2
            className="text-3xl lg:text-5xl font-bold"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            {t('processTitle') || 'Nosso Processo'}
          </h2>
        </ScrollReveal>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left sidebar - Process list */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32 space-y-3">
              {steps.map((step, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${
                    activeStep === index ? 'active' : ''
                  }`}
                  style={{
                    backgroundColor: activeStep === index 
                      ? 'rgba(57, 255, 20, 0.08)' 
                      : 'rgba(17, 17, 17, 0.4)',
                    borderColor: activeStep === index 
                      ? 'rgba(57, 255, 20, 0.4)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  }}
                  whileHover={{ x: activeStep === index ? 0 : 8 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Step number */}
                    <div 
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        activeStep === index 
                          ? 'bg-[var(--color-lime)] text-black' 
                          : 'bg-white/5 text-white/50 group-hover:bg-white/10'
                      }`}
                    >
                      {step.number}
                    </div>
                    
                    {/* Title and short desc */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className={`font-semibold text-lg transition-colors duration-300 ${
                          activeStep === index ? 'text-[var(--color-lime)]' : 'text-white'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p 
                        className="text-sm mt-1 line-clamp-1 transition-colors duration-300"
                        style={{ color: activeStep === index ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}
                      >
                        {step.desc}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <motion.div
                      className={`flex-shrink-0 transition-colors duration-300 ${
                        activeStep === index ? 'text-[var(--color-lime)]' : 'text-white/20'
                      }`}
                      animate={{ x: activeStep === index ? 0 : -5, opacity: activeStep === index ? 1 : 0.3 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right side - Process details */}
          <div className="lg:col-span-7 xl:col-span-8">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-3xl border overflow-hidden"
              style={{
                backgroundColor: 'rgba(17, 17, 17, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Gradient accent top */}
              <div className="h-1 bg-gradient-to-r from-[var(--color-lime)] via-emerald-400 to-teal-400" />
              
              <div className="p-8 lg:p-12">
                {/* Header with icon and number */}
                <div className="flex items-start gap-6 mb-8">
                  <div 
                    className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.05) 100%)',
                      border: '1px solid rgba(57, 255, 20, 0.2)',
                    }}
                  >
                    <div className="text-[var(--color-lime)]">
                      {steps[activeStep].largeIcon}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span 
                        className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: 'rgba(57, 255, 20, 0.15)',
                          color: 'var(--color-lime)',
                        }}
                      >
                        Etapa {steps[activeStep].number}
                      </span>
                      <span 
                        className="text-sm px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        ⏱ {steps[activeStep].duration}
                      </span>
                    </div>
                    <h3 
                      className="text-3xl lg:text-4xl font-bold"
                      style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
                    >
                      {steps[activeStep].title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p 
                  className="text-lg leading-relaxed mb-8"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {steps[activeStep].details}
                </p>

                {/* Decorative elements */}
                <div className="flex items-center gap-4 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-lime)]" />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {t('processDelivery') || 'Entrega garantida'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-lime)]" />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {t('processSupport') || 'Suporte dedicado'}
                    </span>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mt-8 flex items-center gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === activeStep 
                          ? 'w-8 bg-[var(--color-lime)]' 
                          : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Layout - Vertical list */}
        <div className="lg:hidden space-y-4">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.button
                onClick={() => openMobileModal(index)}
                className="w-full text-left p-5 rounded-2xl border transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(17, 17, 17, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.05) 100%)',
                    }}
                  >
                    <div className="text-[var(--color-lime)]">
                      {step.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[var(--color-lime)]">{step.number}</span>
                    </div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm mt-1 text-white/50 line-clamp-1">{step.desc}</p>
                  </div>
                  <div className="flex-shrink-0 text-white/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            </ScrollReveal>
          ))}
        </div>

        {/* Mobile Modal */}
        {mobileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:hidden"
            onClick={() => setMobileModalOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            {/* Modal content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-3xl"
              style={{
                backgroundColor: 'var(--background-secondary)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="sticky top-0 flex justify-center py-3 bg-inherit">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Gradient accent */}
              <div className="h-1 bg-gradient-to-r from-[var(--color-lime)] via-emerald-400 to-teal-400" />

              <div className="p-6 pb-10">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div 
                    className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.2) 0%, rgba(57, 255, 20, 0.05) 100%)',
                    }}
                  >
                    <div className="text-[var(--color-lime)]">
                      {steps[mobileSelectedStep].largeIcon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: 'rgba(57, 255, 20, 0.15)',
                          color: 'var(--color-lime)',
                        }}
                      >
                        Etapa {steps[mobileSelectedStep].number}
                      </span>
                      <span 
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        ⏱ {steps[mobileSelectedStep].duration}
                      </span>
                    </div>
                    <h3 
                      className="text-2xl font-bold"
                      style={{ fontFamily: 'var(--font-title)', color: 'var(--foreground)' }}
                    >
                      {steps[mobileSelectedStep].title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p 
                  className="text-base leading-relaxed mb-6"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {steps[mobileSelectedStep].details}
                </p>

                {/* Close button */}
                <button
                  onClick={() => setMobileModalOpen(false)}
                  className="w-full py-4 rounded-xl font-semibold transition-colors duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                  }}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function PricingPreviewSection({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <section className="py-20 lg:py-32 relative">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-1/2 h-1/2 bg-[var(--color-lime)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="site-container relative z-10">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-5 py-2 mb-6 text-xs font-semibold uppercase tracking-widest rounded-full border border-[var(--color-lime)]/20 text-[var(--color-lime)] bg-[var(--color-lime)]/5">
            {t('pricingSubtitle')}
          </span>
          <h2
            className="text-3xl lg:text-5xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            Planos <span className="text-[var(--color-lime)]">& Preços</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            {t('pricingDesc')}
          </p>
        </ScrollReveal>

        {/* Pricing Grid */}
        <PricingGrid locale={locale} compact={true} />

        {/* Additional info */}
        <ScrollReveal delay={0.4} className="text-center mt-12">
          <p className="text-[var(--color-gray-500)] mb-4">
            {t('pricingNote')}
          </p>
          <Link
            href={`/${locale}/plans`}
            className="inline-flex items-center gap-2 text-[var(--color-lime)] font-semibold hover:underline"
          >
            {t('pricingCompare')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

function TestimonialsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const testimonials = [
    {
      quote: t('testimonial1Quote'),
      author: t('testimonial1Author'),
      role: t('testimonial1Role'),
    },
    {
      quote: t('testimonial2Quote'),
      author: t('testimonial2Author'),
      role: t('testimonial2Role'),
    },
    {
      quote: t('testimonial3Quote'),
      author: t('testimonial3Author'),
      role: t('testimonial3Role'),
    },
    {
      quote: t('testimonial4Quote'),
      author: t('testimonial4Author'),
      role: t('testimonial4Role'),
    },
  ];

  return (
    <section
      className="py-20 lg:py-32 border-y"
      style={{
        backgroundColor: 'var(--background-secondary)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="site-container">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-5 py-2 mb-6 text-xs font-semibold uppercase tracking-widest rounded-full border border-[var(--color-lime)]/20 text-[var(--color-lime)] bg-[var(--color-lime)]/5">
            {t('testimonialsSubtitle')}
          </span>
          <h2
            className="text-3xl lg:text-5xl font-bold"
            style={{
              fontFamily: 'var(--font-title)',
              color: 'var(--foreground)',
            }}
          >
            Depoimentos
          </h2>
        </ScrollReveal>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div
                className="p-8 rounded-2xl h-full backdrop-blur-xl border transition-all duration-500"
                style={{
                  backgroundColor: 'rgba(17, 17, 17, 0.6)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
                whileHover={{
                  borderColor: 'rgba(57, 255, 20, 0.3)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Quote icon */}
                <svg className="w-10 h-10 mb-6 text-[var(--color-lime)]/30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-lg text-white/90 mb-6 leading-relaxed">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
                    style={{ 
                      backgroundColor: 'rgba(57, 255, 20, 0.1)',
                      color: 'var(--color-lime)',
                    }}
                  >
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnersSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const partners = ['NEXU', 'ORBIT', 'VETTRA', 'SYNAPSE'];

  return (
    <section className="py-16 lg:py-24">
      <div className="site-container">
        <ScrollReveal className="text-center">
          <p className="text-[var(--color-gray-500)] mb-4">{t('partnersSubtitle')}</p>
          <h3 className="text-3xl lg:text-4xl font-bold text-[var(--color-lime)] mb-8">
            HUB INOVA
          </h3>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {partners.map((partner, index) => (
              <motion.span
                key={index}
                className="text-2xl font-bold text-[var(--color-gray-600)] hover:text-[var(--color-gray-400)] transition-colors cursor-default"
                whileHover={{ scale: 1.1 }}
              >
                {partner}
              </motion.span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function CTASection({ t, locale }: { t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <section className="py-20 lg:py-32">
      <div className="site-container">
        <ScrollReveal>
          <div
            className="relative rounded-3xl p-8 lg:p-16 overflow-hidden backdrop-blur-xl border"
            style={{ 
              backgroundColor: 'rgba(17, 17, 17, 0.6)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Animated background decorations */}
            <motion.div
              className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]"
              style={{ backgroundColor: 'var(--color-lime)' }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10"
              style={{ backgroundColor: 'purple' }}
              animate={{
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative z-10 text-center">
              <h2
                className="text-3xl lg:text-5xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'var(--foreground)',
                }}
              >
                {t('ctaTitle')}
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto mb-10"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {t('ctaDescription')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/${locale}/contact?tab=consultation`}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:scale-105"
                  style={{
                    backgroundColor: 'var(--color-lime)',
                    color: 'var(--color-black)',
                  }}
                >
                  {t('ctaPrimary')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="https://wa.me/5519978055531"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'var(--foreground)',
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
