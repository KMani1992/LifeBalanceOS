"use client";

/**
 * Renders the LifeBalanceOS brand logo as an inline SVG.
 * Four coloured circles represent the four life pillars in balance.
 * Accessibility: the SVG carries a title for screen readers.
 */
export default function AppLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="logo-title"
      role="img"
      style={{ flexShrink: 0 }}
    >
      <title id="logo-title">LifeBalanceOS</title>
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8f4fd" />
          <stop offset="100%" stopColor="#ddeef9" />
        </radialGradient>
      </defs>

      {/* Background rounded square */}
      <rect x="0" y="0" width="40" height="40" rx="10" ry="10" fill="url(#bg-grad)" />

      {/* Career – blue (top-left) */}
      <circle cx="13" cy="13" r="6" fill="#1E88E5" opacity="0.92" />

      {/* Family – green (top-right) */}
      <circle cx="27" cy="13" r="6" fill="#43A047" opacity="0.92" />

      {/* Finance – orange (bottom-left) */}
      <circle cx="13" cy="27" r="6" fill="#FB8C00" opacity="0.92" />

      {/* Peace – purple (bottom-right) */}
      <circle cx="27" cy="27" r="6" fill="#8E24AA" opacity="0.92" />

      {/* Centre connector – white dot representing balance */}
      <circle cx="20" cy="20" r="4" fill="white" opacity="0.95" />
      <circle cx="20" cy="20" r="2" fill="#16324F" opacity="0.55" />
    </svg>
  );
}
