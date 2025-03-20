import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
    circular: 1000,
  },
  // Premium UI elements
  card: {
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 0 },
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  cardHeavy: {
    elevation: 8,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  inputField: {
    height: 52,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  // Text styles for premium look
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: 16,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: 0.3,
      marginBottom: 14,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: 0.2,
      marginBottom: 12,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      opacity: 0.7,
    },
  },
}; 