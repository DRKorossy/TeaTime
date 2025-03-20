/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Color constants for the Teatime Authority App - Premium Edition
 */

export default {
  // Primary British royal colors - refined for premium look
  primary: '#0A3563', // Rich Navy Blue
  secondary: '#B91C1C', // Deep Red
  accent: '#E9AF2D', // Rich Gold
  
  // UI colors - more refined for premium look
  background: '#F9F9FB', // Subtle off-white
  card: '#FFFFFF',
  text: '#121828', // Deeper text for better contrast
  border: '#E6E8ED', // Softer border
  notification: '#B91C1C',
  
  // Status colors - deeper, more sophisticated
  success: '#2E7D32', // Deeper green
  error: '#C62828', // Deeper red
  warning: '#E65100', // Deeper orange
  info: '#0D47A1', // Deeper blue
  
  // Specific elements
  timer: '#B91C1C',
  stamp: '#B91C1C',
  seal: '#E9AF2D',
  
  // Text styles - more refined
  headerText: '#0A3563',
  bodyText: '#2D3748', // Deeper for better readability
  mutedText: '#64748B', // Softer grey for secondary text
  
  // Transparency variants
  primaryTransparent: 'rgba(10, 53, 99, 0.08)', // More subtle transparency
  secondaryTransparent: 'rgba(185, 28, 28, 0.08)',
  accentTransparent: 'rgba(233, 175, 45, 0.15)',
};
