import { Stack } from 'expo-router';

export default function SetupLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(setup)/index"
        options={{ headerShown: false, title: 'Setup' }}
      />
      <Stack.Screen
        name="(setup)/verify"
        options={{ headerShown: false, title: 'Verify' }}
      />
    </Stack>
  );
}
