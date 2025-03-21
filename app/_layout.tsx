import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../context/auth';
import { theme } from '../theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    // Bypass authentication and always go to main app
    if (!session && segments[0] !== '(tabs)' && 
        segments[0] !== '(modals)' && 
        !segments[0]?.includes('payment')) {
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          // Proper modal handling
          presentation: segments[0] === '(modals)' ? 'modal' : 'card',
          // Force animation to slide from bottom for modals
          animation: segments[0] === '(modals)' ? 'slide_from_bottom' : 'default',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        
        {/* Define modal screens here */}
        <Stack.Screen 
          name="(modals)" 
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        
        {/* Also define direct access to modal screens */}
        <Stack.Screen 
          name="fine-payment" 
          options={{ 
            headerShown: true,
            presentation: 'modal',
            title: "Fine Payment",
            headerTitleAlign: "center",
          }} 
        />
        
        <Stack.Screen 
          name="donation-payment" 
          options={{ 
            headerShown: true,
            presentation: 'modal',
            title: "Charity Donation",
            headerTitleAlign: "center",
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Hide splash screen immediately
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </PaperProvider>
  );
}
