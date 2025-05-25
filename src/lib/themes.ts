
import type { ThemeOption, ThemeColorPalette } from './types';

// Helper function to convert HEX to HSL (simplified)
// More robust conversion might be needed for edge cases or if specific HSL values are critical.
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  return `${h} ${s}% ${l}%`;
}


const midnightRitualColors: ThemeColorPalette = {
  // Conceptual Name -> Hex
  background: '#0C0C0C',      // obsidian-black
  primary: '#4B1E3E',         // gothic-plum
  accentPrimary: '#6B0F1A',   // blood-moon-red
  accentSecondary: '#C5C5C5', // silken-silver
  textPrimary: '#C5C5C5',     // silken-silver
  textSecondary: '#C5C5C5',   // silken-silver (opacity adjustments can be used)
  inputField: '#121C3D',      // nocturne-blue
  highlight: '#6B0F1A',       // blood-moon-red
  softHighlight: '#4B1E3E',   // gothic-plum

  // CSS Variable Mappings (HSL)
  cssBackground: hexToHsl('#0C0C0C'), // obsidian-black
  cssForeground: hexToHsl('#C5C5C5'), // silken-silver
  cssCard: hexToHsl('#121C3D'), // nocturne-blue
  cssCardForeground: hexToHsl('#C5C5C5'), // silken-silver
  cssPopover: hexToHsl('#1F294A'), // slightly lighter nocturne-blue for popover
  cssPopoverForeground: hexToHsl('#C5C5C5'),
  cssPrimary: hexToHsl('#4B1E3E'), // gothic-plum
  cssPrimaryForeground: hexToHsl('#C5C5C5'), // silken-silver
  cssSecondary: hexToHsl('#3E3E3E'), // smoke-grey
  cssSecondaryForeground: hexToHsl('#C5C5C5'),
  cssMuted: hexToHsl('#303030'), // darker smoke-grey
  cssMutedForeground: hexToHsl('#A0A0A0'), // slightly darker silken-silver
  cssAccent: hexToHsl('#6B0F1A'), // blood-moon-red
  cssAccentForeground: hexToHsl('#C5C5C5'),
  cssDestructive: hexToHsl('#8A0F2C'), // more intense blood-moon-red
  cssDestructiveForeground: hexToHsl('#C5C5C5'),
  cssBorder: hexToHsl('#2D2D2D'), // subtle border
  cssInput: hexToHsl('#121C3D'), // nocturne-blue (same as card for consistency here)
  cssRing: hexToHsl('#6B0F1A'),  // blood-moon-red for focus
  cssChart1: hexToHsl('#6B0F1A'),
  cssChart2: hexToHsl('#4B1E3E'),
  cssChart3: hexToHsl('#C5C5C5'),
  cssChart4: hexToHsl('#121C3D'),
  cssChart5: hexToHsl('#3E3E3E'),
  cssSidebarBackground: hexToHsl('#0A0A0A'),
  cssSidebarForeground: hexToHsl('#C5C5C5'),
  cssSidebarPrimary: hexToHsl('#4B1E3E'),
  cssSidebarPrimaryForeground: hexToHsl('#C5C5C5'),
  cssSidebarAccent: hexToHsl('#6B0F1A'),
  cssSidebarAccentForeground: hexToHsl('#C5C5C5'),
  cssSidebarBorder: hexToHsl('#2D2D2D'),
  cssSidebarRing: hexToHsl('#6B0F1A'),
  cssLunaraOvulationGlow: hexToHsl('#C5C5C5') // silken-silver
};

const lunarSkinColors: ThemeColorPalette = {
  // Conceptual Name -> Hex
  background: '#F1E6D9',      // moon-milk
  primary: '#DBA89B',         // blush-clay
  accentPrimary: '#F5D2C8',   // pale-blood-rose
  accentSecondary: '#D4D2CF', // wolf-grey
  textPrimary: '#5A4D45',     // Darker variant of ashwood-taupe for text
  textSecondary: '#B6A89A',   // ashwood-taupe
  inputField: '#EBD5C2',      // almond-skin
  highlight: '#DBA89B',       // blush-clay
  softHighlight: '#F5D2C8',   // pale-blood-rose

  // CSS Variable Mappings (HSL)
  cssBackground: hexToHsl('#F1E6D9'), // moon-milk
  cssForeground: hexToHsl('#5A4D45'), // Darker Ashwood
  cssCard: hexToHsl('#EBD5C2'), // almond-skin
  cssCardForeground: hexToHsl('#5A4D45'),
  cssPopover: hexToHsl('#F5EEE5'), // Lighter moon-milk
  cssPopoverForeground: hexToHsl('#5A4D45'),
  cssPrimary: hexToHsl('#DBA89B'), // blush-clay
  cssPrimaryForeground: hexToHsl('#F1E6D9'), // moon-milk (light text on primary)
  cssSecondary: hexToHsl('#D4D2CF'), // wolf-grey
  cssSecondaryForeground: hexToHsl('#5A4D45'),
  cssMuted: hexToHsl('#E0D9D2'), // lighter wolf-grey
  cssMutedForeground: hexToHsl('#8E8076'), // Lighter Ashwood
  cssAccent: hexToHsl('#F5D2C8'), // pale-blood-rose
  cssAccentForeground: hexToHsl('#5A4D45'),
  cssDestructive: hexToHsl('#C98073'), // Darker blush-clay for destructive
  cssDestructiveForeground: hexToHsl('#F1E6D9'),
  cssBorder: hexToHsl('#D4D2CF'), // wolf-grey
  cssInput: hexToHsl('#EBD5C2'), // almond-skin
  cssRing: hexToHsl('#DBA89B'),  // blush-clay for focus
  cssChart1: hexToHsl('#DBA89B'),
  cssChart2: hexToHsl('#F5D2C8'),
  cssChart3: hexToHsl('#B6A89A'),
  cssChart4: hexToHsl('#D4D2CF'),
  cssChart5: hexToHsl('#EBD5C2'),
  cssSidebarBackground: hexToHsl('#FAF3EB'), // Very light moon-milk
  cssSidebarForeground: hexToHsl('#5A4D45'),
  cssSidebarPrimary: hexToHsl('#DBA89B'),
  cssSidebarPrimaryForeground: hexToHsl('#F1E6D9'),
  cssSidebarAccent: hexToHsl('#F5D2C8'),
  cssSidebarAccentForeground: hexToHsl('#5A4D45'),
  cssSidebarBorder: hexToHsl('#D4D2CF'),
  cssSidebarRing: hexToHsl('#DBA89B'),
  cssLunaraOvulationGlow: hexToHsl('#F5D2C8') // pale-blood-rose
};

const fairyFieldsColors: ThemeColorPalette = {
  // Conceptual Name -> Hex
  background: '#E1DCCB',      // fairy-dust-beige
  primary: '#679267',         // forest-fern
  accentPrimary: '#F8F1AD',   // lemon-light (can be used for specific highlights)
  accentSecondary: '#E8D8EB', // butterfly-lilac
  textPrimary: '#4A4A3A',     // Darker moss-grey for text
  textSecondary: '#5A5A5A',   // moss-grey
  inputField: '#D6D9D8',      // morning-fog
  highlight: '#679267',       // forest-fern
  softHighlight: '#E8D8EB',   // butterfly-lilac

  // CSS Variable Mappings (HSL)
  cssBackground: hexToHsl('#E1DCCB'), // fairy-dust-beige
  cssForeground: hexToHsl('#4A4A3A'), // Darker moss-grey
  cssCard: hexToHsl('#D6D9D8'), // morning-fog
  cssCardForeground: hexToHsl('#4A4A3A'),
  cssPopover: hexToHsl('#E0E3E2'), // Lighter morning-fog
  cssPopoverForeground: hexToHsl('#4A4A3A'),
  cssPrimary: hexToHsl('#679267'), // forest-fern
  cssPrimaryForeground: hexToHsl('#F8F9F0'), // Very light, almost white, derived from lemon-light
  cssSecondary: hexToHsl('#E8D8EB'), // butterfly-lilac
  cssSecondaryForeground: hexToHsl('#4A4A3A'),
  cssMuted: hexToHsl('#C8CCC7'), // Lighter morning-fog for muted
  cssMutedForeground: hexToHsl('#6A6A5A'), // Lighter moss-grey
  cssAccent: hexToHsl('#A7C7A7'), // Softer forest-fern for accent
  cssAccentForeground: hexToHsl('#3A5A3A'), // Darker forest-fern text on accent
  cssDestructive: hexToHsl('#8A5050'), // Muted red-brown
  cssDestructiveForeground: hexToHsl('#F8F9F0'),
  cssBorder: hexToHsl('#C0C3C2'), // Slightly darker morning-fog
  cssInput: hexToHsl('#D6D9D8'), // morning-fog
  cssRing: hexToHsl('#679267'),  // forest-fern for focus
  cssChart1: hexToHsl('#679267'),
  cssChart2: hexToHsl('#E8D8EB'),
  cssChart3: hexToHsl('#F8F1AD'),
  cssChart4: hexToHsl('#5A5A5A'),
  cssChart5: hexToHsl('#A7C7A7'),
  cssSidebarBackground: hexToHsl('#E9E5D9'), // Lighter fairy-dust-beige
  cssSidebarForeground: hexToHsl('#4A4A3A'),
  cssSidebarPrimary: hexToHsl('#679267'),
  cssSidebarPrimaryForeground: hexToHsl('#F8F9F0'),
  cssSidebarAccent: hexToHsl('#A7C7A7'),
  cssSidebarAccentForeground: hexToHsl('#3A5A3A'),
  cssSidebarBorder: hexToHsl('#C0C3C2'),
  cssSidebarRing: hexToHsl('#679267'),
  cssLunaraOvulationGlow: hexToHsl('#F8F1AD') // lemon-light
};


export const themes: ThemeOption[] = [
  {
    id: 'midnight-ritual',
    name: 'Midnight Ritual',
    colors: midnightRitualColors,
    previewColors: ['#0C0C0C', '#4B1E3E', '#6B0F1A', '#C5C5C5', '#121C3D']
  },
  {
    id: 'lunar-skin',
    name: 'Lunar Skin',
    colors: lunarSkinColors,
    previewColors: ['#F1E6D9', '#DBA89B', '#F5D2C8', '#B6A89A', '#D4D2CF']
  },
  {
    id: 'fairy-fields',
    name: 'Fairy Fields',
    colors: fairyFieldsColors,
    previewColors: ['#E1DCCB', '#679267', '#F8F1AD', '#5A5A5A', '#E8D8EB']
  },
];

export const DEFAULT_THEME_ID = 'lunar-skin';
