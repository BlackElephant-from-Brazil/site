'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageLoading />}>
      <ContactPageContent />
    </Suspense>
  )
}

function ContactPageLoading() {
  return (
    <main className="min-h-screen pt-16 lg:pt-20" style={{ backgroundColor: 'var(--background)' }}>
      <section className="py-20 lg:py-32">
        <div className="site-container">
          <div className="animate-pulse">
            <div className="h-16 w-64 bg-gray-800 rounded mb-6" />
            <div className="h-6 w-full max-w-md bg-gray-800 rounded" />
          </div>
        </div>
      </section>
    </main>
  )
}

function ContactPageContent() {
  const t = useTranslations('contact')
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'contact' | 'consultation'>('contact')
  
  // Handle tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'consultation') {
      setActiveTab('consultation')
    }
  }, [searchParams])

  return (
    <main className="min-h-screen pt-16 lg:pt-20" style={{ backgroundColor: 'var(--background)' }}>
      <section className="py-20 lg:py-32">
        <div className="site-container">
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <h1 
              className="text-4xl lg:text-6xl font-bold mb-6"
              style={{ 
                fontFamily: 'var(--font-title)',
                color: 'var(--foreground)',
              }}
            >
              {t('title')}
            </h1>
            <p 
              className="text-xl leading-relaxed"
              style={{ color: 'var(--foreground-muted)' }}
            >
              {t('description')}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-12">
            <div 
              className="inline-flex p-1.5 rounded-2xl"
              style={{ backgroundColor: 'var(--background-secondary)' }}
            >
              <button
                onClick={() => setActiveTab('contact')}
                className={cn(
                  'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                  activeTab === 'contact' 
                    ? 'shadow-lg' 
                    : 'hover:text-white'
                )}
                style={{
                  backgroundColor: activeTab === 'contact' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'contact' ? 'var(--color-black)' : 'var(--foreground-muted)',
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t('tabs.contact')}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('consultation')}
                className={cn(
                  'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                  activeTab === 'consultation' 
                    ? 'shadow-lg' 
                    : 'hover:text-white'
                )}
                style={{
                  backgroundColor: activeTab === 'consultation' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'consultation' ? 'var(--color-black)' : 'var(--foreground-muted)',
                }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('tabs.consultation')}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Forms */}
            <div className="lg:col-span-2">
              {activeTab === 'contact' ? (
                <ContactForm t={t} />
              ) : (
                <ConsultationForm t={t} />
              )}
            </div>

            {/* Contact Info */}
            <ContactInfo t={t} />
          </div>
        </div>
      </section>
    </main>
  )
}

function ContactForm({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    mensagem: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('https://black-elephant.app.n8n.cloud/webhook/blackelephant-contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ nome: '', email: '', telefone: '', empresa: '', mensagem: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h2 
        className="text-2xl font-bold mb-2"
        style={{ 
          fontFamily: 'var(--font-title)',
          color: 'var(--foreground)',
        }}
      >
        {t('contactForm.title')}
      </h2>
      <p 
        className="mb-8"
        style={{ color: 'var(--foreground-muted)' }}
      >
        {t('contactForm.subtitle')}
      </p>

      {/* Success Alert */}
      {submitStatus === 'success' && (
        <div 
          className="p-4 rounded-xl border flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            backgroundColor: 'rgba(57, 255, 20, 0.1)',
            borderColor: 'rgba(57, 255, 20, 0.3)',
          }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-lime)]/20">
            <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-lime)]">Mensagem enviada!</p>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Entraremos em contato em breve.</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {submitStatus === 'error' && (
        <div 
          className="p-4 rounded-xl border flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-400">Ops! Algo deu errado</p>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Por favor, tente novamente.</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              htmlFor="nome" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.name')}
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              htmlFor="telefone" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.phone')}
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label 
              htmlFor="empresa" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.company')}
            </label>
            <input
              id="empresa"
              name="empresa"
              type="text"
              value={formData.empresa}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="mensagem" 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            {t('form.message')}
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={6}
            required
            value={formData.mensagem}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)] resize-none"
            style={{
              backgroundColor: 'var(--input-background)',
              borderColor: 'var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-base transition-all duration-300',
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-glow'
          )}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--color-black)',
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </span>
          ) : (
            t('form.submit')
          )}
        </button>
      </form>
    </div>
  )
}

function ConsultationForm({ t }: { t: ReturnType<typeof useTranslations> }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    mensagem: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) return
    
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('https://black-elephant.app.n8n.cloud/webhook/44cf5b3c-74b9-449a-9182-bbd42e4c357b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          data: selectedDate,
          hora: selectedTime,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ nome: '', email: '', telefone: '', empresa: '', mensagem: '' })
        setSelectedDate('')
        setSelectedTime('')
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate available dates (next 30 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayOfWeek = date.getDay()
      // Exclude weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(date)
      }
    }
    return dates
  }

  const availableTimes = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    })
  }

  return (
    <div>
      <div className="mb-8">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
          style={{ 
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('consultationForm.badge')}
        </div>
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ 
            fontFamily: 'var(--font-title)',
            color: 'var(--foreground)',
          }}
        >
          {t('consultationForm.title')}
        </h2>
        <p 
          className="text-lg leading-relaxed"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {t('consultationForm.subtitle')}
        </p>
      </div>

      {/* Success Alert */}
      {submitStatus === 'success' && (
        <div 
          className="p-4 rounded-xl border flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            backgroundColor: 'rgba(57, 255, 20, 0.1)',
            borderColor: 'rgba(57, 255, 20, 0.3)',
          }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-lime)]/20">
            <svg className="w-5 h-5 text-[var(--color-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[var(--color-lime)]">Consultoria agendada!</p>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Você receberá uma confirmação em breve.</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {submitStatus === 'error' && (
        <div 
          className="p-4 rounded-xl border flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-400">Ops! Algo deu errado</p>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Por favor, tente novamente.</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              htmlFor="consultation-nome" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.name')}
            </label>
            <input
              id="consultation-nome"
              name="nome"
              type="text"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label 
              htmlFor="consultation-email" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.email')}
            </label>
            <input
              id="consultation-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              htmlFor="consultation-telefone" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.phone')}
            </label>
            <input
              id="consultation-telefone"
              name="telefone"
              type="tel"
              required
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label 
              htmlFor="consultation-empresa" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              {t('form.company')}
            </label>
            <input
              id="consultation-empresa"
              name="empresa"
              type="text"
              required
              value={formData.empresa}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            {t('consultationForm.selectDate')}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {getAvailableDates().slice(0, 10).map((date) => {
              const dateStr = date.toISOString().split('T')[0]
              const isSelected = selectedDate === dateStr
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'flex-shrink-0 px-4 py-3 rounded-xl border text-center transition-all duration-300 min-w-[100px]',
                    isSelected ? 'border-[var(--primary)]' : 'hover:border-[var(--primary)]/50'
                  )}
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-soft)' : 'var(--input-background)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--input-border)',
                    color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  <div className="text-xs opacity-70">{formatDate(date).split(',')[0]}</div>
                  <div className="font-semibold">{date.getDate()}</div>
                  <div className="text-xs opacity-70">{date.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Selector */}
        <div>
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            {t('consultationForm.selectTime')}
          </label>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {availableTimes.map((time) => {
              const isSelected = selectedTime === time
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-center transition-all duration-300',
                    isSelected ? 'border-[var(--primary)]' : 'hover:border-[var(--primary)]/50'
                  )}
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-soft)' : 'var(--input-background)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--input-border)',
                    color: isSelected ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  <span className="font-semibold">{time}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Brief Description */}
        <div>
          <label 
            htmlFor="consultation-mensagem" 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            {t('consultationForm.description')}
          </label>
          <textarea
            id="consultation-mensagem"
            name="mensagem"
            rows={4}
            placeholder={t('consultationForm.descriptionPlaceholder')}
            value={formData.mensagem}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border outline-none transition-colors focus:border-[var(--primary)] resize-none"
            style={{
              backgroundColor: 'var(--input-background)',
              borderColor: 'var(--input-border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className={cn(
            'w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-base transition-all duration-300',
            (!selectedDate || !selectedTime || isSubmitting) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-glow'
          )}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--color-black)',
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Agendando...
            </span>
          ) : (
            t('consultationForm.submit')
          )}
        </button>
      </form>
    </div>
  )
}

function ContactInfo({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="space-y-8">
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{ 
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          {t('info.addressTitle')}
        </h3>
        <p style={{ color: 'var(--foreground-muted)' }}>
          {t('info.address')}
        </p>
      </div>

      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{ 
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          {t('info.emailTitle')}
        </h3>
        <p style={{ color: 'var(--foreground-muted)' }}>
          {t('info.email')}
        </p>
      </div>

      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{ 
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          {t('info.phoneTitle')}
        </h3>
        <p style={{ color: 'var(--foreground-muted)' }}>
          {t('info.phone')}
        </p>
      </div>
    </div>
  )
}
