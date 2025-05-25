
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
  background: '#0B1C3A',      // Moonshadow Blue (used as primary bg)
  primary: '#4B014E',         // Eclipse Violet (used for primary actions)
  accentPrimary: '#D1B679',   // Golden Smoke (used for accents)
  accentSecondary: '#C7CCD1', // Lunar Silver (used for text)
  textPrimary: '#C7CCD1',     // Lunar Silver
  textSecondary: '#BFA3B8',   // Mystic Rose
  inputField: '#121C3D',      // Nocturne Blue (was Ashen Lilac) - for cards/inputs
  highlight: '#5D3754',       // Velvet Plum
  softHighlight: '#BFA3B8',    // Mystic Rose

  cssBackground: hexToHsl('#0B1C3A'), // Moonshadow Blue
  cssForeground: hexToHsl('#C7CCD1'), // Lunar Silver
  cssCard: hexToHsl('#121C3D'), // Nocturne Blue
  cssCardForeground: hexToHsl('#C7CCD1'),
  cssPopover: hexToHsl('#1F294A'), // Lighter Nocturne Blue
  cssPopoverForeground: hexToHsl('#C7CCD1'),
  cssPrimary: hexToHsl('#4B014E'), // Eclipse Violet
  cssPrimaryForeground: hexToHsl('#C7CCD1'),
  cssSecondary: hexToHsl('#5D3754'), // Velvet Plum for secondary buttons/elements
  cssSecondaryForeground: hexToHsl('#C7CCD1'),
  cssMuted: hexToHsl('#303030'), // Darker shade for muted bg elements
  cssMutedForeground: hexToHsl('#BFA3B8'), // Mystic Rose for muted text
  cssAccent: hexToHsl('#D1B679'), // Golden Smoke
  cssAccentForeground: hexToHsl('#0B1C3A'), // Moonshadow Blue text on gold accents
  cssDestructive: hexToHsl('#8A0F2C'), // A darker red for destructive
  cssDestructiveForeground: hexToHsl('#C7CCD1'),
  cssBorder: hexToHsl('#5D3754'), // Velvet Plum as border
  cssInput: hexToHsl('#1F294A'), // Lighter Nocturne Blue for inputs
  cssRing: hexToHsl('#D1B679'),  // Golden Smoke for focus
  cssChart1: hexToHsl('#D1B679'),
  cssChart2: hexToHsl('#4B014E'),
  cssChart3: hexToHsl('#C7CCD1'),
  cssChart4: hexToHsl('#BFA3B8'),
  cssChart5: hexToHsl('#5D3754'),
  cssSidebarBackground: hexToHsl('#0A0A0A'), // Slightly darker than main bg
  cssSidebarForeground: hexToHsl('#C7CCD1'),
  cssSidebarPrimary: hexToHsl('#4B014E'),
  cssSidebarPrimaryForeground: hexToHsl('#C7CCD1'),
  cssSidebarAccent: hexToHsl('#D1B679'),
  cssSidebarAccentForeground: hexToHsl('#0B1C3A'),
  cssSidebarBorder: hexToHsl('#5D3754'),
  cssSidebarRing: hexToHsl('#D1B679'),
  cssLunaraOvulationGlow: hexToHsl('#D1B679'), // Golden Smoke
  cssLunaraPregnancyGrowth: hexToHsl('#C7CCD1') // Lunar Silver
};

const lunarSkinColors: ThemeColorPalette = {
  background: '#F4F0F9',      // light-lilac (was #F1E6D9 moon-milk)
  primary: '#D0B8E8',         // lavender (was #DBA89B blush-clay)
  accentPrimary: '#483D8B',   // plum (was #F5D2C8 pale-blood-rose)
  accentSecondary: '#CED4DA', // mist-grey (was #D4D2CF wolf-grey)
  textPrimary: '#483D8B',     // plum (was #5A4D45 Darker ashwood-taupe)
  textSecondary: '#62616D',   // muted plum (was #B6A89A ashwood-taupe)
  inputField: '#FFFFFF',      // white (was #EBD5C2 almond-skin)
  highlight: '#D0B8E8',       // lavender
  softHighlight: '#F4F0F9',   // light-lilac

  cssBackground: hexToHsl('#F4F0F9'),
  cssForeground: hexToHsl('#483D8B'),
  cssCard: hexToHsl('#FFFFFF'),
  cssCardForeground: hexToHsl('#483D8B'),
  cssPopover: hexToHsl('#E8EBF0'), // cloud-blush as popover
  cssPopoverForeground: hexToHsl('#483D8B'),
  cssPrimary: hexToHsl('#D0B8E8'),
  cssPrimaryForeground: hexToHsl('#483D8B'), // Plum text on lavender buttons
  cssSecondary: hexToHsl('#E8EBF0'), // cloud-blush
  cssSecondaryForeground: hexToHsl('#483D8B'),
  cssMuted: hexToHsl('#CED4DA'), // mist-grey
  cssMutedForeground: hexToHsl('#62616D'),
  cssAccent: hexToHsl('#483D8B'), // plum
  cssAccentForeground: hexToHsl('#FFFFFF'), // white text on plum accents
  cssDestructive: hexToHsl('#E88DA1'), // bleeding-days-red
  cssDestructiveForeground: hexToHsl('#FFFFFF'),
  cssBorder: hexToHsl('#CED4DA'), // mist-grey
  cssInput: hexToHsl('#FFFFFF'),
  cssRing: hexToHsl('#483D8B'),  // plum for focus
  cssChart1: hexToHsl('#D0B8E8'),
  cssChart2: hexToHsl('#483D8B'),
  cssChart3: hexToHsl('#FFF7D6'), // hellgelb
  cssChart4: hexToHsl('#D5F8D5'), // hellgrün
  cssChart5: hexToHsl('#B4B4B4'), // grau
  cssSidebarBackground: hexToHsl('#F8F6FC'), // Lighter light-lilac
  cssSidebarForeground: hexToHsl('#483D8B'),
  cssSidebarPrimary: hexToHsl('#D0B8E8'),
  cssSidebarPrimaryForeground: hexToHsl('#483D8B'),
  cssSidebarAccent: hexToHsl('#483D8B'),
  cssSidebarAccentForeground: hexToHsl('#FFFFFF'),
  cssSidebarBorder: hexToHsl('#CED4DA'),
  cssSidebarRing: hexToHsl('#483D8B'),
  cssLunaraOvulationGlow: hexToHsl('#FFF7D6'), // Hellgelb
  cssLunaraPregnancyGrowth: hexToHsl('#D5F8D5') // Hellgrün
};

const fairyFieldsColors: ThemeColorPalette = {
  background: '#E1DCCB',      // fairy-dust-beige
  primary: '#679267',         // forest-fern
  accentPrimary: '#F8F1AD',   // lemon-light (can be used for specific highlights)
  accentSecondary: '#E8D8EB', // butterfly-lilac
  textPrimary: '#4A4A3A',     // Darker moss-grey for text
  textSecondary: '#5A5A5A',   // moss-grey
  inputField: '#D6D9D8',      // morning-fog
  highlight: '#679267',       // forest-fern
  softHighlight: '#E8D8EB',   // butterfly-lilac

  cssBackground: hexToHsl('#E1DCCB'),
  cssForeground: hexToHsl('#4A4A3A'),
  cssCard: hexToHsl('#D6D9D8'),
  cssCardForeground: hexToHsl('#4A4A3A'),
  cssPopover: hexToHsl('#E0E3E2'),
  cssPopoverForeground: hexToHsl('#4A4A3A'),
  cssPrimary: hexToHsl('#679267'),
  cssPrimaryForeground: hexToHsl('#F8F9F0'),
  cssSecondary: hexToHsl('#E8D8EB'),
  cssSecondaryForeground: hexToHsl('#4A4A3A'),
  cssMuted: hexToHsl('#C8CCC7'),
  cssMutedForeground: hexToHsl('#6A6A5A'),
  cssAccent: hexToHsl('#A7C7A7'),
  cssAccentForeground: hexToHsl('#3A5A3A'),
  cssDestructive: hexToHsl('#8A5050'),
  cssDestructiveForeground: hexToHsl('#F8F9F0'),
  cssBorder: hexToHsl('#C0C3C2'),
  cssInput: hexToHsl('#D6D9D8'),
  cssRing: hexToHsl('#679267'),
  cssChart1: hexToHsl('#679267'),
  cssChart2: hexToHsl('#E8D8EB'),
  cssChart3: hexToHsl('#F8F1AD'),
  cssChart4: hexToHsl('#5A5A5A'),
  cssChart5: hexToHsl('#A7C7A7'),
  cssSidebarBackground: hexToHsl('#E9E5D9'),
  cssSidebarForeground: hexToHsl('#4A4A3A'),
  cssSidebarPrimary: hexToHsl('#679267'),
  cssSidebarPrimaryForeground: hexToHsl('#F8F9F0'),
  cssSidebarAccent: hexToHsl('#A7C7A7'),
  cssSidebarAccentForeground: hexToHsl('#3A5A3A'),
  cssSidebarBorder: hexToHsl('#C0C3C2'),
  cssSidebarRing: hexToHsl('#679267'),
  cssLunaraOvulationGlow: hexToHsl('#F8F1AD'),
  cssLunaraPregnancyGrowth: hexToHsl('#A7C7A7') // Softer forest-fern for pregnancy
};

const coolSummerColors: ThemeColorPalette = {
  background: '#E8EBF0',      // cloud-blush
  primary: '#C4C3E3',         // cool-lavender
  accentPrimary: '#F2C6D0',   // soft-rose
  accentSecondary: '#A9C1D9', // blue-haze
  textPrimary: '#566B83',     // Darker blue-haze for text
  textSecondary: '#899AAE',   // Lighter blue-haze for secondary text
  inputField: '#FFFFFF',      // white
  highlight: '#F2C6D0',       // soft-rose
  softHighlight: '#F6D3C9',    // cool-peach

  cssBackground: hexToHsl('#E8EBF0'), // cloud-blush
  cssForeground: hexToHsl('#566B83'), // Darker blue-haze
  cssCard: hexToHsl('#FFFFFF'), // white
  cssCardForeground: hexToHsl('#566B83'),
  cssPopover: hexToHsl('#F0F3F7'), // Lighter cloud-blush
  cssPopoverForeground: hexToHsl('#566B83'),
  cssPrimary: hexToHsl('#C4C3E3'), // cool-lavender
  cssPrimaryForeground: hexToHsl('#566B83'), // Darker blue-haze on lavender
  cssSecondary: hexToHsl('#A9C1D9'), // blue-haze
  cssSecondaryForeground: hexToHsl('#FFFFFF'), // White text on blue-haze
  cssMuted: hexToHsl('#CED4DA'), // mist-grey
  cssMutedForeground: hexToHsl('#899AAE'), // Lighter blue-haze
  cssAccent: hexToHsl('#F2C6D0'), // soft-rose
  cssAccentForeground: hexToHsl('#566B83'), // Darker blue-haze on soft-rose
  cssDestructive: hexToHsl('#E5A8B6'), // Darker soft-rose
  cssDestructiveForeground: hexToHsl('#FFFFFF'),
  cssBorder: hexToHsl('#CED4DA'), // mist-grey
  cssInput: hexToHsl('#FFFFFF'), // white
  cssRing: hexToHsl('#C4C3E3'),  // cool-lavender for focus
  cssChart1: hexToHsl('#C4C3E3'),
  cssChart2: hexToHsl('#A9C1D9'),
  cssChart3: hexToHsl('#F2C6D0'),
  cssChart4: hexToHsl('#F6D3C9'),
  cssChart5: hexToHsl('#CED4DA'),
  cssSidebarBackground: hexToHsl('#FDFEFF'), // Very light cloud-blush
  cssSidebarForeground: hexToHsl('#566B83'),
  cssSidebarPrimary: hexToHsl('#C4C3E3'),
  cssSidebarPrimaryForeground: hexToHsl('#566B83'),
  cssSidebarAccent: hexToHsl('#F2C6D0'),
  cssSidebarAccentForeground: hexToHsl('#566B83'),
  cssSidebarBorder: hexToHsl('#CED4DA'),
  cssSidebarRing: hexToHsl('#C4C3E3'),
  cssLunaraOvulationGlow: hexToHsl('#F6D3C9'), // cool-peach
  cssLunaraPregnancyGrowth: hexToHsl('#A9C1D9') // blue-haze
};

const warmAutumnColors: ThemeColorPalette = {
  background: '#3D2B22',      // Dark acorn-brown variation for background
  primary: '#C4623F',         // burnt-sienna
  accentPrimary: '#F3C969',   // harvest-gold
  accentSecondary: '#847E5D', // moss-green
  textPrimary: '#EAE0D5',     // Light creamy color for text
  textSecondary: '#B8AFA5',   // Muted creamy color
  inputField: '#5C4033',      // acorn-brown
  highlight: '#D99058',       // spice-orange
  softHighlight: '#8A3B12',    // rust-red

  cssBackground: hexToHsl('#3D2B22'),
  cssForeground: hexToHsl('#EAE0D5'),
  cssCard: hexToHsl('#5C4033'), // acorn-brown
  cssCardForeground: hexToHsl('#EAE0D5'),
  cssPopover: hexToHsl('#6B4F43'), // Lighter acorn-brown
  cssPopoverForeground: hexToHsl('#EAE0D5'),
  cssPrimary: hexToHsl('#C4623F'), // burnt-sienna
  cssPrimaryForeground: hexToHsl('#FFFFFF'), // White text on sienna
  cssSecondary: hexToHsl('#847E5D'), // moss-green
  cssSecondaryForeground: hexToHsl('#FFFFFF'), // White text on moss-green
  cssMuted: hexToHsl('#4A362D'), // Darker background shade
  cssMutedForeground: hexToHsl('#B8AFA5'),
  cssAccent: hexToHsl('#F3C969'), // harvest-gold
  cssAccentForeground: hexToHsl('#3D2B22'), // Dark text on gold
  cssDestructive: hexToHsl('#8A3B12'), // rust-red
  cssDestructiveForeground: hexToHsl('#EAE0D5'),
  cssBorder: hexToHsl('#847E5D'), // moss-green for borders
  cssInput: hexToHsl('#6B4F43'), // Lighter acorn-brown for inputs
  cssRing: hexToHsl('#F3C969'),  // harvest-gold for focus
  cssChart1: hexToHsl('#C4623F'),
  cssChart2: hexToHsl('#D99058'),
  cssChart3: hexToHsl('#F3C969'),
  cssChart4: hexToHsl('#847E5D'),
  cssChart5: hexToHsl('#8A3B12'),
  cssSidebarBackground: hexToHsl('#2E1F16'), // Even darker brown
  cssSidebarForeground: hexToHsl('#EAE0D5'),
  cssSidebarPrimary: hexToHsl('#C4623F'),
  cssSidebarPrimaryForeground: hexToHsl('#FFFFFF'),
  cssSidebarAccent: hexToHsl('#F3C969'),
  cssSidebarAccentForeground: hexToHsl('#3D2B22'),
  cssSidebarBorder: hexToHsl('#847E5D'),
  cssSidebarRing: hexToHsl('#F3C969'),
  cssLunaraOvulationGlow: hexToHsl('#F3C969'), // harvest-gold
  cssLunaraPregnancyGrowth: hexToHsl('#847E5D') // moss-green
};

const warmWinterColors: ThemeColorPalette = {
  background: '#2E2E2E',      // deep-charcoal
  primary: '#A71D31',         // cranberry-red
  accentPrimary: '#F6F2EC',   // glacier-cream (for highlights on dark bg)
  accentSecondary: '#811F3F', // garnet-glow
  textPrimary: '#F6F2EC',     // glacier-cream
  textSecondary: '#EEDDE2',   // frosted-rose
  inputField: '#404040',      // Lighter charcoal for inputs/cards
  highlight: '#A71D31',       // cranberry-red
  softHighlight: '#811F3F',    // garnet-glow

  cssBackground: hexToHsl('#2E2E2E'), // deep-charcoal
  cssForeground: hexToHsl('#F6F2EC'), // glacier-cream
  cssCard: hexToHsl('#404040'), // Lighter charcoal
  cssCardForeground: hexToHsl('#F6F2EC'),
  cssPopover: hexToHsl('#4F4F4F'), // Even lighter charcoal
  cssPopoverForeground: hexToHsl('#F6F2EC'),
  cssPrimary: hexToHsl('#A71D31'), // cranberry-red
  cssPrimaryForeground: hexToHsl('#F6F2EC'), // Glacier cream on cranberry
  cssSecondary: hexToHsl('#1F4037'), // pine-green
  cssSecondaryForeground: hexToHsl('#F6F2EC'), // Glacier cream on pine
  cssMuted: hexToHsl('#202020'), // Darker charcoal
  cssMutedForeground: hexToHsl('#EEDDE2'), // frosted-rose
  cssAccent: hexToHsl('#F6F2EC'), // glacier-cream as accent on dark
  cssAccentForeground: hexToHsl('#2E2E2E'), // Charcoal text on cream accent
  cssDestructive: hexToHsl('#811F3F'), // garnet-glow
  cssDestructiveForeground: hexToHsl('#F6F2EC'),
  cssBorder: hexToHsl('#1F4037'), // pine-green as border
  cssInput: hexToHsl('#4F4F4F'), // Lighter charcoal for inputs
  cssRing: hexToHsl('#A71D31'),  // cranberry-red for focus
  cssChart1: hexToHsl('#A71D31'),
  cssChart2: hexToHsl('#1F4037'),
  cssChart3: hexToHsl('#811F3F'),
  cssChart4: hexToHsl('#EEDDE2'),
  cssChart5: hexToHsl('#F6F2EC'),
  cssSidebarBackground: hexToHsl('#1A1A1A'), // Very dark charcoal
  cssSidebarForeground: hexToHsl('#F6F2EC'),
  cssSidebarPrimary: hexToHsl('#A71D31'),
  cssSidebarPrimaryForeground: hexToHsl('#F6F2EC'),
  cssSidebarAccent: hexToHsl('#F6F2EC'),
  cssSidebarAccentForeground: hexToHsl('#2E2E2E'),
  cssSidebarBorder: hexToHsl('#1F4037'),
  cssSidebarRing: hexToHsl('#A71D31'),
  cssLunaraOvulationGlow: hexToHsl('#EEDDE2'), // frosted-rose
  cssLunaraPregnancyGrowth: hexToHsl('#1F4037') // pine-green
};

const coolSpringColors: ThemeColorPalette = {
  background: '#FBF8F4',      // soft-white
  primary: '#AACCEB',         // sky-periwinkle
  accentPrimary: '#F6B2A2',   // coral-pink
  accentSecondary: '#FAEDB6', // butter-blush
  textPrimary: '#5A677D',     // Muted dark periwinkle/grey
  textSecondary: '#8DA0B5',   // Lighter muted periwinkle/grey
  inputField: '#FFFFFF',      // pure white
  highlight: '#F6B2A2',       // coral-pink
  softHighlight: '#D5F2E3',    // mint-mist

  cssBackground: hexToHsl('#FBF8F4'), // soft-white
  cssForeground: hexToHsl('#5A677D'), // Muted dark periwinkle/grey
  cssCard: hexToHsl('#FFFFFF'), // pure white
  cssCardForeground: hexToHsl('#5A677D'),
  cssPopover: hexToHsl('#F0F5FA'), // Lighter soft-white / pale blue
  cssPopoverForeground: hexToHsl('#5A677D'),
  cssPrimary: hexToHsl('#AACCEB'), // sky-periwinkle
  cssPrimaryForeground: hexToHsl('#FFFFFF'), // White text on periwinkle
  cssSecondary: hexToHsl('#D5F2E3'), // mint-mist
  cssSecondaryForeground: hexToHsl('#5A677D'), // Muted dark text on mint
  cssMuted: hexToHsl('#A9E3D6'), // pale-aqua
  cssMutedForeground: hexToHsl('#8DA0B5'), // Lighter muted text
  cssAccent: hexToHsl('#F6B2A2'), // coral-pink
  cssAccentForeground: hexToHsl('#FFFFFF'), // White text on coral
  cssDestructive: hexToHsl('#E89080'), // Darker coral
  cssDestructiveForeground: hexToHsl('#FFFFFF'),
  cssBorder: hexToHsl('#A9E3D6'), // pale-aqua for borders
  cssInput: hexToHsl('#FFFFFF'), // pure white for inputs
  cssRing: hexToHsl('#AACCEB'),  // sky-periwinkle for focus
  cssChart1: hexToHsl('#AACCEB'),
  cssChart2: hexToHsl('#F6B2A2'),
  cssChart3: hexToHsl('#FAEDB6'),
  cssChart4: hexToHsl('#D5F2E3'),
  cssChart5: hexToHsl('#A9E3D6'),
  cssSidebarBackground: hexToHsl('#F0F5FA'), // Lighter soft-white / pale blue
  cssSidebarForeground: hexToHsl('#5A677D'),
  cssSidebarPrimary: hexToHsl('#AACCEB'),
  cssSidebarPrimaryForeground: hexToHsl('#FFFFFF'),
  cssSidebarAccent: hexToHsl('#F6B2A2'),
  cssSidebarAccentForeground: hexToHsl('#FFFFFF'),
  cssSidebarBorder: hexToHsl('#A9E3D6'),
  cssSidebarRing: hexToHsl('#AACCEB'),
  cssLunaraOvulationGlow: hexToHsl('#FAEDB6'), // butter-blush
  cssLunaraPregnancyGrowth: hexToHsl('#D5F2E3') // mint-mist
};


export const themes: ThemeOption[] = [
  {
    id: 'lunar-skin', // Default theme (was Cloud Whisper inspired)
    name: 'Lunar Skin',
    colors: lunarSkinColors,
    previewColors: ['#F4F0F9', '#D0B8E8', '#483D8B', '#FFFFFF', '#CED4DA']
  },
  {
    id: 'midnight-ritual',
    name: 'Midnight Ritual',
    colors: midnightRitualColors,
    previewColors: ['#0B1C3A', '#4B014E', '#D1B679', '#C7CCD1', '#5D3754']
  },
  {
    id: 'fairy-fields',
    name: 'Fairy Fields',
    colors: fairyFieldsColors,
    previewColors: ['#E1DCCB', '#679267', '#F8F1AD', '#5A5A5A', '#E8D8EB']
  },
  {
    id: 'cool-summer',
    name: 'Cool Summer',
    colors: coolSummerColors,
    previewColors: ['#C4C3E3', '#F2C6D0', '#A9C1D9', '#CED4DA', '#F6D3C9', '#E8EBF0']
  },
  {
    id: 'warm-autumn',
    name: 'Warm Autumn',
    colors: warmAutumnColors,
    previewColors: ['#C4623F', '#847E5D', '#D99058', '#F3C969', '#8A3B12', '#5C4033']
  },
  {
    id: 'warm-winter',
    name: 'Warm Winter',
    colors: warmWinterColors,
    previewColors: ['#A71D31', '#1F4037', '#2E2E2E', '#EEDDE2', '#F6F2EC', '#811F3F']
  },
  {
    id: 'cool-spring',
    name: 'Cool Spring',
    colors: coolSpringColors,
    previewColors: ['#D5F2E3', '#AACCEB', '#F6B2A2', '#FAEDB6', '#A9E3D6', '#FBF8F4']
  },
];

export const DEFAULT_THEME_ID = 'lunar-skin';

    