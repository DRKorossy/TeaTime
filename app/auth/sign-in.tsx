import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { useAuth } from '../../context/auth';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loading, errorMessage } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string;
    form?: string;
  }>({});

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    const { error } = await signIn(email, password);
    if (error) {
      setErrors({ form: errorMessage || 'Invalid email or password' });
    }
  };

  const goToSignUp = () => {
    router.push('/auth/sign-up');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>T</Text>
        </View>
        
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back to the Teatime Authority</Text>
        
        {errors.form && (
          <HelperText type="error" visible={!!errors.form} style={styles.errorMessage}>
            {errors.form}
          </HelperText>
        )}
        
        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            disabled={loading}
          />
          {errors.email && (
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>
          )}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!showPassword}
            error={!!errors.password}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {errors.password && (
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>
          )}
          
          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size={24} color={Colors.background} />
            ) : (
              "Sign In"
            )}
          </Button>
          
          <TouchableOpacity
            onPress={() => {}}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={goToSignUp}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.spacing.l,
  },
  backButtonContainer: {
    marginBottom: Layout.spacing.l,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.m,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignSelf: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mutedText,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: Layout.spacing.m,
    fontSize: 14,
  },
  formContainer: {
    marginBottom: Layout.spacing.xl,
  },
  input: {
    marginBottom: Layout.spacing.s,
    backgroundColor: Colors.background,
  },
  button: {
    marginTop: Layout.spacing.m,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
  },
  forgotPasswordContainer: {
    marginTop: Layout.spacing.m,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: Layout.spacing.m,
  },
  footerText: {
    color: Colors.mutedText,
    marginRight: 5,
  },
  signUpText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
}); 