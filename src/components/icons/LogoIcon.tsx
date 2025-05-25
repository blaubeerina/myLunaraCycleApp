import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      aria-label="myLunaraCycle Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
      <path
        d="M50 15 A35 35 0 0 1 50 85 A20 20 0 0 1 50 15 Z"
        fill="hsl(var(--background))"
        opacity="0.3"
      />
      <path
        d="M50,25 A25,25 0 1 0 75,50 A25,25 0 0 0 50,25 Z M50,40 A10,10 0 1 1 40,50 A10,10 0 0 1 50,40 Z"
        fill="hsl(var(--primary-foreground))"
        opacity="0.8"
      />
    </svg>
  );
}
