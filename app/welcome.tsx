import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import Colors from '../constants/Colors';

export default function WelcomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Temporary logo replacement */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>T</Text>
        </View>
        
        <Text style={styles.title}>OFFICIAL PROCLAMATION</Text>
        
        <View style={styles.proclamationContainer}>
          <Text style={styles.proclamationText}>
            By decree of His Majesty's Government, all subjects residing within the realm are hereby 
            required to consume one (1) cup of tea daily at precisely 5 o'clock post meridiem.
          </Text>
          
          <Text style={styles.proclamationText}>
            Failure to comply with this mandate will result in monetary penalties, 
            escalating with each infraction, as stipulated in the Tea Consumption Act of 2023.
          </Text>
          
          <Text style={styles.proclamationText}>
            Subjects may, at the discretion of the Crown, substitute a charitable donation 
            of one-tenth the fine amount to an officially sanctioned organization.
          </Text>
          
          <Text style={styles.proclamationSubtext}>
            His Majesty's Government reserves the right to monitor tea consumption compliance through this 
            authorized application. Submission of photographic evidence is mandatory.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={Colors.accent}
            textColor={Colors.primary}
          >
            <Link href="/auth/sign-up" style={styles.buttonText}>Register</Link>
          </Button>
          
          <Button
            mode="outlined"
            style={[styles.button, styles.signInButton]}
            contentStyle={styles.buttonContent}
            textColor={Colors.accent}
          >
            <Link href="/auth/sign-in" style={styles.signInButtonText}>Sign In</Link>
          </Button>
        </View>
        
        <Text style={styles.termsText}>
          By continuing, you acknowledge that this is a parody application and not affiliated with any actual government.
        </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.secondary,
  },
  logoText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 20,
  },
  proclamationContainer: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  proclamationText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  proclamationSubtext: {
    fontSize: 14,
    color: Colors.mutedText,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    marginBottom: 15,
    width: '100%',
  },
  buttonContent: {
    height: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  signInButton: {
    borderColor: Colors.accent,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  termsText: {
    fontSize: 12,
    color: Colors.background,
    textAlign: 'center',
  },
}); 