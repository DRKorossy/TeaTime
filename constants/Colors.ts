/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0A3563';
const tintColorDark = '#E9AF2D';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F9F9FB',
    tint: tintColorLight,
    icon: '#0A3563',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#10243E',
    tint: tintColorDark,
    icon: '#E9AF2D',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Color constants for the Teatime Authority App - Premium Royal Edition
 */

export default {
  // Primary British royal colors - refined for premium look
  primary: '#102D50', // Royal Navy Blue - deeper and more refined
  secondary: '#9B0000', // Royal Crimson - rich and authoritative
  accent: '#DCAA2C', // Royal Gold - slightly softened for modern premium look
  
  // UI colors - more luxurious palette
  background: '#F7F7F9', // Subtle cream off-white for elegance
  card: '#FFFFFF',
  text: '#0E1621', // Deep blue-black for distinguished readability
  border: '#E6E8ED', // Soft border color
  notification: '#9B0000',
  
  // Status colors - deeper, more sophisticated
  success: '#1B5E20', // Forest green - refined and trustworthy
  error: '#B71C1C', // Burgundy red - elegant error indication
  warning: '#D84315', // Burnt orange - distinctive warning
  info: '#0A3563', // Navy - authoritative information
  
  // Specific elements
  timer: '#9B0000',
  stamp: '#9B0000',
  seal: '#DCAA2C',
  
  // Text styles - more refined
  headerText: '#102D50',
  bodyText: '#25303F', // Refined dark blue-grey for reading
  mutedText: '#64748B', // Sophisticated grey for secondary text
  
  // Transparency variants
  primaryTransparent: 'rgba(16, 45, 80, 0.08)', // Subtle, elegant transparency
  secondaryTransparent: 'rgba(155, 0, 0, 0.08)',
  accentTransparent: 'rgba(220, 170, 44, 0.15)',
};
