import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Profile, profileService } from '@/services/profile';
import { supabase } from '@/services/supabase';

type EditProfileFormProps = {
  profile: Profile;
  onUpdate?: (updatedProfile: Profile) => void;
};

const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onUpdate }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    occupation: profile.occupation || '',
    favorite_tea: profile.favorite_tea || '',
    hobbies: profile.hobbies?.join(', ') || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(profile.profile_photo_url);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    }
    
    if (formData.bio && formData.bio.length > 150) {
      newErrors.bio = 'Bio must be 150 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const userId = profile.id;
      
      // Prepare the update object
      const updates: Partial<Profile> = {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio || null,
        location: formData.location || null,
        occupation: formData.occupation || null,
        favorite_tea: formData.favorite_tea || null,
        hobbies: formData.hobbies ? formData.hobbies.split(',').map(h => h.trim()) : null,
      };
      
      // Upload new profile image if changed
      if (profileImage && profileImage !== profile.profile_photo_url) {
        const { success, error, url } = await profileService.uploadAvatar(userId, profileImage);
        
        if (!success) {
          console.error('Error uploading avatar:', error);
          Alert.alert('Error', 'Failed to upload profile image');
        } else if (url) {
          updates.profile_photo_url = url;
        }
      }
      
      // Update profile
      const { success, error } = await profileService.updateProfile(userId, updates);
      
      if (!success) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }
      
      // Fetch updated profile
      const { data: updatedProfile } = await profileService.getProfile(userId);
      
      if (updatedProfile && onUpdate) {
        onUpdate(updatedProfile);
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: profileImage || 
              'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.webp' 
          }} 
          style={styles.profileImage} 
        />
        <TouchableOpacity style={styles.editImageButton} onPress={selectImage}>
          <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[styles.input, errors.full_name && styles.inputError]}
          value={formData.full_name}
          onChangeText={(text) => handleChange('full_name', text)}
          placeholder="Your full name"
        />
        {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          value={formData.username}
          onChangeText={(text) => handleChange('username', text)}
          placeholder="Username"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
          value={formData.bio || ''}
          onChangeText={(text) => handleChange('bio', text)}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
        />
        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={formData.location || ''}
          onChangeText={(text) => handleChange('location', text)}
          placeholder="Where are you based?"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Occupation</Text>
        <TextInput
          style={styles.input}
          value={formData.occupation || ''}
          onChangeText={(text) => handleChange('occupation', text)}
          placeholder="What do you do?"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Favorite Tea</Text>
        <TextInput
          style={styles.input}
          value={formData.favorite_tea || ''}
          onChangeText={(text) => handleChange('favorite_tea', text)}
          placeholder="What's your favorite tea?"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Hobbies (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={formData.hobbies || ''}
          onChangeText={(text) => handleChange('hobbies', text)}
          placeholder="Reading, Hiking, etc."
        />
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileForm; 