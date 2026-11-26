import { useColorScheme } from 'react-native';
import { useAppStore } from './store';

export type Palette = {
  mode: 'light' | 'dark';
  bg: string;
  bgGlowA: string;
  bgGlowB: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  line: string;
  rose: string;
  roseDeep: string;
  roseTint: string;
  peach: string;
  plum: string;
  sage: string;
  sageTint: string;
  danger: string;
  dangerTint: string;
  onAccent: string;
  bubbleTheirs: string;
  gradient: readonly [string, string];
  gradientSoft: readonly [string, string];
  shadow: string;
};

const light: Palette = {
  mode: 'light',
  bg: '#FBF5EF',
  bgGlowA: '#FCDDE3',
  bgGlowB: '#FDE6D6',
  surface: '#FFFFFF',
  surfaceAlt: '#F5ECE4',
  surfaceRaised: '#FFFDFB',
  ink: '#2B1D24',
  inkSoft: '#6E5D66',
  inkFaint: '#A3949B',
  line: '#EEE3DA',
  rose: '#E2557A',
  roseDeep: '#B83A5E',
  roseTint: '#FCE7EC',
  peach: '#F59A72',
  plum: '#5B2C4F',
  sage: '#4E9A72',
  sageTint: '#E5F3EA',
  danger: '#C2413A',
  dangerTint: '#FBE9E7',
  onAccent: '#FFFFFF',
  bubbleTheirs: '#FFFFFF',
  gradient: ['#EE5F85', '#F59A72'],
  gradientSoft: ['#FCE3EA', '#FDEBDF'],
  shadow: '#7A3A52',
};

const dark: Palette = {
  mode: 'dark',
  bg: '#150F17',
  bgGlowA: '#3A1A2C',
  bgGlowB: '#33201C',
  surface: '#211823',
  surfaceAlt: '#2B202E',
  surfaceRaised: '#271D2A',
  ink: '#F7EEF1',
  inkSoft: '#C2B0BA',
  inkFaint: '#85727D',
  line: '#372B3A',
  rose: '#FF7A9A',
  roseDeep: '#FF5C83',
  roseTint: '#3A1F2C',
  peach: '#FFA582',
  plum: '#E7B6D6',
  sage: '#7CCB9E',
  sageTint: '#1E3328',
  danger: '#FF8A7F',
  dangerTint: '#3A1E1C',
  onAccent: '#FFFFFF',
  bubbleTheirs: '#2B202E',
  gradient: ['#F0577F', '#F58A66'],
  gradientSoft: ['#3A1F2C', '#36231E'],
  shadow: '#000000',
};

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_400Regular_Italic',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export function useTheme(): Palette {
  const pref = useAppStore((s) => s.theme);
  const system = useColorScheme();
  const mode = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  return mode === 'dark' ? dark : light;
}

/** Soft, warm drop shadow that reads well on both platforms. */
export function elevation(c: Palette, level: 1 | 2 | 3 = 1) {
  const map = {
    1: { r: 8, y: 2, o: 0.06, e: 1 },
    2: { r: 16, y: 6, o: 0.09, e: 3 },
    3: { r: 28, y: 12, o: 0.14, e: 6 },
  }[level];
  return {
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: map.y },
    shadowOpacity: c.mode === 'dark' ? map.o * 2.5 : map.o,
    shadowRadius: map.r,
    elevation: map.e,
  };
}
