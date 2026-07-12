/**
 * UI Components - BlackElephant Design System
 */

export { Logo, BrandName } from './Logo'
export type { LogoProps, BrandNameProps } from './Logo'

export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Glass } from './Glass'
export type { GlassProps } from './Glass'

export { GlassEffect, GlassFilter } from './liquid-glass'

export { SplineScene } from './spline-scene'

// GLSLHills NÃO é reexportado aqui de propósito: puxa o three.js (~150KB) e deve
// ser carregado só via next/dynamic (ssr:false) onde é usado, para não pesar em
// qualquer bundle que importe deste barrel. Importar de '@/components/ui/glsl-hills'.
