import React, { useState } from 'react';
import { StyleSheet, View, Image, ScrollView, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { Text, Card, Button, Surface, Divider, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// Extended tea types with more options
const TEA_TYPES = [
  {
    id: '1',
    name: 'Black Tea',
    origin: 'China',
    description: 'Fully oxidized tea with a strong, rich flavor. Known for its high caffeine content and robust character.',
    icon: 'tea',
    imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9',
    varieties: ['Earl Grey', 'English Breakfast', 'Darjeeling', 'Assam'],
    brewingTemp: '95°C',
    brewingTime: '3-5 minutes',
    longDescription: 'Black tea is the most oxidized tea type, resulting in a stronger flavor and higher caffeine content than other teas. It was first produced in China but is now cultivated worldwide, with major producers including India, Sri Lanka, and Kenya. The leaves undergo withering, rolling, oxidation, and drying, creating the characteristic dark color and robust taste. Black tea contains antioxidants, particularly theaflavins and thearubigins, which have been linked to various health benefits.'
  },
  {
    id: '2',
    name: 'Green Tea',
    origin: 'China, Japan',
    description: 'Unoxidized tea with a fresh, grassy flavor. Contains high levels of antioxidants and moderate caffeine.',
    icon: 'leaf',
    imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5',
    varieties: ['Sencha', 'Matcha', 'Longjing', 'Gyokuro'],
    brewingTemp: '75-80°C',
    brewingTime: '2-3 minutes',
    longDescription: 'Green tea is made from unoxidized leaves of the Camellia sinensis plant. After harvesting, the leaves are quickly heated to prevent oxidation, preserving their natural green color and delicate flavors. This minimal processing helps retain high levels of polyphenols and antioxidants, particularly catechins like EGCG, which have been extensively studied for their potential health benefits. Green tea has been a staple in traditional medicine in China and Japan for centuries.'
  },
  {
    id: '3',
    name: 'Oolong Tea',
    origin: 'China, Taiwan',
    description: 'Partially oxidized tea with a complex flavor profile that ranges from light and floral to dark and toasty.',
    icon: 'flower',
    imageUrl: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256',
    varieties: ['Tie Guan Yin', 'Da Hong Pao', 'Dong Ding', 'Oriental Beauty'],
    brewingTemp: '85-95°C',
    brewingTime: '3-5 minutes',
    longDescription: 'Oolong tea represents the middle ground between green and black teas in terms of oxidation, typically ranging from 10% to 80%. This partial oxidation creates a remarkable diversity of flavors and aromas. The production process involves withering, bruising, partial oxidation, and firing steps that are carefully controlled to achieve the desired characteristics. Oolong teas from the Fujian province in China and high mountain regions of Taiwan are particularly prized for their exceptional quality and complex flavor profiles.'
  },
  {
    id: '4',
    name: 'White Tea',
    origin: 'China',
    description: 'Minimally processed tea with a delicate, subtle flavor. Contains high antioxidants and low caffeine.',
    icon: 'leaf-maple',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
    varieties: ['Silver Needle', 'White Peony', 'Long Life Eyebrow', 'Tribute Eyebrow'],
    brewingTemp: '70-75°C',
    brewingTime: '4-5 minutes',
    longDescription: 'White tea is the least processed of all tea varieties, made from young leaves and buds that are simply withered and dried with minimal oxidation. This gentle processing preserves the natural appearance and delicate flavors of the tea, resulting in a pale color and subtle, sweet taste. Originally produced in the Fujian province of China, white tea was so valued that it was only offered as a tribute to the emperor. It contains high levels of antioxidants and generally has lower caffeine content than other teas.'
  },
  {
    id: '5',
    name: 'Pu-erh Tea',
    origin: 'Yunnan, China',
    description: 'Fermented and aged tea with an earthy, woody flavor that develops complexity over time, similar to fine wine.',
    icon: 'leaf-circle',
    imageUrl: 'https://images.unsplash.com/photo-1565799603-048b2473a9bf',
    varieties: ['Sheng (Raw)', 'Shou (Ripe)', 'Tuo Cha', 'Beeng Cha (Cake)'],
    brewingTemp: '95-100°C',
    brewingTime: '2-5 minutes',
    longDescription: 'Pu-erh tea is a unique category of post-fermented tea that originates exclusively from Yunnan province in China. Unlike other teas, pu-erh is aged, sometimes for decades, developing deeper and more complex flavors over time. There are two main types: Sheng (raw) pu-erh, which ages naturally, and Shou (ripe) pu-erh, which undergoes accelerated fermentation. Traditionally compressed into cakes, bricks, or other shapes, pu-erh teas are collected and valued similarly to vintage wines, with some rare aged specimens fetching extraordinary prices.'
  },
  {
    id: '6',
    name: 'Herbal Tea',
    origin: 'Global',
    description: 'Not true tea, but infusions made from herbs, flowers, fruits, and spices. Caffeine-free with diverse flavors.',
    icon: 'flower-tulip',
    imageUrl: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570',
    varieties: ['Chamomile', 'Peppermint', 'Rooibos', 'Hibiscus'],
    brewingTemp: '100°C',
    brewingTime: '5-7 minutes',
    longDescription: 'Herbal teas, or tisanes, are not true teas as they don\'t contain leaves from the Camellia sinensis plant. Instead, they are infusions made from a wide variety of herbs, flowers, fruits, spices, and other plant materials. Naturally caffeine-free, herbal teas have been used in traditional medicine across cultures for thousands of years. Each variety offers distinct flavors and potential health properties – from the calming effects of chamomile to the refreshing qualities of peppermint, or the fruity tartness of hibiscus. The diversity of herbal infusions is virtually limitless.'
  },
];

// Define the TeaType interface
interface TeaType {
  id: string;
  name: string;
  origin: string;
  description: string;
  icon: string;
  imageUrl: string;
  varieties: string[];
  brewingTemp: string;
  brewingTime: string;
  longDescription: string;
}

export default function ExploreScreen() {
  const [expandedTea, setExpandedTea] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const windowWidth = Dimensions.get('window').width;
  
  const toggleExpand = (id: string) => {
    setExpandedTea(expandedTea === id ? null : id);
  };
  
  const handleLearnMore = (id: string) => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      toggleExpand(id);
    }, 800);
  };
  
  const renderTeaCard = ({ item }: { item: TeaType }) => {
    const isExpanded = expandedTea === item.id;
    
    return (
      <Card 
        style={[styles.teaCard, isExpanded && styles.expandedCard]} 
        mode="elevated"
      >
        <View style={styles.teaImageContainer}>
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.teaImage} 
            resizeMode="cover" 
          />
          <View style={styles.teaOverlay} />
          <Text style={styles.teaName}>{item.name}</Text>
        </View>
        
        <Card.Content style={styles.teaContent}>
          <View style={styles.originRow}>
            <MaterialCommunityIcons 
              name="map-marker" 
              size={16} 
              color={Colors.accent} 
            />
            <Text style={styles.originText}>{item.origin}</Text>
          </View>
          
          <Text style={styles.descriptionText}>{item.description}</Text>
          
          <View style={styles.varietiesContainer}>
            {item.varieties.map((variety: string, index: number) => (
              <Chip 
                key={index} 
                style={styles.varietyChip}
                textStyle={styles.varietyChipText}
              >
                {variety}
              </Chip>
            ))}
          </View>
          
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
              
              <View style={styles.brewingInfo}>
                <View style={styles.brewingDetail}>
                  <MaterialCommunityIcons 
                    name="thermometer" 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.brewingLabel}>Temperature</Text>
                  <Text style={styles.brewingValue}>{item.brewingTemp}</Text>
                </View>
                
                <View style={styles.brewingDetail}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={20} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.brewingLabel}>Brew Time</Text>
                  <Text style={styles.brewingValue}>{item.brewingTime}</Text>
                </View>
              </View>
              
              <Text style={styles.longDescription}>{item.longDescription}</Text>
            </View>
          )}
          
          <Button 
            mode={isExpanded ? "outlined" : "contained"} 
            onPress={() => handleLearnMore(item.id)}
            style={styles.learnButton}
            icon={isExpanded ? "chevron-up" : "chevron-down"}
            loading={isLoading}
          >
            {isExpanded ? "Show Less" : "Learn More"}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tea Encyclopedia</Text>
      </View>
      
      <FlatList
        data={TEA_TYPES}
        renderItem={renderTeaCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.teaList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Surface style={styles.introCard} elevation={2}>
            <Text style={styles.introTitle}>The Royal Tea Guide</Text>
            <Text style={styles.introText}>
              Explore the rich world of tea with our comprehensive guide. 
              Discover different varieties, their origins, and how to brew the perfect cup.
            </Text>
            <View style={styles.teaCupAnimation}>
              <MaterialCommunityIcons 
                name="tea" 
                size={48} 
                color={Colors.primary} 
              />
            </View>
          </Surface>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  teaList: {
    padding: 16,
  },
  introCard: {
    padding: 20,
    borderRadius: Layout.borderRadius.medium,
    marginBottom: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.bodyText,
    textAlign: 'center',
    marginBottom: 16,
  },
  teaCupAnimation: {
    alignItems: 'center',
    marginTop: 8,
  },
  teaCard: {
    marginBottom: 20,
    borderRadius: Layout.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expandedCard: {
    marginBottom: 24,
  },
  teaImageContainer: {
    height: 180,
    position: 'relative',
  },
  teaImage: {
    width: '100%',
    height: '100%',
  },
  teaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  teaName: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  teaContent: {
    padding: 16,
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.bodyText,
    marginBottom: 16,
  },
  varietiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  varietyChip: {
    margin: 4,
    backgroundColor: `${Colors.primary}15`,
  },
  varietyChipText: {
    color: Colors.primary,
    fontSize: 12,
  },
  expandedContent: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: Colors.border,
  },
  brewingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: `${Colors.primary}05`,
    borderRadius: Layout.borderRadius.small,
    padding: 12,
  },
  brewingDetail: {
    alignItems: 'center',
  },
  brewingLabel: {
    color: Colors.mutedText,
    fontSize: 12,
    marginTop: 4,
  },
  brewingValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  longDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.bodyText,
    marginBottom: 16,
  },
  learnButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
});
