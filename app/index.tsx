import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the main app tabs
  return <Redirect href="/(tabs)" />;
} 