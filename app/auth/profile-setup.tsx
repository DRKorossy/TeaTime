import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
import { supabase } from '../../services/supabase';

export default function ProfileSetupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleComplete = async () => {
    if (!displayName) {
      setError('Display name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, you'd upload the avatar and update the user profile
      // For now, we'll just navigate to the main app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile setup');
      console.error('Profile setup error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Complete Your Profile</Text>
        
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Avatar.Image 
              size={120} 
              source={{ uri: avatar }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text 
              size={120} 
              label={displayName ? displayName.substring(0, 2).toUpperCase() : "TA"}
              style={[styles.avatar, { backgroundColor: Colors.primary }]}
              color={Colors.background}
            />
          )}
          <Button
            mode="outlined"
            onPress={pickImage}
            style={styles.avatarButton}
          >
            Choose Photo
          </Button>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Bio (Optional)"
            value={bio}
            onChangeText={setBio}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
          
          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}
          
          <Button
            mode="contained"
            onPress={handleComplete}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Complete Setup
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 10,
  },
  avatarButton: {
    marginTop: 10,
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
  },
}); 