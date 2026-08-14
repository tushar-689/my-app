import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalProfile = {
  name: string;
  email: string;
  level: string;
  xp: number;
};
export type LocalSettings = {
  darkMode: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  emailPreferences: boolean;
  language: string;
};

export const defaultProfile: LocalProfile = {
  name: 'Tushar',
  email: 'hello@dmatprep.app',
  level: 'dMAT Explorer',
  xp: 0,
};
export const defaultSettings: LocalSettings = {
  darkMode: false,
  soundEffects: false,
  hapticFeedback: false,
  emailPreferences: true,
  language: 'English',
};
const PROFILE_KEY = '@dmat/profile-v1';
const SETTINGS_KEY = '@dmat/settings-v1';

export async function loadProfile(): Promise<LocalProfile> {
  const value = await AsyncStorage.getItem(PROFILE_KEY);
  if (!value) return defaultProfile;
  try {
    return {
      ...defaultProfile,
      ...(JSON.parse(value) as Partial<LocalProfile>),
    };
  } catch {
    return defaultProfile;
  }
}

export async function saveProfile(profile: LocalProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadSettings(): Promise<LocalSettings> {
  const value = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!value) return defaultSettings;
  try {
    return {
      ...defaultSettings,
      ...(JSON.parse(value) as Partial<LocalSettings>),
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: LocalSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
