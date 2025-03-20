import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, TextInput, RadioButton, ProgressBar, Card, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

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
  const { fineId, amount } = useLocalSearchParams<{ fineId: string; amount: string }>();
  const fineAmount = parseFloat(amount || '5.00');
  const donationAmount = fineAmount * 0.1; // 10% of fine amount
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fine');
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
      title: "Official Fine Payment",
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
      <Card style={styles.fineCard}>
        <Card.Content>
          <Text style={styles.fineTitle}>Official Fine Notice</Text>
          <Text style={styles.fineDescription}>
            You have been fined for missing the official tea time. His Majesty's government requires prompt payment.
          </Text>
          
          <View style={styles.fineDetails}>
            <Text style={styles.detailLabel}>Fine Amount:</Text>
            <Text style={styles.fineAmount}>£{fineAmount.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.alternativeText}>
            Alternatively, you may donate 10% of your fine to an authorized charity.
          </Text>
          
          <View style={styles.fineDetails}>
            <Text style={styles.detailLabel}>Donation Amount:</Text>
            <Text style={styles.donationAmount}>£{donationAmount.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>
      
      <Text style={styles.sectionTitle}>Select Payment Method:</Text>
      
      <RadioButton.Group
        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
        value={paymentMethod}
      >
        <RadioButton.Item
          label={`Pay Fine (£${fineAmount.toFixed(2)})`}
          value="fine"
          style={styles.radioItem}
        />
        <RadioButton.Item
          label={`Make Charitable Donation (£${donationAmount.toFixed(2)})`}
          value="donation"
          style={styles.radioItem}
        />
      </RadioButton.Group>
      
      <Divider style={styles.divider} />
      
      {paymentMethod === 'fine' ? (
        <>
          <Text style={styles.instructionText}>
            Click the button below to process your fine payment securely.
          </Text>
          
          <Button
            mode="contained"
            style={styles.payButton}
            icon="cash"
            onPress={handlePayFine}
          >
            Pay Fine Now
          </Button>
          
          <Text style={styles.disclaimerText}>
            Payment processed securely by Royal Treasury Services.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.instructionText}>
            Please select a charity and upload your donation receipt.
          </Text>
          
          <Text style={styles.sectionSubtitle}>Select Charity:</Text>
          
          <RadioButton.Group
            onValueChange={(value) => setSelectedCharity(value)}
            value={selectedCharity}
          >
            <RadioButton.Item
              label="Royal British Legion"
              value="Royal British Legion"
              style={styles.charityItem}
            />
            <RadioButton.Item
              label="National Trust"
              value="National Trust"
              style={styles.charityItem}
            />
            <RadioButton.Item
              label="Cancer Research UK"
              value="Cancer Research UK"
              style={styles.charityItem}
            />
          </RadioButton.Group>
          
          <Text style={styles.sectionSubtitle}>
            Upload Donation Receipt:
          </Text>
          
          <Card style={styles.receiptCard}>
            <Card.Content>
              {receiptImage ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: receiptImage }}
                    style={styles.receiptImage}
                  />
                  <Button
                    mode="text"
                    icon="refresh"
                    onPress={pickImage}
                    style={styles.reuploadButton}
                  >
                    Change Image
                  </Button>
                </View>
              ) : (
                <Button
                  mode="outlined"
                  icon="upload"
                  onPress={pickImage}
                  style={styles.uploadButton}
                >
                  Select Receipt Image
                </Button>
              )}
              
              {receiptImage && !verificationResult && !isVerifying && (
                <Button
                  mode="contained"
                  icon="check-decagram"
                  onPress={verifyReceipt}
                  style={styles.verifyButton}
                >
                  Verify Receipt
                </Button>
              )}
              
              {isVerifying && (
                <View style={styles.verificationContainer}>
                  <Text style={styles.verifyingText}>
                    Verifying receipt...
                  </Text>
                  <ProgressBar
                    progress={verificationProgress}
                    color={Colors.primary}
                    style={styles.progressBar}
                  />
                </View>
              )}
              
              {verificationResult && (
                <View style={styles.resultContainer}>
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
                    >
                      Upload New Receipt
                    </Button>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
          
          <Text style={styles.receiptNote}>
            Ensure your receipt clearly shows the charity name, donation amount, and date.
          </Text>
        </>
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
  },
  fineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.s,
  },
  fineDescription: {
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  fineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fineAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error,
  },
  alternativeText: {
    marginTop: Layout.spacing.s,
    marginBottom: Layout.spacing.s,
    fontStyle: 'italic',
  },
  donationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: Layout.spacing.m,
    color: Colors.primary,
  },
  radioItem: {
    paddingVertical: Layout.spacing.s,
    backgroundColor: Colors.card,
    marginBottom: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
  },
  divider: {
    marginVertical: Layout.spacing.m,
  },
  instructionText: {
    marginBottom: Layout.spacing.m,
  },
  payButton: {
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.primary,
  },
  disclaimerText: {
    textAlign: 'center',
    color: Colors.mutedText,
    fontSize: 12,
    marginBottom: Layout.spacing.l,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.s,
    marginTop: Layout.spacing.m,
  },
  charityItem: {
    paddingVertical: Layout.spacing.xs,
    backgroundColor: Colors.card,
    marginBottom: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.small,
  },
  receiptCard: {
    marginVertical: Layout.spacing.m,
  },
  imageContainer: {
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: Layout.borderRadius.small,
    marginBottom: Layout.spacing.s,
  },
  reuploadButton: {
    marginBottom: Layout.spacing.s,
  },
  uploadButton: {
    marginVertical: Layout.spacing.m,
  },
  verifyButton: {
    marginTop: Layout.spacing.s,
    backgroundColor: Colors.primary,
  },
  verificationContainer: {
    marginTop: Layout.spacing.m,
    alignItems: 'center',
  },
  verifyingText: {
    marginBottom: Layout.spacing.s,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: Layout.spacing.m,
  },
  resultContainer: {
    marginTop: Layout.spacing.m,
  },
  resultText: {
    marginBottom: Layout.spacing.m,
    textAlign: 'center',
  },
  successText: {
    color: Colors.success,
  },
  errorText: {
    color: Colors.error,
  },
  submitButton: {
    backgroundColor: Colors.success,
  },
  retryButton: {
    marginTop: Layout.spacing.s,
  },
  receiptNote: {
    fontStyle: 'italic',
    color: Colors.mutedText,
    marginBottom: Layout.spacing.l,
    textAlign: 'center',
  },
}); 