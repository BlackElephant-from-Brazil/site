'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plan, formatPrice } from '@/data/plans';

interface PricingCardProps {
  plan: Plan;
  index?: number;
  locale: string;
  compact?: boolean;
}

export function PricingCard({ plan, index = 0, locale, compact = false }: PricingCardProps) {
  const isRecommended = plan.recommended;

  const getIcon = () => {
    switch (plan.icon) {
      case 'rocket':
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        );
      case 'zap':
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'crown':
        return (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.5 17L4 8l4.5 3.5L12 5l3.5 6.5L20 8l1.5 9H2.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.5 17h19v2a1 1 0 01-1 1h-17a1 1 0 01-1-1v-2z" />
          </svg>
        );
    }
  };

  const getColorClasses = () => {
    switch (plan.color) {
      case 'lime':
        return {
          border: 'border-[var(--color-lime)]/30 hover:border-[var(--color-lime)]',
          glow: 'group-hover:shadow-[0_0_40px_rgba(57,255,20,0.2)]',
          icon: 'bg-[var(--color-lime)]/10 text-[var(--color-lime)]',
          badge: 'bg-[var(--color-lime)] text-[var(--color-black)]',
          button: 'bg-[var(--color-lime)] text-[var(--color-black)] hover:bg-[var(--color-lime-light)]',
          accent: 'from-[var(--color-lime)]',
        };
      case 'blue':
        return {
          border: 'border-blue-500/30 hover:border-blue-500',
          glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]',
          icon: 'bg-blue-500/10 text-blue-400',
          badge: 'bg-blue-500 text-white',
          button: 'bg-blue-500 text-white hover:bg-blue-400',
          accent: 'from-blue-500',
        };
      case 'purple':
        return {
          border: 'border-purple-500/30 hover:border-purple-500',
          glow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]',
          icon: 'bg-purple-500/10 text-purple-400',
          badge: 'bg-purple-500 text-white',
          button: 'bg-purple-500 text-white hover:bg-purple-400',
          accent: 'from-purple-500',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`group relative ${isRecommended ? 'z-10' : ''}`}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="relative">
            {/* Decorative side elements */}
            <div 
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
              style={{ backgroundColor: 'var(--color-lime-dark, #2dd416)' }}
            />
            <div 
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
              style={{ backgroundColor: 'var(--color-lime-dark, #2dd416)' }}
            />
            {/* Main badge with hexagonal shape */}
            <span 
              className={`relative block px-6 py-2 text-xs font-bold uppercase tracking-widest shadow-lg ${compact ? "mt-[-14px]" : "mt-[-23px]"}`}
              style={{
                backgroundColor: 'var(--color-lime)',
                color: 'var(--color-black)',
                clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
              }}
            >
              ★ Recomendado
            </span>
          </div>
        </div>
      )}

      <div
        className={`relative h-full rounded-2xl border transition-all duration-500 overflow-hidden ${colors.border} ${colors.glow} ${
          isRecommended ? 'lg:scale-105' : ''
        }`}
        style={{
          backgroundColor: 'rgba(17, 17, 17, 0.6)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Subtle gradient accent top */}
        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${colors.accent} to-transparent opacity-50`} />

        <div className={`p-6 lg:p-8 ${isRecommended ? 'pt-8 lg:pt-10' : ''}`}>
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${colors.icon}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-[var(--color-gray-400)]">{plan.tagline}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6 pb-6 border-b border-[var(--color-gray-800)]">
            {plan.pricing.initial > 0 ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-[var(--color-gray-400)]">R$</span>
                  <span className="text-4xl lg:text-5xl font-bold text-white">{plan.pricing.initial}</span>
                  <span className="text-[var(--color-gray-400)]">/início</span>
                </div>
                <div className="mt-2 text-[var(--color-gray-400)]">
                  + <span className="text-white font-semibold">{formatPrice(plan.pricing.monthly)}</span>/mês
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-white">Sob Consulta</div>
            )}
            <p className="mt-2 text-xs text-[var(--color-gray-500)]">
              Cada usuário adicional: +{formatPrice(plan.pricing.additionalUserCost)}/mês
            </p>
          </div>

          {/* Description */}
          {!compact && (
            <p className="text-[var(--color-gray-400)] mb-6">
              {plan.description}
            </p>
          )}

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {(compact ? plan.features.slice(0, 5) : plan.features).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {feature.included ? (
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feature.highlight ? 'text-[var(--color-lime)]' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--color-gray-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={`text-sm ${feature.included ? (feature.highlight ? 'text-white font-medium' : 'text-[var(--color-gray-300)]') : 'text-[var(--color-gray-600)]'}`}>
                  {feature.text}
                </span>
              </li>
            ))}
            {compact && plan.features.length > 5 && (
              <li className="text-sm text-[var(--color-gray-500)] pl-8">
                + mais {plan.features.length - 5} recursos...
              </li>
            )}
          </ul>

          {/* CTA Button */}
          <Link
            href={`/${locale}/plans/${plan.slug}`}
            className={`block w-full py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${colors.button}`}
          >
            {plan.ctaText}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
