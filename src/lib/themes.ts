
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

// Define the default theme based on your globals.css :root
export const DEFAULT_THEME_ID = 'myLunaraCycleDark';

export const themes: Theme[] = [
  {
    id: DEFAULT_THEME_ID,
    name: 'My Lunara Cycle Dark (Default)',
    colors: { // HSL values from your globals.css
      background: '223 30% 13%',
      foreground: '248 30% 80%',
      card: '227 30% 24%',
      cardForeground: '248 30% 80%',
      popover: '227 30% 20%',
      popoverForeground: '248 30% 80%',
      primary: '270 44% 82%',
      primaryForeground: '223 30% 10%',
      secondary: '267 50% 30%',
      secondaryForeground: '267 50% 90%',
      muted: '0 0% 30%',
      mutedForeground: '0 0% 60%',
      accent: '53 100% 85%',
      accentForeground: '223 30% 10%',
      destructive: '340 66% 70%',
      destructiveForeground: '0 0% 98%',
      border: '227 30% 30%',
      input: '227 30% 18%',
      ring: '270 44% 82%',
    },
    previewColors: ['#D0B8E8', '#F4F0F9', '#483D8B', '#191D2B', '#FFF2B2'], // Soft Purple, Light Lilac, Dark Indigo, Starfield, Ovulation
  },
  // Example of an alternative theme (Dawn Grey Light - if you want to add it back)
  {
    id: 'dawnGreyLight',
    name: 'Dawn Grey Light',
    colors: {
      background: formatHSL(hexToHSLParts('#E5E9F0')), // Dawn Grey
      foreground: formatHSL(hexToHSLParts('#4C566A')), // Slate Grey
      card: formatHSL(hexToHSLParts('#E0E4EB')),
      cardForeground: formatHSL(hexToHSLParts('#4C566A')),
      popover: formatHSL(hexToHSLParts('#E5E9F0')),
      popoverForeground: formatHSL(hexToHSLParts('#4C566A')),
      primary: formatHSL(hexToHSLParts('#D0B8E8')), // Soft Purple as primary
      primaryForeground: formatHSL(hexToHSLParts('#483D8B')), // Dark Indigo text
      secondary: formatHSL(hexToHSLParts('#F4F0F9')), // Light Lilac
      secondaryForeground: formatHSL(hexToHSLParts('#483D8B')),
      muted: formatHSL(hexToHSLParts('#DADADA')),
      mutedForeground: formatHSL(hexToHSLParts('#717985')),
      accent: formatHSL(hexToHSLParts('#FFF2B2')), // Ovulation
      accentForeground: formatHSL(hexToHSLParts('#483D8B')),
      destructive: formatHSL(hexToHSLParts('#E88DA1')), // Bleeding
      destructiveForeground: formatHSL(hexToHSLParts('#FFFFFF')),
      border: formatHSL(hexToHSLParts('#D1D5DB')),
      input: formatHSL(hexToHSLParts('#FFFFFF')),
      ring: formatHSL(hexToHSLParts('#D0B8E8')),
    },
    previewColors: ['#D0B8E8', '#E5E9F0', '#4C566A', '#F4F0F9', '#FFF2B2'],
  }
];

export function applyThemeToDocument(themeId: string): void {
  const theme = themes.find(t => t.id === themeId) || themes.find(t => t.id === DEFAULT_THEME_ID);
  if (theme && document.documentElement) {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variables
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // For sidebar variables, which have a 'sidebar-' prefix in CSS but not in the theme object
    Object.entries(theme.colors).forEach(([key, value]) => {
       if (['background', 'foreground', 'primary', 'primaryForeground', 'accent', 'accentForeground', 'border', 'ring'].includes(key)) {
         const sidebarVarName = `--sidebar-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
         // Logic to derive sidebar colors if they are not explicitly defined in theme.colors.sidebar
         // For simplicity, we use main theme colors, but you could have specific sidebar colors in the theme object.
         // Example: root.style.setProperty(sidebarVarName, theme.colors.sidebar?.[key] || value);
         // For now, let's assume sidebar variables in globals.css will pick up the main theme colors or we set them specifically.
         // If your theme object has a "sidebar" sub-object for colors, use that.
         // Based on your globals.css, sidebar colors are explicitly defined, so we should set them if the theme object has them.
         // Current theme object structure doesn't have a nested `sidebar` object, it's flat.
         // The current globals.css has variables like --sidebar-background. We should map to those if the theme object intended.
         // For now, we set the main theme vars. If `globals.css` uses these for sidebar too, it works.
         // Otherwise, theme object needs a `sidebar` field or globals.css needs to reference main vars for sidebar.
       }
    });


    // Add/remove .dark class if your themes are distinctly light/dark
    // For myLunaraCycle, it's primarily dark, but if you add light themes:
    if (theme.id.toLowerCase().includes('light')) {
        root.classList.remove('dark');
    } else {
        root.classList.add('dark'); // Assuming dark themes should have .dark class
    }
  }
}
