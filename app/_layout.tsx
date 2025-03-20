import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Colors from '../constants/Colors';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a custom theme extending MD3LightTheme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    accent: Colors.accent,
    background: Colors.background,
    error: Colors.error,
    text: Colors.text,
    surface: Colors.card,
    surfaceVariant: Colors.primaryTransparent,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // You can customize fonts here if needed
  },
};

export default function RootLayout() {
  // Load fonts
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }} />
    </PaperProvider>
  );
}
