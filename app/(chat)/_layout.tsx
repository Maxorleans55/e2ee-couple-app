import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(chat)/index"
        options={{ headerShown: false, title: 'UsTwo' }}
      />
      <Stack.Screen
        name="(chat)/memories"
        options={{ headerShown: false, title: 'Memories' }}
      />
      <Stack.Screen
        name="(chat)/settings"
        options={{ headerShown: false, title: 'Settings' }}
      />
    </Stack>
  );
}
