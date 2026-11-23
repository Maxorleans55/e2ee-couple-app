import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        options={{
          headerShown: false,
          statusBarStyle:
            colorScheme === 'dark' ? 'light-content' : 'dark-content',
        }}
      >
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(setup)" />
          <Stack.Screen name="(chat)" />
        </Stack.Group>
      </Stack.Screen>
      <StatusBar style="auto" />
    </Stack>
  );
}
