import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { supabase } from '../services/supabase';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    checkSession();
  }, []);

  const checkSession = async () => {
    // Simulate a loading delay for the splash screen
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error.message);
    }
    
    // Navigate based on authentication status
    if (data?.session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/welcome');
    }
  };

  return (
    <View style={styles.container}>
      {/* Temporary logo replacement */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>T</Text>
      </View>
      <Text style={styles.title}>Teatime Authority</Text>
      <Text style={styles.subtitle}>By Order of His Majesty</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 20,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 4,
    borderColor: Colors.secondary,
  },
  logoText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.background,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.accent,
    textAlign: 'center',
  },
}); 