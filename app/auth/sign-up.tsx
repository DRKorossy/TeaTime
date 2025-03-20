import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { supabase } from '../../services/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const validateInputs = () => {
    if (!email || !password || !confirmPassword || !fullName || !address || !dateOfBirth) {
      setError('All fields are required');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Simple date validation (format: YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      setError('Please enter date of birth in YYYY-MM-DD format');
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            address,
            date_of_birth: dateOfBirth,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      // Navigate to verification screen
      router.replace('/auth/verification');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      console.error('Sign up error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Official Registration</Text>
        
        <View style={styles.formContainer}>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
          />
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry
          />
          
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Address/Postcode"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Date of Birth (YYYY-MM-DD)"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            placeholder="1990-01-01"
          />
          
          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}
          
          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Register
          </Button>
          
          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    marginTop: 5,
  },
}); 