import React from 'react';

/**
 * <Glass> — wrapper opcional para a primitiva `.glass` (ver globals.css).
 *
 * Renderiza qualquer tag/componente via `as` e repassa className + children +
 * qualquer prop extra (onClick, id, aria-*, type, href…). As props de aparência
 * (tint/alpha/blur/sat/border/radius) viram CSS custom properties inline, então
 * cada instância é configurável sem escrever CSS.
 *
 *   <Glass as="section" className="p-6">…</Glass>
 *   <Glass as="button" radius={999} blur={12} alpha={0.12}>Vidro</Glass>
 *   <Glass dark>Sobre área clara</Glass>
 *
 * ⚠️ O efeito só aparece se houver conteúdo (imagem/gradiente/cor) por trás.
 *    Não define cor de texto — isso é responsabilidade de quem usa.
 */

type GlassVarProps = {
  /** Canais RGB da cor base do vidro, ex.: "255 255 255" (default: branco). */
  tint?: string;
  /** Opacidade do tint, 0–1. */
  alpha?: number | string;
  /** Desfoque do backdrop; número é interpretado como px. */
  blur?: number | string;
  /** Saturação do backdrop; número é interpretado como %. */
  sat?: number | string;
  /** Cor da borda (valor CSS completo, ex.: "rgba(255,255,255,0.2)"). */
  border?: string;
  /** Raio da borda; número é interpretado como px. */
  radius?: number | string;
};

type GlassOwnProps<T extends React.ElementType> = GlassVarProps & {
  /** Tag ou componente a renderizar. Default: "div". */
  as?: T;
  /** Aplica o modificador `.glass--dark` (tint escuro p/ contraste sobre áreas claras). */
  dark?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type GlassProps<T extends React.ElementType = 'div'> = GlassOwnProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof GlassOwnProps<T>>;

const toLen = (v: number | string, unit: string): string =>
  typeof v === 'number' ? `${v}${unit}` : v;

export function Glass<T extends React.ElementType = 'div'>({
  as,
  dark = false,
  tint,
  alpha,
  blur,
  sat,
  border,
  radius,
  className,
  style,
  children,
  ...rest
}: GlassProps<T>) {
  const Tag = (as ?? 'div') as React.ElementType;

  // Props de aparência → CSS custom properties inline (override por instância).
  const vars: Record<string, string> = {};
  if (tint != null) vars['--glass-tint'] = tint;
  if (alpha != null) vars['--glass-alpha'] = String(alpha);
  if (blur != null) vars['--glass-blur'] = toLen(blur, 'px');
  if (sat != null) vars['--glass-sat'] = toLen(sat, '%');
  if (border != null) vars['--glass-border'] = border;
  if (radius != null) vars['--glass-radius'] = toLen(radius, 'px');

  const classes = ['glass', dark ? 'glass--dark' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  const mergedStyle = { ...vars, ...(style as React.CSSProperties) } as React.CSSProperties;

  return (
    <Tag className={classes} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
