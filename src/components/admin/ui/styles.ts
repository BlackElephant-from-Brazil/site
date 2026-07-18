import type { CSSProperties } from 'react'

/**
 * Estilos inline compartilhados do dashboard admin (tema claro premium).
 * Centraliza os padrões antes duplicados em views/panels.
 */

export const inputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--input-background)',
  border: '1px solid var(--input-border)',
  borderRadius: '11px',
  padding: '0.6rem 0.8rem',
  fontSize: '0.875rem',
  color: 'var(--foreground)',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--foreground-muted)',
  marginBottom: '0.375rem',
}

export const cardStyle: CSSProperties = {
  background: 'var(--card-background)',
  border: '1px solid var(--card-border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-soft)',
}

export const tableHeadCellStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--foreground-muted)',
}

/** Cor determinística (paleta da marca) para avatares por string. */
export const AVATAR_PALETTE = ['#1F6F6B', '#E8A93C', '#123B4F', '#2f9d8f'] as const

export function avatarColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]
}
