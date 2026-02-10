'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PortfolioItem, getCategoryLabel } from '@/data/portfolio';

interface PortfolioCardProps {
  item: PortfolioItem;
  index?: number;
  locale: string;
}

export function PortfolioCard({ item, index = 0, locale }: PortfolioCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/${locale}/portfolio/${item.slug}`} className="block">
        {/* Card Container */}
        <div 
          className="relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500"
          style={{
            backgroundColor: 'rgba(17, 17, 17, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Hover border glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(57, 255, 20, 0.3)' }} />
          
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {/* Placeholder gradient for missing images */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gray-800)] via-[var(--color-gray-900)] to-[var(--color-black)]">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[var(--color-lime)]/20 blur-2xl" />
              </div>
              {/* Icon placeholder based on category */}
              <div className="absolute inset-0 flex items-center justify-center text-[var(--color-gray-600)]">
                {item.category === 'apps' && (
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                {item.category === 'sistemas' && (
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                {item.category === 'sites' && (
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                )}
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-black)] via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span 
                className="px-3 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(57, 255, 20, 0.1)',
                  color: 'var(--color-lime)',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                }}
              >
                {getCategoryLabel(item.category)}
              </span>
            </div>

            {/* Year Badge */}
            <div className="absolute top-4 right-4">
              <span 
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'var(--foreground-muted)',
                }}
              >
                {item.year}
              </span>
            </div>

            {/* View Project Button - appears on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span 
                className="px-6 py-3 font-semibold rounded-xl transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg"
                style={{
                  backgroundColor: 'var(--color-lime)',
                  color: 'var(--color-black)',
                }}
              >
                Ver Projeto
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[var(--color-lime)] transition-colors duration-300">
              {item.title}
            </h3>
            <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              {item.shortDescription}
            </p>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {item.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-medium rounded-md"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  {tech}
                </span>
              ))}
              {item.technologies.length > 3 && (
                <span className="px-2.5 py-1 text-xs font-medium" style={{ color: 'var(--foreground-subtle)' }}>
                  +{item.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
