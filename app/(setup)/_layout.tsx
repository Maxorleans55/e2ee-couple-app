import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    <Stack>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'Setup',
        }}
      >
        <Stack.Screen name="(setup)/index" />
      </Stack.Screen>
    </Stack>
  );
}
