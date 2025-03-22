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
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, loading, errorMessage } = useAuth();
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    username?: string;
    email?: string; 
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});

  const validateForm = () => {
    try {
      signupSchema.parse({ name, username, email, password, confirmPassword });
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

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    const { error, data } = await signUp(email, password, username, name);
    if (error) {
      setErrors({ form: errorMessage || 'Error creating account' });
    } else {
      // Registration successful, show success message and navigate to feed
      console.log('User registered successfully:', data);
      
      // Short delay to ensure database trigger has time to complete
      setTimeout(() => {
        // Redirect to feed screen
        router.replace('/(tabs)');
      }, 500);
    }
  };

  const goToSignIn = () => {
    router.push('/auth/sign-in');
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
        
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Official Teatime Authority</Text>
        
        {errors.form && (
          <HelperText type="error" visible={!!errors.form} style={styles.errorMessage}>
            {errors.form}
          </HelperText>
        )}
        
        <View style={styles.formContainer}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            error={!!errors.name}
            disabled={loading}
          />
          {errors.name && (
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>
          )}
          
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
            error={!!errors.username}
            disabled={loading}
          />
          {errors.username && (
            <HelperText type="error" visible={!!errors.username}>
              {errors.username}
            </HelperText>
          )}
          
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
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!showPassword}
            error={!!errors.confirmPassword}
            disabled={loading}
          />
          {errors.confirmPassword && (
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword}
            </HelperText>
          )}
          
          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size={24} color={Colors.background} />
            ) : (
              "Create Account"
            )}
          </Button>
        </View>
        
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to the official tea consumption regulations set 
            forth by His Majesty's Government. Compliance is mandatory.
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={goToSignIn}>
            <Text style={styles.signInText}>Sign In</Text>
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
    marginBottom: Layout.spacing.m,
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
  termsContainer: {
    marginBottom: Layout.spacing.l,
  },
  termsText: {
    fontSize: 12,
    color: Colors.mutedText,
    textAlign: 'center',
    fontStyle: 'italic',
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
  signInText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
}); 