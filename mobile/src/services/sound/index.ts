/* eslint-disable @typescript-eslint/no-require-imports */
import type { AudioPlayer } from 'expo-audio';
import { loadSettings } from '@/features/profile/profile-storage';

// A tiny embedded PCM click keeps core feedback local and avoids network assets.
const CLICK =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAAA';
const players = new Map<string, AudioPlayer>();
let enabled = true;
let configured = false;
async function play(key: string) {
  try {
    // Keep optional native audio out of test/web module initialization.
    const { createAudioPlayer, setAudioModeAsync } =
      require('expo-audio') as typeof import('expo-audio');
    if (!configured) {
      configured = true;
      enabled = (await loadSettings()).soundEffects;
      await setAudioModeAsync({ playsInSilentMode: true });
    }
    if (!enabled) return;
    let player = players.get(key);
    if (!player) {
      player = createAudioPlayer(CLICK);
      players.set(key, player);
    }
    player.seekTo(0);
    player.play();
  } catch {
    /* Audio is optional and must never block practice. */
  }
}
export function setSoundEnabled(value: boolean) {
  enabled = value;
  configured = true;
}
export const sound = {
  tap: () => play('tap'),
  select: () => play('select'),
  correct: () => play('correct'),
  incorrect: () => play('incorrect'),
  combo: () => play('combo'),
  levelUp: () => play('level-up'),
  sessionComplete: () => play('session-complete'),
};
