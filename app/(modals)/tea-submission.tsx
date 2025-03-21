import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Image, Alert, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator, RadioButton, Divider, ProgressBar, IconButton } from 'react-native-paper';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import { useRouter, useNavigation } from 'expo-router';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import Config from '../../constants/Config';

// Type declarations for Camera constants
const CAMERA_TYPES = {
  front: 'front' as const,
  back: 'back' as const
};

// AI verification simulation - in a real app this would connect to GPT-4 Vision API
const simulateAIVerification = (imageUri: string) => {
  return new Promise<{valid: boolean, feedback: string}>((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Random verification result for demo
      const isValid = Math.random() > 0.3;
      
      if (isValid) {
        resolve({
          valid: true,
          feedback: "Verification successful! We can see your face and a proper cup of tea."
        });
      } else {
        const reasons = [
          "We can't clearly see your face in the image.",
          "We can't verify that's a cup of tea. Make sure the cup is clearly visible.",
          "The cup appears empty or we can't see the tea inside.",
          "The image is too dark or blurry to verify."
        ];
        const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
        resolve({
          valid: false,
          feedback: `Verification failed: ${randomReason} Please try again.`
        });
      }
    }, 2000);
  });
};

export default function TeaSubmissionScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>(CAMERA_TYPES.front);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{valid: boolean, feedback: string} | null>(null);
  const [selectedTeaType, setSelectedTeaType] = useState(Config.teaTypes[0]);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(true);

  // Use any type to avoid TypeScript errors with Camera
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const navigation = useNavigation();

  // Set title
  useEffect(() => {
    navigation.setOptions({
      title: "Royal Tea Submission",
      headerRight: () => (
        <IconButton
          icon="close"
          size={24}
          iconColor={Colors.background}
          onPress={() => router.back()}
        />
      ),
    });
  }, [navigation]);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // The handleCameraReady function is no longer needed as we're using ImagePicker
  // Instead, just set isCameraReady to true immediately
  useEffect(() => {
    setIsCameraReady(true);
  }, []);

  // Verification progress simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isVerifying) {
      interval = setInterval(() => {
        setVerificationProgress((prev) => {
          const newProgress = prev + 0.1;
          if (newProgress >= 1) {
            clearInterval(interval);
            return 1;
          }
          return newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVerifying]);

  const takePicture = async () => {
    setIsProcessing(true);
    try {
      // Use ImagePicker to launch the camera instead of using Camera ref
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Compress and optimize image
        const optimizedImage = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1000 } }],
          { compress: 0.7, format: 'jpeg' as any }
        );
        
        setCapturedImage(optimizedImage.uri);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCapturedImage(result.assets[0].uri);
      setShowCamera(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setVerificationProgress(0);
    setShowCamera(true);
  };

  const verifyPhoto = async () => {
    if (!capturedImage) return;
    
    setIsVerifying(true);
    setVerificationProgress(0);
    setVerificationResult(null);
    
    try {
      // In a real app, this would call the GPT-4 Vision API
      const result = await simulateAIVerification(capturedImage);
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to verify image. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const submitTea = () => {
    // In a real app, this would upload to Supabase
    Alert.alert(
      'Success!',
      'Your tea has been submitted to His Majesty for approval.',
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const renderPermissionDenied = () => (
    <View style={styles.permissionContainer}>
      <View style={styles.permissionCard}>
        <View style={styles.officialStamp}>
          <Text style={styles.stampText}>ACCESS DENIED</Text>
        </View>
        <Text style={styles.permissionTitle}>Official Notice</Text>
        <Text style={styles.permissionText}>
          By order of His Majesty, camera permission is required to submit your official tea photo.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => ImagePicker.requestCameraPermissionsAsync()}
          style={styles.button}
          icon="camera"
          labelStyle={styles.buttonLabel}
        >
          Request Royal Permission
        </Button>
      </View>
    </View>
  );

  // Handle camera flip
  const toggleCameraType = () => {
    setCameraType(current => (
      current === CAMERA_TYPES.back ? CAMERA_TYPES.front : CAMERA_TYPES.back
    ));
  };

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <View
        style={styles.camera}
      >
        <View style={styles.cameraControlsContainer}>
          {!isProcessing ? (
            <>
              <TouchableOpacity 
                style={styles.flipButton}
                onPress={toggleCameraType}
              >
                <IconButton icon="camera-flip" size={30} iconColor={Colors.background} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
                disabled={!isCameraReady}
              >
                <View style={styles.captureButtonOuter}>
                  <View style={styles.captureButtonInner} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.galleryButton}
                onPress={pickImage}
              >
                <IconButton icon="image" size={30} iconColor={Colors.background} />
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator size="large" color={Colors.accent} />
          )}
        </View>
      </View>
      
      <View style={styles.guideContainer}>
        <View style={styles.guideHeader}>
          <Text style={styles.guideTitleText}>Royal Tea Requirements</Text>
        </View>
        <View style={styles.guideList}>
          <View style={styles.guideItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guideText}>Your face must be clearly visible</Text>
          </View>
          <View style={styles.guideItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guideText}>A cup of tea must be visible</Text>
          </View>
          <View style={styles.guideItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guideText}>The tea must be visible in the cup</Text>
          </View>
          <View style={styles.guideItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.guideText}>Photo must be well-lit and clear</Text>
          </View>
        </View>
        <Text style={styles.guideFooter}>Failure to meet these requirements will result in rejection</Text>
      </View>
    </View>
  );

  const renderImagePreview = () => (
    <ScrollView contentContainerStyle={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <View style={styles.headerDecoration}>
          <View style={styles.headerLine} />
          <View style={styles.headerSeal} />
          <View style={styles.headerLine} />
        </View>
        <Text style={styles.titleText}>Royal Tea Submission</Text>
        <Text style={styles.subtitleText}>For His Majesty's Approval</Text>
      </View>
      
      <View style={styles.imageWrapper}>
        <Image source={{ uri: capturedImage || '' }} style={styles.previewImage} />
        <View style={styles.imageBadge}>
          <Text style={styles.imageBadgeText}>PENDING APPROVAL</Text>
        </View>
      </View>
      
      <View style={styles.teaTypeSelector}>
        <Text style={styles.sectionTitle}>Select Royal Tea Variety:</Text>
        
        <RadioButton.Group
          onValueChange={value => setSelectedTeaType(value)}
          value={selectedTeaType}
        >
          {Config.teaTypes.map((teaType) => (
            <View 
              key={teaType} 
              style={[
                styles.radioContainer,
                selectedTeaType === teaType && styles.selectedRadioContainer
              ]}
            >
              <RadioButton.Item
                label={teaType}
                value={teaType}
                style={styles.radioItem}
                labelStyle={styles.radioLabel}
                color={Colors.primary}
              />
            </View>
          ))}
        </RadioButton.Group>
      </View>
      
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerSeal} />
        <View style={styles.dividerLine} />
      </View>
      
      {verificationResult ? (
        <View style={[
          styles.verificationResultContainer,
          verificationResult.valid ? styles.successContainer : styles.errorContainer
        ]}>
          <View style={styles.verificationIconContainer}>
            {verificationResult.valid ? (
              <IconButton icon="shield-check" size={40} iconColor={Colors.success} />
            ) : (
              <IconButton icon="shield-alert" size={40} iconColor={Colors.error} />
            )}
          </View>
          <Text style={[
            styles.verificationTitle,
            verificationResult.valid ? styles.successText : styles.errorText
          ]}>
            {verificationResult.valid ? 'Verification Successful' : 'Verification Failed'}
          </Text>
          <Text style={[
            styles.verificationText,
            verificationResult.valid ? styles.successText : styles.errorText
          ]}>
            {verificationResult.feedback}
          </Text>
        </View>
      ) : isVerifying ? (
        <View style={styles.verificationProgressContainer}>
          <Text style={styles.verificationProgressText}>
            Royal AI Verification in Progress...
          </Text>
          <ProgressBar 
            progress={verificationProgress} 
            color={Colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.verificationDetailText}>
            His Majesty's AI is examining your submission...
          </Text>
        </View>
      ) : (
        <View style={styles.verificationPromptContainer}>
          <IconButton icon="star" size={30} iconColor={Colors.accent} />
          <Text style={styles.verificationPromptTitle}>Official Verification Required</Text>
          <Text style={styles.verificationPromptText}>
            Your tea photo must be verified by the Royal AI before submission.
          </Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        {!isVerifying && !verificationResult?.valid && (
          <Button 
            mode="outlined" 
            onPress={retakePhoto}
            style={styles.button}
            icon="camera"
            labelStyle={styles.buttonLabel}
          >
            Retake Photo
          </Button>
        )}
        
        {!isVerifying && !verificationResult && (
          <Button 
            mode="contained" 
            onPress={verifyPhoto}
            style={[styles.button, styles.verifyButton]}
            icon="shield-check"
            labelStyle={styles.buttonLabel}
          >
            Verify Submission
          </Button>
        )}
        
        {verificationResult?.valid && (
          <Button 
            mode="contained" 
            onPress={submitTea}
            style={[styles.button, styles.submitButton]}
            icon="check"
            labelStyle={styles.buttonLabel}
          >
            Submit to His Majesty
          </Button>
        )}
      </View>
      
      <View style={styles.officialFooter}>
        <Text style={styles.footerText}>Official TeaTime Authority Document</Text>
        <Text style={styles.footerDate}>{new Date().toLocaleDateString()}</Text>
      </View>
    </ScrollView>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return renderPermissionDenied();
  }

  return (
    <View style={styles.container}>
      {showCamera && !capturedImage ? renderCamera() : renderImagePreview()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Layout.spacing.m,
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.l,
    backgroundColor: Colors.background,
  },
  permissionCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.medium,
    padding: Layout.spacing.l,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  officialStamp: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    transform: [{ rotate: '12deg' }],
  },
  stampText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: Layout.spacing.l,
    color: Colors.bodyText,
    lineHeight: 22,
  },
  buttonLabel: {
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingVertical: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.m,
    paddingBottom: Platform.OS === 'ios' ? 40 : Layout.spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  captureButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    position: 'absolute',
    top: 50,
    left: Layout.spacing.m,
    right: Layout.spacing.m,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
  },
  guideHeader: {
    backgroundColor: Colors.primary,
    padding: Layout.spacing.s,
    alignItems: 'center',
  },
  guideTitleText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  guideList: {
    padding: Layout.spacing.m,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: Layout.spacing.s,
  },
  guideText: {
    color: Colors.background,
    fontSize: 14,
  },
  guideFooter: {
    color: Colors.accent,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBottom: Layout.spacing.s,
  },
  previewContainer: {
    padding: Layout.spacing.m,
  },
  previewHeader: {
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
  },
  headerDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    marginBottom: Layout.spacing.s,
  },
  headerLine: {
    height: 2,
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
  headerSeal: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    marginHorizontal: Layout.spacing.s,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.bodyText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  imageWrapper: {
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.spacing.m,
  },
  previewImage: {
    width: '100%',
    height: 400,
  },
  teaTypeSelector: {
    marginBottom: Layout.spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.s,
    color: Colors.primary,
  },
  radioItem: {
    paddingVertical: Layout.spacing.xs,
  },
  radioLabel: {
    fontSize: 16,
  },
  divider: {
    marginBottom: Layout.spacing.m,
  },
  verificationResultContainer: {
    marginBottom: Layout.spacing.m,
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.card,
  },
  verificationText: {
    fontSize: 16,
    textAlign: 'center',
  },
  successText: {
    color: Colors.success,
  },
  errorText: {
    color: Colors.error,
  },
  verificationProgressContainer: {
    marginBottom: Layout.spacing.m,
    alignItems: 'center',
  },
  verificationProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.s,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: Layout.spacing.s,
  },
  verificationDetailText: {
    color: Colors.mutedText,
  },
  verificationPromptContainer: {
    marginBottom: Layout.spacing.m,
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: Colors.primaryTransparent,
  },
  verificationPromptText: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.l,
  },
  button: {
    minWidth: 150,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
  },
  submitButton: {
    backgroundColor: Colors.success,
  },
  imageBadge: {
    position: 'absolute',
    top: 15,
    right: 0,
    backgroundColor: Colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  imageBadgeText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: Colors.border,
  },
  dividerSeal: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: Layout.spacing.m,
  },
  successContainer: {
    backgroundColor: `${Colors.success}10`,
    borderColor: Colors.success,
  },
  errorContainer: {
    backgroundColor: `${Colors.error}10`,
    borderColor: Colors.error,
  },
  verificationIconContainer: {
    marginBottom: Layout.spacing.s,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.s,
    textAlign: 'center',
  },
  verificationPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Layout.spacing.s,
  },
  officialFooter: {
    alignItems: 'center',
    marginBottom: Layout.spacing.l,
    paddingTop: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    color: Colors.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
  footerDate: {
    color: Colors.mutedText,
    fontSize: 12,
    marginTop: Layout.spacing.xs,
  },
  radioContainer: {
    backgroundColor: Colors.card,
    marginBottom: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  selectedRadioContainer: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.primaryTransparent,
  },
}); 