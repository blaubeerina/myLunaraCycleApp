
import type { Theme } from './types';

// Helper function to convert hex to HSL components (string values)
function hexToHSLParts(hex: string): { h: string, s: string, l: string } | null {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  } else {
    return null; // Invalid hex
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: `${Math.round(h * 360)}`,
    s: `${Math.round(s * 100)}%`,
    l: `${Math.round(l * 100)}%`,
  };
}

function formatHSL(parts: { h: string, s: string, l: string } | null): string {
  if (!parts) return '0 0% 0%'; // Default to black if conversion fails
  return `${parts.h} ${parts.s} ${parts.l}`;
}

export const DEFAULT_THEME_ID = 'myLunaraCycleDark'; // Default theme remains dark

export const themes: Theme[] = [
  {
    id: 'myLunaraCycleLight',
    name: 'My LunaraCycle Light',
    colors: {
      background: formatHSL(hexToHSLParts('#FFFFFF')), // White
      foreground: formatHSL(hexToHSLParts('#333333')), // Dark Gray
      card: formatHSL(hexToHSLParts('#FFFFFF')),       // White
      cardForeground: formatHSL(hexToHSLParts('#333333')),
      popover: formatHSL(hexToHSLParts('#FFFFFF')),
      popoverForeground: formatHSL(hexToHSLParts('#333333')),
      primary: formatHSL(hexToHSLParts('#5C9EAD')),    // Turquoise
      primaryForeground: formatHSL(hexToHSLParts('#FFFFFF')), // White text on Turquoise
      secondary: formatHSL(hexToHSLParts('#F3F4F6')),  // Light Gray for secondary elements
      secondaryForeground: formatHSL(hexToHSLParts('#333333')),
      muted: formatHSL(hexToHSLParts('#E5E7EB')),      // Slightly darker gray for muted
      mutedForeground: formatHSL(hexToHSLParts('#6B7280')),
      accent: formatHSL(hexToHSLParts('#FFF2B2')),     // Existing Accent (Ovulation yellow)
      accentForeground: formatHSL(hexToHSLParts('#4C566A')), // Dark text on accent
      destructive: formatHSL(hexToHSLParts('#E8B4BC')),// Soft Crimson for bleeding
      destructiveForeground: formatHSL(hexToHSLParts('#FFFFFF')), // White text
      border: formatHSL(hexToHSLParts('#D1D5DB')),     // Standard border
      input: formatHSL(hexToHSLParts('#FFFFFF')),
      ring: formatHSL(hexToHSLParts('#5C9EAD')),       // Turquoise for rings
    },
    // Preview colors: Turquoise, Soft Crimson, Ovulation Yellow, White, Dark Gray
    previewColors: ['#5C9EAD', '#E8B4BC', '#FFF2B2', '#FFFFFF', '#333333'],
  },
  {
    id: 'myLunaraCycleDark', // Keep this ID as default
    name: 'My LunaraCycle Dark (Default)',
    colors: {
      background: formatHSL(hexToHSLParts('#1A1D3A')), // Dark Blue/Purple
      foreground: formatHSL(hexToHSLParts('#F5F0E8')), // Light Beige
      card: formatHSL(hexToHSLParts('#24284A')),       // Slightly lighter than background
      cardForeground: formatHSL(hexToHSLParts('#F5F0E8')),
      popover: formatHSL(hexToHSLParts('#202340')),
      popoverForeground: formatHSL(hexToHSLParts('#F5F0E8')),
      primary: formatHSL(hexToHSLParts('#5C9EAD')),    // Turquoise
      primaryForeground: formatHSL(hexToHSLParts('#F5F0E8')), // Light text on Turquoise
      secondary: formatHSL(hexToHSLParts('#303562')),  // Darker shade for secondary
      secondaryForeground: formatHSL(hexToHSLParts('#F5F0E8')),
      muted: formatHSL(hexToHSLParts('#404575')),      // Muted variant
      mutedForeground: formatHSL(hexToHSLParts('#A0A5C5')),
      accent: formatHSL(hexToHSLParts('#FFF2B2')),     // Existing Accent (Ovulation yellow)
      accentForeground: formatHSL(hexToHSLParts('#1A1D3A')), // Dark text on accent
      destructive: formatHSL(hexToHSLParts('#E8B4BC')),// Soft Crimson for bleeding
      destructiveForeground: formatHSL(hexToHSLParts('#1A1D3A')), // Dark text
      border: formatHSL(hexToHSLParts('#3A3F6A')),     // Border color
      input: formatHSL(hexToHSLParts('#202340')),       // Input background
      ring: formatHSL(hexToHSLParts('#5C9EAD')),       // Turquoise for rings
    },
     // Preview colors: Turquoise, Soft Crimson, Ovulation Yellow, Dark Blue/Purple, Light Beige
    previewColors: ['#5C9EAD', '#E8B4BC', '#FFF2B2', '#1A1D3A', '#F5F0E8'],
  },
];

export function applyThemeToDocument(themeId: string): void {
  const themeToApply = themes.find(t => t.id === themeId) || themes.find(t => t.id === DEFAULT_THEME_ID);

  if (themeToApply && document.documentElement) {
    const root = document.documentElement;

    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
    
    // Special handling for sidebar to match main theme's primary/accent etc.
    // These map to --sidebar-background, --sidebar-primary etc. in globals.css
    // For simplicity, we make sidebar colors closely related to the main theme.
    // You might want more distinct sidebar colors in a more complex theme object.
    root.style.setProperty('--sidebar-background', themeToApply.colors.card); // Example: card color for sidebar bg
    root.style.setProperty('--sidebar-foreground', themeToApply.colors.cardForeground);
    root.style.setProperty('--sidebar-primary', themeToApply.colors.primary);
    root.style.setProperty('--sidebar-primary-foreground', themeToApply.colors.primaryForeground);
    root.style.setProperty('--sidebar-accent', themeToApply.colors.accent);
    root.style.setProperty('--sidebar-accent-foreground', themeToApply.colors.accentForeground);
    root.style.setProperty('--sidebar-border', themeToApply.colors.border);
    root.style.setProperty('--sidebar-ring', themeToApply.colors.ring);


    // Add/remove .dark class based on theme.id (convention: if 'light' is not in id, it's dark)
    if (themeToApply.id.toLowerCase().includes('light')) {
        root.classList.remove('dark');
        root.classList.add('light'); // Explicitly add light class if desired
    } else {
        root.classList.add('dark');
        root.classList.remove('light');
    }
  }
}
