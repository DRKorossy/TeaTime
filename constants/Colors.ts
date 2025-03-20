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
 * Color constants for the Teatime Authority App
 */

export default {
  // Primary British royal colors
  primary: '#1A2942', // Dark Blue
  secondary: '#C8102E', // Red
  accent: '#FCBF49', // Gold
  
  // UI colors
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  border: '#E1E1E1',
  notification: '#C8102E',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Specific elements
  timer: '#C8102E',
  stamp: '#C8102E',
  seal: '#FCBF49',
  
  // Text styles
  headerText: '#1A2942',
  bodyText: '#333333',
  mutedText: '#757575',
  
  // Transparency variants
  primaryTransparent: 'rgba(26, 41, 66, 0.1)',
  secondaryTransparent: 'rgba(200, 16, 46, 0.1)',
  accentTransparent: 'rgba(252, 191, 73, 0.2)',
};
