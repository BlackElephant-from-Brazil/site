'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { Logo } from '@/components/ui'
import { signInWithEmail, signUpWithEmail } from '@/lib/auth/actions'

type FormMode = 'login' | 'register'

const LIME = '#39FF14'
const LIME_SOFT = 'rgba(57, 255, 20, 0.12)'
const LIME_BORDER = 'rgba(57, 255, 20, 0.3)'

const benefits = [
  'Visibilidade completa do seu projeto em tempo real',
  'Comunicação direta com quem constrói a sua solução',
  'Decisões baseadas em dados, não em suposições',
]

const formVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
}

export default function LoginContent() {
  const [mode, setMode] = useState<FormMode>('login')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      if (mode === 'login') {
        const result = await signInWithEmail(formData)
        if (result?.error) setError(result.error)
      } else {
        const result = await signUpWithEmail(formData)
        if (result?.error) setError(result.error)
        else if (result?.success) setSuccess(result.message ?? 'Cadastro realizado!')
      }
    })
  }

  const switchMode = (next: FormMode) => {
    setMode(next)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ─── Painel Esquerdo ─── */}
      <div
        className="relative hidden lg:flex lg:w-[56%] flex-col overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0b0b0b 55%, #070a07 100%)' }}
      >
        {/* Glow principal — canto superior direito */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-[640px] w-[640px] opacity-[0.14]"
          style={{ background: `radial-gradient(circle at 70% 10%, ${LIME}, transparent 58%)` }}
        />
        {/* Glow secundário — canto inferior esquerdo */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[320px] w-[320px] opacity-[0.06]"
          style={{ background: `radial-gradient(circle at 25% 90%, ${LIME}, transparent 58%)` }}
        />

        {/* Grid cyberpunk */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(57,255,20,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57,255,20,0.035) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-14">

          {/* Logo */}
          <Logo variant="full" size={38} />

          {/* Copy */}
          <div className="max-w-[500px] space-y-10">
            <div>
              <div
                className="mb-5 inline-flex items-center rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: LIME_SOFT,
                  color: LIME,
                  border: `1px solid ${LIME_BORDER}`,
                }}
              >
                Portal do Cliente
              </div>

              <h1
                className="font-bold leading-[1.08] tracking-[-0.03em]"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '3.1rem',
                  color: 'var(--foreground)',
                }}
              >
                Para quem<br />
                <span style={{ color: LIME }} className="glow-text">exige mais</span><br />
                do digital.
              </h1>

              <p
                className="mt-6 text-[1rem] leading-[1.75]"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Acompanhe cada etapa do seu projeto com clareza total.
                Nada fica oculto, nada fica sem resposta.
              </p>
            </div>

            {/* Benefícios */}
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div
                    className="mt-[3px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: LIME_SOFT, border: `1px solid ${LIME_BORDER}` }}
                  >
                    <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke={LIME}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-[0.92rem] leading-relaxed"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Citação */}
          <div className="flex items-start gap-4">
            <div
              className="mt-1 h-7 w-[2px] flex-shrink-0 rounded-full opacity-60"
              style={{ backgroundColor: LIME }}
            />
            <p
              className="text-[0.82rem] leading-relaxed"
              style={{ color: 'var(--foreground-subtle)' }}
            >
              A Black Elephant não entrega sites. Entrega resultados que você pode
              medir, acompanhar e escalar.
            </p>
          </div>

        </div>
      </div>

      {/* Divisor */}
      <div
        className="hidden lg:block w-px flex-shrink-0 self-stretch"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, var(--card-border) 20%, var(--card-border) 80%, transparent 100%)',
        }}
      />

      {/* ─── Painel Direito ─── */}
      <div
        className="flex w-full flex-col items-center justify-center px-8 py-16 lg:w-[44%]"
        style={{ background: 'var(--background-secondary)' }}
      >
        {/* Logo mobile */}
        <div className="mb-10 lg:hidden">
          <Logo variant="full" size={36} />
        </div>

        <div className="w-full max-w-[400px]">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <LoginForm
                key="login"
                error={error}
                isPending={isPending}
                onSubmit={handleSubmit}
                onSwitchMode={() => switchMode('register')}
              />
            ) : (
              <RegisterForm
                key="register"
                error={error}
                success={success}
                isPending={isPending}
                onSubmit={handleSubmit}
                onSwitchMode={() => switchMode('login')}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────────────────

interface LoginFormProps {
  error: string | null
  isPending: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onSwitchMode: () => void
}

function LoginForm({ error, isPending, onSubmit, onSwitchMode }: LoginFormProps) {
  return (
    <motion.div variants={formVariants} initial="initial" animate="animate" exit="exit">
      <div className="mb-9">
        <h2
          className="font-bold leading-tight tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', color: 'var(--foreground)' }}
        >
          Bem-vindo de volta.
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Entre com suas credenciais para acessar o painel
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label text="E-mail" />
          <input
            name="email"
            type="email"
            required
            placeholder="seu@email.com"
            autoComplete="email"
            className="auth-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label text="Senha" />
            <Link
              href="/forgot-password"
              className="text-[0.72rem] transition-colors"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Esqueceu a senha?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            autoComplete="current-password"
            className="auth-input"
          />
        </div>

        <ErrorMessage message={error} />

        <PrimaryButton isPending={isPending} label="Entrar" />
      </form>

      <SwitchModeFooter
        text="Ainda não tem acesso?"
        actionLabel="Criar uma conta"
        onAction={onSwitchMode}
      />
    </motion.div>
  )
}

interface RegisterFormProps {
  error: string | null
  success: string | null
  isPending: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onSwitchMode: () => void
}

function RegisterForm({ error, success, isPending, onSubmit, onSwitchMode }: RegisterFormProps) {
  return (
    <motion.div variants={formVariants} initial="initial" animate="animate" exit="exit">
      <div className="mb-9">
        <h2
          className="font-bold leading-tight tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', color: 'var(--foreground)' }}
        >
          Crie sua conta.
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          Acesso exclusivo para clientes Black Elephant
        </p>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border px-5 py-4"
          style={{
            borderColor: 'rgba(57,255,20,0.3)',
            backgroundColor: 'rgba(57,255,20,0.07)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: LIME }}>Cadastro realizado!</p>
          <p className="mt-1 text-[0.82rem]" style={{ color: 'var(--foreground-muted)' }}>{success}</p>
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <Label text="Nome completo" />
            <input
              name="name"
              type="text"
              required
              placeholder="Seu nome"
              autoComplete="name"
              className="auth-input"
            />
          </div>

          <div>
            <Label text="E-mail" />
            <input
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              autoComplete="email"
              className="auth-input"
            />
          </div>

          <div>
            <Label text="Senha" />
            <input
              name="password"
              type="password"
              required
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              className="auth-input"
            />
          </div>

          <ErrorMessage message={error} />

          <PrimaryButton isPending={isPending} label="Criar conta" />
        </form>
      )}

      <SwitchModeFooter
        text="Já tem uma conta?"
        actionLabel="Fazer login"
        onAction={onSwitchMode}
      />
    </motion.div>
  )
}

// ─── Primitivos ───────────────────────────────────────────

function Label({ text }: { text: string }) {
  return (
    <label
      className="block text-[0.67rem] font-semibold uppercase tracking-wider"
      style={{ color: 'var(--foreground-muted)' }}
    >
      {text}
    </label>
  )
}

function ErrorMessage({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-lg border px-4 py-3 text-[0.82rem]"
          style={{
            borderColor: 'rgba(255,51,51,0.3)',
            backgroundColor: 'rgba(255,51,51,0.08)',
            color: 'var(--color-error)',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PrimaryButton({ isPending, label }: { isPending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="relative mt-1 w-full overflow-hidden rounded-lg py-3.5 text-sm font-bold transition-all disabled:opacity-50"
      style={{
        backgroundColor: 'var(--button-primary-bg)',
        color: 'var(--button-primary-text)',
        fontFamily: 'var(--font-title)',
        boxShadow: isPending ? 'none' : 'var(--shadow-glow)',
      }}
    >
      <span className={isPending ? 'opacity-0' : 'opacity-100'}>{label}</span>
      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  )
}

function SwitchModeFooter({
  text,
  actionLabel,
  onAction,
}: {
  text: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div
      className="mt-8 border-t pt-6 text-center"
      style={{ borderColor: 'var(--card-border)' }}
    >
      <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{text}</p>
      <button
        onClick={onAction}
        className="mt-2 text-sm font-semibold underline-offset-2 hover:underline transition-colors"
        style={{ color: 'var(--primary)', fontFamily: 'var(--font-title)' }}
      >
        {actionLabel}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
