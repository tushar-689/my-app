import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultProfile,
  defaultSettings,
  loadProfile,
  loadSettings,
  saveProfile,
  saveSettings,
} from '@/features/profile/profile-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('profile and settings storage', () => {
  beforeEach(() => jest.clearAllMocks());
  it('loads the local profile and persists edits', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ ...defaultProfile, name: 'Asha' }),
    );
    expect((await loadProfile()).name).toBe('Asha');
    await saveProfile({ ...defaultProfile, name: 'Asha' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@dmat/profile-v1',
      expect.stringContaining('Asha'),
    );
  });
  it('loads defaults and persists settings toggles', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await loadSettings()).toEqual(defaultSettings);
    const next = { ...defaultSettings, hapticFeedback: true };
    await saveSettings(next);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@dmat/settings-v1',
      JSON.stringify(next),
    );
  });
});
