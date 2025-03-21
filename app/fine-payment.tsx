import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, TextInput, RadioButton, ProgressBar, Card, IconButton, Surface } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { Ionicons } from '@expo/vector-icons';

// This is the same file as (modals)/fine-payment.tsx, but at the root level
// for direct navigation without the group prefix

// Re-export the component from the modal version
export { default } from './(modals)/fine-payment'; 