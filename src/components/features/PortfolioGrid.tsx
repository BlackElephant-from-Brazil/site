'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem, PortfolioCategory, getPortfolioByCategory, getAllCategories } from '@/data/portfolio';
import { PortfolioCard } from './PortfolioCard';

interface PortfolioGridProps {
  items?: PortfolioItem[];
  showFilters?: boolean;
  locale: string;
  maxItems?: number;
}

export function PortfolioGrid({
  items,
  showFilters = true,
  locale,
  maxItems,
}: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory | 'all'>('all');
  const categories = getAllCategories();

  const filteredItems = items || getPortfolioByCategory(activeCategory);
  const displayItems = maxItems ? filteredItems.slice(0, maxItems) : filteredItems;

  return (
    <div>
      {/* Category Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.value
                  ? 'text-[var(--color-black)]'
                  : 'text-[var(--color-gray-400)] hover:text-white border border-[var(--color-gray-700)] hover:border-[var(--color-gray-500)]'
              }`}
            >
              {activeCategory === category.value && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-[var(--color-lime)] rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{category.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <PortfolioCard item={item} index={index} locale={locale} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {displayItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-gray-800)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-gray-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-[var(--color-gray-400)] text-lg">
            Nenhum projeto encontrado nesta categoria.
          </p>
        </motion.div>
      )}
    </div>
  );
}
