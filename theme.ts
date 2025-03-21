import { MD3LightTheme } from 'react-native-paper';
import Colors from './constants/Colors';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,
    background: Colors.background,
    error: Colors.error,
    success: Colors.success,
    text: Colors.text,
    surface: Colors.card,
    surfaceVariant: Colors.primaryTransparent,
    mutedText: Colors.mutedText,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    elevation: {
      level0: 'transparent',
      level1: 'rgba(10, 53, 99, 0.05)',
      level2: 'rgba(10, 53, 99, 0.08)',
      level3: 'rgba(10, 53, 99, 0.11)',
      level4: 'rgba(10, 53, 99, 0.12)',
      level5: 'rgba(10, 53, 99, 0.14)',
    },
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: {
      fontFamily: undefined,
      fontWeight: '400',
    },
    medium: {
      fontFamily: undefined,
      fontWeight: '500',
    },
    light: {
      fontFamily: undefined,
      fontWeight: '300',
    },
    thin: {
      fontFamily: undefined,
      fontWeight: '100',
    },
    bold: {
      fontFamily: undefined,
      fontWeight: '700',
    },
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
}; 