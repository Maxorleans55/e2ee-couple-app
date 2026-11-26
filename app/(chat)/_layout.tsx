import { Stack } from 'expo-router';
import { useTheme } from '@/lib/theme';

export default function ChatLayout() {
  const c = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="chat" />
      <Stack.Screen name="memories" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="verify" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
