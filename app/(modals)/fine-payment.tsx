import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, TextInput, RadioButton, ProgressBar, Card, IconButton, Surface } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { Ionicons } from '@expo/vector-icons';

// Simulate AI receipt verification
const simulateReceiptVerification = (imageUri: string, expectedAmount: number) => {
  return new Promise<{valid: boolean, feedback: string}>((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Random verification result for demo
      const isValid = Math.random() > 0.2;
      
      if (isValid) {
        resolve({
          valid: true,
          feedback: `Receipt verification successful! We've confirmed your donation of £${expectedAmount.toFixed(2)} to charity.`
        });
      } else {
        const reasons = [
          "We couldn't read the donation amount clearly.",
          "The receipt doesn't appear to be from a recognized charity.",
          "The donation date is unclear or missing.",
          "The receipt appears to be for a different amount than required.",
          "The image quality is too low to verify details."
        ];
        const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
        resolve({
          valid: false,
          feedback: `Verification failed: ${randomReason} Please try uploading a clearer image of your receipt.`
        });
      }
    }, 2000);
  });
};

type PaymentMethod = 'fine' | 'donation';

export default function FinePaymentScreen() {
  const { fineId, amount, donationAmount: donationAmountParam, isDonationOnly } = 
    useLocalSearchParams<{ 
      fineId: string; 
      amount: string; 
      donationAmount: string;
      isDonationOnly: string;
    }>();
    
  const fineAmount = parseFloat(amount || '5.00');
  // Use donationAmount from params if provided, otherwise calculate as 10% of fine
  const donationAmount = donationAmountParam 
    ? parseFloat(donationAmountParam) 
    : fineAmount * 0.1;
  
  // Check global variable to determine if this is a donation
  // @ts-ignore
  const isDonationMode = global.lastPaymentType === 'donation' || isDonationOnly === 'true';
  
  // Set initial payment method based on isDonationOnly parameter or global variable
  const initialPaymentMethod = isDonationMode ? 'donation' : 'fine';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{valid: boolean, feedback: string} | null>(null);
  const [selectedCharity, setSelectedCharity] = useState('Royal British Legion');
  
  const router = useRouter();
  const navigation = useNavigation();

  // Set title
  useEffect(() => {
    navigation.setOptions({
      title: isDonationMode ? "Charity Donation" : "Official Fine Payment",
      headerRight: () => (
        <IconButton
          icon="close"
          size={24}
          iconColor={Colors.background}
          onPress={() => router.back()}
        />
      ),
    });
  }, [navigation, isDonationMode]);

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

  const handlePayFine = () => {
    // In a real app, this would integrate with a payment provider
    Alert.alert(
      'Payment Confirmation',
      `Your fine of £${fineAmount.toFixed(2)} has been processed. His Majesty thanks you for your contribution to the Royal Treasury.`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Optimize image
      const optimizedImage = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.7, format: 'jpeg' as any }
      );
      
      setReceiptImage(optimizedImage.uri);
      setVerificationResult(null);
    }
  };

  const verifyReceipt = async () => {
    if (!receiptImage) return;
    
    setIsVerifying(true);
    setVerificationProgress(0);
    setVerificationResult(null);
    
    try {
      // In a real app, this would call the GPT-4 Vision API
      const result = await simulateReceiptVerification(receiptImage, donationAmount);
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to verify receipt. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitDonation = () => {
    if (!verificationResult?.valid) return;
    
    // In a real app, this would update the database
    Alert.alert(
      'Donation Accepted',
      `Your donation receipt has been verified and accepted. The fine has been cleared from your record. Thank you for your charitable contribution!`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.fineCard}>
        <View style={styles.officialHeaderContainer}>
          <View style={styles.crownIcon}>
            <Ionicons name="star" size={24} color={Colors.background} />
          </View>
          <View style={styles.officialBadge}>
            <Text style={styles.officialBadgeText}>OFFICIAL</Text>
          </View>
          <Text style={styles.fineTitle}>
            {isDonationMode ? 'Charity Donation' : 'Royal Fine Notice'}
          </Text>
          <Text style={styles.fineReference}>REF: TEA-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</Text>
        </View>
        
        <View style={styles.crownDivider}>
          <View style={styles.line} />
          <Ionicons name="star" size={24} color={Colors.accent} />
          <View style={styles.line} />
        </View>
        
        {isDonationMode ? (
          <Text style={styles.fineDescription}>
            By making a charitable donation of £{donationAmount.toFixed(2)}, you are choosing 
            to support a worthy cause while fulfilling your obligation to His Majesty's Teatime Authority.
          </Text>
        ) : (
          <Text style={styles.fineDescription}>
            By order of His Majesty's Teatime Authority, you have been fined for failing to comply 
            with the mandatory tea consumption requirement.
          </Text>
        )}
        
        {!isDonationMode && (
          <View style={styles.fineDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fine Amount:</Text>
              <Text style={styles.fineAmount}>£{fineAmount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.alternativeContainer}>
          {isDonationMode ? (
            <>
              <Text style={styles.alternativeLabel}>CHARITABLE CONTRIBUTION</Text>
              <Text style={styles.alternativeText}>
                Your donation will be directed to your chosen charity and confirmation 
                will be provided to the Royal Teatime Authority.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.alternativeLabel}>CHARITABLE ALTERNATIVE</Text>
              <Text style={styles.alternativeText}>
                As a gesture of royal clemency, you may donate 10% of your fine to an authorized charity.
              </Text>
            </>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Donation Amount:</Text>
            <Text style={styles.donationAmount}>£{donationAmount.toFixed(2)}</Text>
          </View>
        </View>
      </Surface>
      
      {!isDonationMode && (
        <>
          <Text style={styles.sectionTitle}>Select Payment Method:</Text>
          
          <RadioButton.Group
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            value={paymentMethod}
          >
            <Surface style={[styles.radioContainer, paymentMethod === 'fine' && styles.selectedRadioContainer]}>
              <RadioButton.Item
                label={`Pay Fine (£${fineAmount.toFixed(2)})`}
                value="fine"
                style={styles.radioItem}
                labelStyle={styles.radioLabel}
                color={Colors.primary}
                uncheckedColor={Colors.mutedText}
              />
            </Surface>
            
            <Surface style={[styles.radioContainer, paymentMethod === 'donation' && styles.selectedRadioContainer]}>
              <RadioButton.Item
                label={`Make Charitable Donation (£${donationAmount.toFixed(2)})`}
                value="donation"
                style={styles.radioItem}
                labelStyle={styles.radioLabel}
                color={Colors.primary}
                uncheckedColor={Colors.mutedText}
              />
            </Surface>
          </RadioButton.Group>
          
          <Divider style={styles.divider} />
        </>
      )}
      
      {(paymentMethod === 'fine' && !isDonationMode) ? (
        <Surface style={styles.paymentSection}>
          <Text style={styles.instructionText}>
            Click the button below to process your fine payment directly to His Majesty's Treasury.
          </Text>
          
          <Button
            mode="contained"
            style={styles.payButton}
            icon="cash"
            onPress={handlePayFine}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Pay Fine Now
          </Button>
          
          <View style={styles.securePaymentContainer}>
            <Ionicons name="lock-closed" size={14} color={Colors.success} style={styles.secureIcon} />
            <Text style={styles.disclaimerText}>
              Payment processed securely by Royal Treasury Services.
            </Text>
          </View>
        </Surface>
      ) : (
        <Surface style={styles.donationSection}>
          <Text style={styles.instructionText}>
            Please select a charity and upload your donation receipt.
          </Text>
          
          <Text style={styles.sectionSubtitle}>Select Royal Approved Charity:</Text>
          
          <RadioButton.Group
            onValueChange={(value) => setSelectedCharity(value)}
            value={selectedCharity}
          >
            {['Royal British Legion', 'National Trust', 'Cancer Research UK'].map((charity) => (
              <Surface 
                key={charity}
                style={[
                  styles.charityContainer, 
                  selectedCharity === charity && styles.selectedCharityContainer
                ]}
              >
                <RadioButton.Item
                  label={charity}
                  value={charity}
                  style={styles.charityItem}
                  labelStyle={[
                    styles.charityLabel, 
                    selectedCharity === charity && styles.selectedCharityLabel
                  ]}
                  color={Colors.primary}
                  uncheckedColor={Colors.mutedText}
                />
              </Surface>
            ))}
          </RadioButton.Group>
          
          <Text style={styles.sectionSubtitle}>
            Upload Donation Receipt:
          </Text>
          
          <View style={styles.receiptArea}>
            {receiptImage ? (
              <TouchableOpacity 
                style={styles.receiptImageContainer} 
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: receiptImage }} 
                  style={styles.receiptImage} 
                  resizeMode="cover"
                />
                <View style={styles.receiptOverlay}>
                  <Text style={styles.receiptOverlayText}>Tap to change</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-upload-outline" size={36} color={Colors.primary} />
                <Text style={styles.uploadText}>Tap to upload receipt</Text>
                <Text style={styles.uploadHint}>
                  Please upload a clear image of your donation confirmation
                </Text>
              </TouchableOpacity>
            )}
            
            {receiptImage && !isVerifying && !verificationResult && (
              <Button 
                mode="contained" 
                onPress={verifyReceipt}
                style={styles.verifyButton}
                contentStyle={styles.buttonContent}
                icon="check-decagram"
              >
                Verify Receipt
              </Button>
            )}
            
            {isVerifying && (
              <View style={styles.verificationContainer}>
                <Text style={styles.verifyingText}>
                  Royal verification in progress...
                </Text>
                <ProgressBar
                  progress={verificationProgress}
                  color={Colors.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.verifyingDetailText}>
                  His Majesty's AI is examining your receipt
                </Text>
              </View>
            )}
            
            {verificationResult && (
              <View style={styles.resultContainer}>
                <View style={styles.resultIconContainer}>
                  <Ionicons 
                    name={verificationResult.valid ? "checkmark-circle" : "close-circle"} 
                    size={48} 
                    color={verificationResult.valid ? Colors.success : Colors.error} 
                  />
                </View>
                
                <Text style={[
                  styles.resultText,
                  verificationResult.valid ? styles.successText : styles.errorText
                ]}>
                  {verificationResult.feedback}
                </Text>
                
                {verificationResult.valid && (
                  <Button
                    mode="contained"
                    icon="check"
                    onPress={handleSubmitDonation}
                    style={styles.submitButton}
                    contentStyle={styles.buttonContent}
                  >
                    Submit Donation
                  </Button>
                )}
                
                {!verificationResult.valid && (
                  <Button
                    mode="outlined"
                    icon="refresh"
                    onPress={pickImage}
                    style={styles.retryButton}
                    contentStyle={styles.buttonContent}
                  >
                    Upload New Receipt
                  </Button>
                )}
              </View>
            )}
            
            <View style={styles.securePaymentContainer}>
              <Ionicons name="lock-closed" size={14} color={Colors.success} style={styles.secureIcon} />
              <Text style={styles.disclaimerText}>
                All receipt information is processed securely
              </Text>
            </View>
          </View>
        </Surface>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Layout.spacing.m,
  },
  fineCard: {
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  officialHeaderContainer: {
    backgroundColor: Colors.primary,
    padding: Layout.spacing.m,
    alignItems: 'center',
    position: 'relative',
    paddingTop: Layout.spacing.l,
    paddingBottom: Layout.spacing.l,
    marginTop: 15,
    borderTopLeftRadius: Layout.borderRadius.medium,
    borderTopRightRadius: Layout.borderRadius.medium,
  },
  crownIcon: {
    position: 'absolute',
    top: -12,
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 1,
  },
  officialBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  officialBadgeText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  fineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.background,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  fineReference: {
    fontSize: 12,
    color: Colors.background,
    opacity: 0.8,
  },
  crownDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.m,
    paddingVertical: Layout.spacing.s,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  fineDescription: {
    paddingHorizontal: Layout.spacing.m,
    textAlign: 'center',
    fontStyle: 'italic',
    color: Colors.bodyText,
    marginBottom: Layout.spacing.m,
    lineHeight: 20,
  },
  fineDetails: {
    backgroundColor: Colors.primaryTransparent,
    padding: Layout.spacing.m,
    marginHorizontal: Layout.spacing.m,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Layout.spacing.m,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.bodyText,
  },
  fineAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error,
  },
  alternativeContainer: {
    padding: Layout.spacing.m,
    marginHorizontal: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: Layout.spacing.s,
  },
  alternativeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 6,
    letterSpacing: 1,
  },
  alternativeText: {
    marginBottom: Layout.spacing.s,
    fontStyle: 'italic',
    color: Colors.bodyText,
    lineHeight: 18,
  },
  donationAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.success,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: Layout.spacing.m,
    color: Colors.primary,
  },
  radioContainer: {
    backgroundColor: Colors.card,
    marginBottom: Layout.spacing.s,
    borderRadius: Layout.borderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  selectedRadioContainer: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.primaryTransparent,
  },
  radioItem: {
    paddingVertical: Layout.spacing.s,
  },
  radioLabel: {
    fontSize: 16,
    color: Colors.bodyText,
  },
  divider: {
    marginVertical: Layout.spacing.m,
  },
  paymentSection: {
    padding: Layout.spacing.m,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.l,
  },
  instructionText: {
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
    color: Colors.bodyText,
  },
  payButton: {
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.small,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  securePaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureIcon: {
    marginRight: 6,
  },
  disclaimerText: {
    textAlign: 'center',
    color: Colors.mutedText,
    fontSize: 12,
    marginBottom: Layout.spacing.s,
    fontStyle: 'italic',
  },
  donationSection: {
    padding: Layout.spacing.m,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: Layout.spacing.l,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Layout.spacing.s,
    marginTop: Layout.spacing.m,
    color: Colors.primary,
  },
  charityContainer: {
    backgroundColor: Colors.background,
    marginBottom: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  selectedCharityContainer: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.primaryTransparent,
  },
  charityItem: {
    paddingVertical: Layout.spacing.xs,
  },
  charityLabel: {
    fontSize: 15,
    color: Colors.bodyText,
  },
  selectedCharityLabel: {
    fontWeight: '600',
    color: Colors.primary,
  },
  receiptArea: {
    marginVertical: Layout.spacing.m,
    padding: Layout.spacing.m,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  receiptImageContainer: {
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Layout.spacing.s,
  },
  receiptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: Layout.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptOverlayText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  uploadText: {
    color: Colors.bodyText,
    marginVertical: Layout.spacing.m,
    fontWeight: '500',
  },
  uploadHint: {
    color: Colors.mutedText,
    fontSize: 12,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: Layout.spacing.s,
    backgroundColor: Colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verificationContainer: {
    marginTop: Layout.spacing.m,
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.small,
  },
  verifyingText: {
    marginBottom: Layout.spacing.s,
    fontWeight: '600',
    color: Colors.primary,
    fontSize: 16,
  },
  verifyingDetailText: {
    color: Colors.bodyText,
    fontSize: 12,
    marginTop: Layout.spacing.s,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  resultContainer: {
    marginTop: Layout.spacing.m,
    alignItems: 'center',
    backgroundColor: `${Colors.primary}05`,
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.small,
  },
  resultIconContainer: {
    marginBottom: Layout.spacing.s,
  },
  resultText: {
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 15,
  },
  successText: {
    color: Colors.success,
    fontWeight: '500',
  },
  errorText: {
    color: Colors.error,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.success,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButton: {
    borderColor: Colors.primary,
  },
}); 