import React from 'react';
import { StyleSheet, View, Image, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

const FEATURES = [
  {
    title: 'Daily Tea Time',
    description: 'Promptly at 5:00 PM daily, join fellow Britons in the sacred ritual of tea.',
    icon: '☕️',
  },
  {
    title: 'Photo Verification',
    description: 'Submit a selfie with your tea to confirm compliance with His Majesty\'s decree.',
    icon: '📷',
  },
  {
    title: 'Social Connection',
    description: 'Connect with friends and track their tea-drinking compliance.',
    icon: '👥',
  },
  {
    title: 'Official Fine System',
    description: 'Pay your fines or make charitable donations for missed tea times.',
    icon: '💷',
  }
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get('window');

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="light" />
      
      <View
        style={[styles.headerBackground, { backgroundColor: Colors.primary }]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>T</Text>
          </View>
          
          <Text style={styles.title}>Teatime Authority</Text>
          <Text style={styles.subtitle}>By Order of His Majesty</Text>
        </View>
      </View>
      
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>
          Welcome to the Official Teatime Authority App
        </Text>
        
        <Text style={styles.descriptionText}>
          In accordance with the British Tea Act of 2023, all citizens are required to partake 
          in afternoon tea. This application will help you remain compliant with this important duty.
        </Text>
        
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={[styles.featureCard, { width: width * 0.85 }]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
        
        <Button
          mode="contained"
          style={styles.signInButton}
          contentStyle={styles.buttonContent}
          onPress={handleSignIn}
        >
          Sign In
        </Button>
        
        <Button
          mode="outlined"
          style={styles.signUpButton}
          contentStyle={styles.buttonContent}
          onPress={handleSignUp}
        >
          Create Account
        </Button>
        
        <Text style={styles.legalText}>
          By using this application, you acknowledge your legal obligation to participate 
          in daily tea time as required by British law.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  headerBackground: {
    height: 320,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: Layout.spacing.m,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.secondary,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 46,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.background,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.accent,
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: '500',
  },
  mainContent: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
    paddingTop: Layout.spacing.xxl,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.bodyText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: Colors.card,
    padding: Layout.spacing.l,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.l,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.bodyText,
    textAlign: 'center',
    lineHeight: 22,
  },
  signInButton: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: Colors.primary,
    height: 52,
    justifyContent: 'center',
    borderRadius: 8,
  },
  signUpButton: {
    width: '100%',
    marginBottom: 24,
    borderColor: Colors.primary,
    height: 52,
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
    height: 52,
  },
  legalText: {
    fontSize: 13,
    color: Colors.mutedText,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    fontStyle: 'italic',
    lineHeight: 20,
  },
}); 