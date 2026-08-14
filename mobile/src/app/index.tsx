import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { ONBOARDING_COMPLETE_KEY } from '@/features/onboarding/onboarding-storage';

export default function LaunchRoute() {
  const [destination, setDestination] = useState<'onboarding' | 'home' | null>(
    null,
  );

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY).then((value) => {
      setDestination(value === 'true' ? 'home' : 'onboarding');
    });
  }, []);

  if (destination === 'onboarding')
    return <Redirect href={'/onboarding' as never} />;
  if (destination === 'home') return <Redirect href={'/(tabs)' as never} />;

  return (
    <View style={styles.loading}>
      <ActivityIndicator color={Colors.light.greenDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
});
