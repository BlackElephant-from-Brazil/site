'use client';

import { motion } from 'framer-motion';
import { plans } from '@/data/plans';
import { PricingCard } from './PricingCard';

interface PricingGridProps {
  locale: string;
  compact?: boolean;
}

export function PricingGrid({ locale, compact = false }: PricingGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-stretch pt-6">
      {plans.map((plan, index) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          index={index}
          locale={locale}
          compact={compact}
        />
      ))}
    </div>
  );
}

// Comparison table for full pricing page
export function PricingComparison({ locale }: { locale: string }) {
  const allFeatures = [
    { name: 'Site institucional completo', category: 'site' },
    { name: 'Design responsivo personalizado', category: 'site' },
    { name: 'Otimização SEO', category: 'site' },
    { name: '5 emails profissionais', category: 'email' },
    { name: 'Webmail incluso', category: 'email' },
    { name: 'Proteção Cloudflare', category: 'security' },
    { name: 'Hospedagem premium', category: 'hosting' },
    { name: 'Domínio gratuito', category: 'hosting' },
    { name: 'Google Workspace / Microsoft 365', category: 'productivity' },
    { name: 'Drive ilimitado', category: 'productivity' },
    { name: 'Videoconferência profissional', category: 'productivity' },
    { name: 'Sistema de gestão personalizado', category: 'system' },
    { name: 'Agendamento online', category: 'system' },
    { name: 'Área de clientes', category: 'system' },
    { name: 'Automação de processos', category: 'system' },
    { name: 'Suporte via email/WhatsApp', category: 'support' },
    { name: 'Suporte prioritário', category: 'support' },
    { name: 'Suporte VIP dedicado', category: 'support' },
  ];

  const planFeatureMap: Record<string, string[]> = {
    'empresa-digital': [
      'Site institucional completo',
      'Design responsivo personalizado',
      'Otimização SEO',
      '5 emails profissionais',
      'Webmail incluso',
      'Proteção Cloudflare',
      'Hospedagem premium',
      'Domínio gratuito',
      'Suporte via email/WhatsApp',
    ],
    'empresa-digital-plus': [
      'Site institucional completo',
      'Design responsivo personalizado',
      'Otimização SEO',
      '5 emails profissionais',
      'Webmail incluso',
      'Proteção Cloudflare',
      'Hospedagem premium',
      'Domínio gratuito',
      'Google Workspace / Microsoft 365',
      'Drive ilimitado',
      'Videoconferência profissional',
      'Suporte via email/WhatsApp',
      'Suporte prioritário',
    ],
    'empresa-completa': [
      'Site institucional completo',
      'Design responsivo personalizado',
      'Otimização SEO',
      '5 emails profissionais',
      'Webmail incluso',
      'Proteção Cloudflare',
      'Hospedagem premium',
      'Domínio gratuito',
      'Google Workspace / Microsoft 365',
      'Drive ilimitado',
      'Videoconferência profissional',
      'Sistema de gestão personalizado',
      'Agendamento online',
      'Área de clientes',
      'Automação de processos',
      'Suporte via email/WhatsApp',
      'Suporte prioritário',
      'Suporte VIP dedicado',
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-[var(--color-gray-800)]">
            <th className="py-6 px-4 text-left text-[var(--color-gray-400)] font-medium">
              Recursos
            </th>
            {plans.map((plan) => (
              <th key={plan.id} className="py-6 px-4 text-center">
                <span className={`text-lg font-bold ${plan.recommended ? 'text-[var(--color-lime)]' : 'text-white'}`}>
                  {plan.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, idx) => (
            <tr
              key={idx}
              className="border-b border-[var(--color-gray-800)]/50 hover:bg-[var(--color-gray-900)]/50 transition-colors"
            >
              <td className="py-4 px-4 text-[var(--color-gray-300)]">
                {feature.name}
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="py-4 px-4 text-center">
                  {planFeatureMap[plan.slug]?.includes(feature.name) ? (
                    <svg className="w-6 h-6 mx-auto text-[var(--color-lime)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 mx-auto text-[var(--color-gray-700)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
