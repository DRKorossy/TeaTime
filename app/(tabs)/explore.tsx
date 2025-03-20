import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Divider, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

const TEA_TYPES = [
  {
    name: 'English Breakfast',
    description: 'A robust, full-bodied tea with a rich flavor. Perfect for morning tea time.',
    origin: 'England',
  },
  {
    name: 'Earl Grey',
    description: 'Black tea infused with bergamot oil, giving it a distinctive citrus flavor.',
    origin: 'England',
  },
  {
    name: 'Green Tea',
    description: 'Unoxidized tea with a fresh, grassy flavor. Known for its health benefits.',
    origin: 'China/Japan',
  },
  {
    name: 'Chamomile',
    description: 'A herbal infusion with calming properties. Great for evening relaxation.',
    origin: 'Various',
  },
  {
    name: 'Peppermint',
    description: 'Refreshing herbal tea with a cool, minty flavor. Aids digestion.',
    origin: 'Europe',
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Explore Tea Varieties</Text>
        <Text style={styles.subtitle}>
          Discover the tea types approved by His Majesty for official tea time
        </Text>
        
        <Divider style={styles.divider} />
        
        {TEA_TYPES.map((tea, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <Text style={styles.teaName}>{tea.name}</Text>
              <Text style={styles.teaOrigin}>Origin: {tea.origin}</Text>
              <Text style={styles.teaDescription}>{tea.description}</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="text" icon="information">Learn More</Button>
            </Card.Actions>
          </Card>
        ))}
        
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Tea Time Regulations</Text>
          <Text style={styles.infoText}>
            According to the British Tea Act of 2023, citizens are required to consume tea daily at 5:00 PM.
            Failure to do so may result in fines or mandatory attendance at tea appreciation classes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Layout.spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mutedText,
    marginBottom: Layout.spacing.m,
  },
  divider: {
    marginBottom: Layout.spacing.m,
  },
  card: {
    marginBottom: Layout.spacing.m,
    backgroundColor: Colors.card,
  },
  teaName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.primary,
  },
  teaOrigin: {
    fontSize: 14,
    color: Colors.mutedText,
    marginBottom: 8,
  },
  teaDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  infoSection: {
    backgroundColor: Colors.primaryTransparent,
    padding: Layout.spacing.m,
    borderRadius: Layout.borderRadius.medium,
    marginVertical: Layout.spacing.l,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.s,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
