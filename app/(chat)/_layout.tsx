import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'UsTwo',
        }}
      >
        <Stack.Screen name="(chat)/index" />
        <Stack.Screen name="(chat)/memories" />
      </Stack.Screen>
    </Stack>
  );
}
