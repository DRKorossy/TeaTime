import { Stack } from 'expo-router';
import Colors from '../../constants/Colors';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        presentation: 'modal',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="tea-submission"
        options={{
          title: "Official Tea Submission",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="fine-payment"
        options={{
          title: "Fine Payment",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="donation-payment"
        options={{
          title: "Charity Donation",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
} 