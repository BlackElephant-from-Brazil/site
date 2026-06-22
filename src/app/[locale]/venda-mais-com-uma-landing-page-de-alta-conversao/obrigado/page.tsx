'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { reportContatoWhatsappConversion } from '@/lib/analytics/google-ads';

const COPY = {
  pt: {
    eyebrow: 'Mensagem recebida',
    title: 'A gente vai te chamar em breve.',
    text: 'Sua mensagem foi enviada com sucesso. Em poucos minutos alguém da nossa equipe vai entrar em contato para entender o que você precisa.',
    fastPath: 'Precisa de resposta rápida?',
    whatsappLabel: 'Chamar no WhatsApp agora',
    backLabel: 'Voltar para a página',
    step1: 'Você enviou a mensagem',
    step2: 'A gente analisa sua situação',
    step3: 'Entramos em contato',
  },
  en: {
    eyebrow: 'Message received',
    title: 'We will reach out shortly.',
    text: 'Your message was sent successfully. In a few minutes someone from our team will get in touch to understand what you need.',
    fastPath: 'Need a faster response?',
    whatsappLabel: 'Message us on WhatsApp now',
    backLabel: 'Back to the page',
    step1: 'You sent the message',
    step2: 'We analyze your situation',
    step3: 'We get in touch',
  },
} as const;

const WHATSAPP_URL = 'https://wa.me/5519978055531';

export default function ObrigadoPage() {
  const params = useParams();
  const locale = typeof params?.locale === 'string' && params.locale === 'pt' ? 'pt' : 'en';
  const copy = COPY[locale];
  const landingPath = `/${locale}/venda-mais-com-uma-landing-page-de-alta-conversao`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
        style={{ backgroundColor: 'rgba(57,255,20,0.07)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto w-full max-w-lg text-center"
      >
        {/* Check icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-lime)]/30 bg-[var(--color-lime)]/10"
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
            <path
              d="M8 18.5L14.5 25L28 11"
              stroke="var(--color-lime)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-lime)]"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          <span className="h-px w-6 bg-[var(--color-lime)]/50" aria-hidden />
          {copy.eyebrow}
          <span className="h-px w-6 bg-[var(--color-lime)]/50" aria-hidden />
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-4xl font-black leading-[1.06] text-white sm:text-5xl"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          {copy.title}
        </motion.h1>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-5 text-sm leading-[1.8] text-white/52 sm:text-base"
        >
          {copy.text}
        </motion.p>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-0"
        >
          {[copy.step1, copy.step2, copy.step3].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                    i === 0
                      ? 'border-[var(--color-lime)]/50 bg-[var(--color-lime)]/15 text-[var(--color-lime)]'
                      : 'border-white/10 bg-white/[0.04] text-white/30'
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`max-w-[80px] text-center text-[10px] leading-tight ${i === 0 ? 'text-[var(--color-lime)]/70' : 'text-white/30'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className="mx-2 mb-5 h-px w-8 bg-white/10" aria-hidden />
              )}
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="mx-auto mt-10 h-px w-24"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.35), transparent)' }}
          aria-hidden
        />

        {/* Fast path */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.54 }}
          className="mt-10"
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/32">
            {copy.fastPath}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={reportContatoWhatsappConversion}
              className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[var(--color-lime)] px-8 text-sm font-black text-black transition-all duration-300 hover:shadow-[0_0_32px_rgba(57,255,20,0.28)] active:scale-[0.97]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {copy.whatsappLabel}
            </a>
            <Link
              href={landingPath}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-8 text-sm font-black text-white/70 transition-all duration-300 hover:border-white/25 hover:text-white active:scale-[0.97]"
            >
              ← {copy.backLabel}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
