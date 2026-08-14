import { Vibration } from 'react-native';
import { loadSettings } from '@/features/profile/profile-storage';

let enabled = true;
let initialized = false;
async function isEnabled() {
  if (!initialized) {
    initialized = true;
    enabled = (await loadSettings()).hapticFeedback;
  }
  return enabled;
}
export const haptics = {
  async tap() {
    if (await isEnabled()) Vibration.vibrate(8);
  },
  async selection() {
    if (await isEnabled()) Vibration.vibrate(12);
  },
  async correct() {
    if (await isEnabled()) Vibration.vibrate([0, 18, 24, 18]);
  },
  async incorrect() {
    if (await isEnabled()) Vibration.vibrate(30);
  },
  async combo() {
    if (await isEnabled()) Vibration.vibrate([0, 15, 20, 25]);
  },
  async levelUp() {
    if (await isEnabled()) Vibration.vibrate([0, 20, 30, 35]);
  },
  async sessionComplete() {
    if (await isEnabled()) Vibration.vibrate([0, 15, 25, 35]);
  },
};

export function setHapticsEnabled(value: boolean) {
  enabled = value;
  initialized = true;
}
