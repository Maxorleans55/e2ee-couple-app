import { Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SafetyNumberVerify } from '@/components/SafetyNumberVerify';
import { Backdrop } from '@/components/ui';
import { useAppStore } from '@/lib/store';

const DEMO_NUMBER = '052147398621043879215604872139054387216095438712069843';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { safetyNumber, isVerified, setIsVerified, partnerName } = useAppStore();
  const number = safetyNumber ?? (process.env.EXPO_PUBLIC_DEMO === '1' ? DEMO_NUMBER + '123456' : null);

  return (
    <Backdrop>
      <ScreenHeader close eyebrow="Safety number" title={`Verify ${partnerName}`} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}>
        <SafetyNumberVerify
          safetyNumber={number}
          partnerName={partnerName}
          isVerified={isVerified}
          onVerify={(ok) => {
            if (ok) {
              setIsVerified(true);
              setTimeout(() => router.back(), 900);
            } else {
              setIsVerified(false);
              Alert.alert(
                'Numbers don’t match',
                'Don’t send anything sensitive. Someone may be intercepting your messages. Reconnect and compare again.'
              );
            }
          }}
        />
      </ScrollView>
    </Backdrop>
  );
}
