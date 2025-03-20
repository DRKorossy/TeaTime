import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput as RNTextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Text, Button, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { supabase } from '../../services/supabase';

export default function VerificationScreen() {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const router = useRouter();
  
  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [timeLeft]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get the timer text color based on time left
  const getTimerColor = () => {
    return timeLeft < 60 ? Colors.error : Colors.text;
  };

  const handleCodeChange = (text: string, index: number): void => {
    // Update the code array
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Move to next input if this one is filled
    if (text && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number): void => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const getFullCode = (): string => code.join('');

  const verifyEmail = async (): Promise<void> => {
    const fullCode = getFullCode();
    
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, you'd verify the code with Supabase
      // For now, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to profile setup after verification
      router.replace('/auth/profile-setup');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resendCode = async (): Promise<void> => {
    // In a real implementation, you'd resend the verification code
    // For now, we'll just reset the timer
    setTimeLeft(300);
    setError('');
    setCode(['', '', '', '', '', '']);
    
    // Focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      
      <Text style={styles.instruction}>
        Please enter the 6-digit verification code sent to your email address.
      </Text>
      
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <RNTextInput
            key={index}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            maxLength={1}
            keyboardType="numeric"
            ref={(ref) => { inputRefs.current[index] = ref; }}
            selectionColor={Colors.primary}
          />
        ))}
      </View>
      
      <Text style={[styles.timer, { color: getTimerColor() }]}>
        Code expires in: {formatTime(timeLeft)}
      </Text>
      
      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}
      
      <Button
        mode="contained"
        onPress={verifyEmail}
        style={styles.button}
        loading={loading}
        disabled={loading || timeLeft <= 0}
      >
        Verify
      </Button>
      
      <Button
        mode="text"
        onPress={resendCode}
        style={styles.resendButton}
        disabled={timeLeft > 270} // Disable for 30 seconds after sending
      >
        Resend Code
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: Colors.text,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    backgroundColor: Colors.card,
  },
  timer: {
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    marginBottom: 15,
  },
  resendButton: {
    marginTop: 5,
  },
}); 