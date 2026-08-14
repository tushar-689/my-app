import { render } from '@testing-library/react-native';

import { ThemedText } from '@/components/ui/themed-text';

describe('ThemedText', () => {
  it('renders the supplied text', async () => {
    const view = await render(
      <ThemedText>Hello from the existing component</ThemedText>,
    );

    expect(
      view.getByText('Hello from the existing component'),
    ).toBeOnTheScreen();
  });
});
