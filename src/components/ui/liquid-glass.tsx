"use client";

import React from "react";

/**
 * <GlassEffect> — vidro líquido com refração real via filtro SVG (feDisplacementMap),
 * distinto da primitiva `.glass` (blur+tint simples, ver globals.css/<Glass>).
 * Requer <GlassFilter /> montado uma vez na árvore (define o filtro #glass-distortion).
 *
 *   <GlassFilter />
 *   <GlassEffect className="rounded-full" tint="rgba(255,255,255,0.4)">…</GlassEffect>
 */

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  /** Desfoque por trás do vidro, em px (a refração vem do filtro, não do blur). */
  blur?: number;
  /** Cor de tingimento do vidro (qualquer valor CSS de background). */
  tint?: string;
  /** Esconde o vidro (atributo `hidden` nativo) sem o desmontar. */
  hidden?: boolean;
}

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
  blur = 3,
  tint = "rgba(255, 255, 255, 0.25)",
  hidden,
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow: "0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  const content = (
    <div
      className={`relative overflow-hidden transition-all duration-700 ${className}`}
      style={glassStyle}
      hidden={hidden}
    >
      {/* Camada 1: desfoque + refração (distorção SVG) */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          backdropFilter: `blur(${blur}px)`,
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
      />
      {/* Camada 2: tingimento */}
      <div className="absolute inset-0 z-10 rounded-[inherit]" style={{ background: tint }} />
      {/* Camada 3: brilho especular (bordas internas) */}
      <div
        className="absolute inset-0 z-20 overflow-hidden rounded-[inherit]"
        style={{
          boxShadow:
            "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)",
        }}
      />
      <div className="relative z-30">{children}</div>
    </div>
  );

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};

/** Filtro SVG partilhado (#glass-distortion). Montar uma única vez por página. */
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.008 0.06"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="18"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
