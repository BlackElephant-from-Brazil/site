'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { PortfolioImage } from '@/data/portfolio';

interface ImageGalleryProps {
  images: PortfolioImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const lightboxSlides = images.map((img) => ({
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openLightbox(index)}
            className={`group relative overflow-hidden rounded-xl bg-[var(--color-gray-900)] border border-[var(--color-gray-800)] transition-all duration-300 hover:border-[var(--color-lime)]/50 ${
              index === 0 ? 'md:col-span-2' : ''
            }`}
          >
            {/* Aspect ratio container */}
            <div className={`relative ${index === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
              {/* Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gray-800)] via-[var(--color-gray-900)] to-[var(--color-black)]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-[var(--color-gray-600)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-[var(--color-gray-600)]">{image.alt}</span>
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[var(--color-black)]/0 group-hover:bg-[var(--color-black)]/40 transition-colors duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-[var(--color-lime)] flex items-center justify-center">
                    <svg className="w-6 h-6 text-[var(--color-black)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Image label */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-black)] to-transparent">
              <span className="text-sm text-white/80">{image.alt}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
        }}
        carousel={{ finite: images.length <= 3 }}
        controller={{ closeOnBackdropClick: true }}
      />
    </>
  );
}
