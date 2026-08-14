import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { ProgressBar } from '@/components/ui/progress-bar';
import { SectionTabs } from '@/components/ui/section-tabs';
import { ThemedText } from '@/components/ui/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { NativeAdPlaceholder } from '@/features/ads/components';

const coreModules = [
  ['✦', 'Figure Sequences', 'No attempts yet', 0, 'purple'],
  ['=', 'Mathematical Equations', '0 / 40', 0, 'green'],
  ['▣', 'Latin Squares', '0 / 40', 0, 'orange'],
  ['▧', 'Connected Figures', 'Unavailable', 0, 'yellow'],
  ['●', 'Row & Column Logic', 'Unavailable', 0, 'green'],
  ['▦', 'Matrix Reasoning', 'Unavailable', 0, 'orange'],
  ['⌁', 'Rules & Relations', 'Unavailable', 0, 'pink'],
] as const;

export function PracticeScreen() {
  const theme = useTheme();
  const [active, setActive] = useState('Core Module');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const isCore = active === 'Core Module';
  const descriptions: Record<string, string> = {
    'Figure Sequences': 'Spot movement, rotation, and pattern rules.',
    'Mathematical Equations': 'Solve number systems under pressure.',
    'Latin Squares': 'Complete grids with clean logical deductions.',
  };
  const visibleModules = coreModules.filter(([, name]) => {
    const matchesSearch = `${name} ${descriptions[name] ?? ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Live'
        ? [
            'Figure Sequences',
            'Mathematical Equations',
            'Latin Squares',
          ].includes(name)
        : ![
            'Figure Sequences',
            'Mathematical Equations',
            'Latin Squares',
          ].includes(name));
    return matchesSearch && matchesFilter;
  });

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <ThemedText type="label" themeColor="muted">
            YOUR PREP PLAN
          </ThemedText>
          <ThemedText type="title">Practice</ThemedText>
        </View>
        <ThemedText type="title" accessibilityLabel="Search">
          ⌕
        </ThemedText>
      </View>
      <SectionTabs
        items={['Core Module', 'Special Module']}
        active={active}
        onChange={setActive}
      />
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Search practice modules"
          value={query}
          onChangeText={setQuery}
          placeholder="Search modules"
          placeholderTextColor={theme.textMuted}
          style={[
            styles.search,
            { color: theme.textPrimary, borderColor: theme.border },
          ]}
        />
        {query.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery('')}
          >
            <ThemedText type="button">Clear</ThemedText>
          </Pressable>
        )}
      </View>
      {isCore && (
        <SectionTabs
          items={['All', 'Live', 'Unavailable']}
          active={filter}
          onChange={setFilter}
        />
      )}
      {isCore && (
        <AppCard color="accentGreen" style={styles.focusCard}>
          <View>
            <ThemedText type="label">TODAY&apos;S FOCUS</ThemedText>
            <ThemedText type="hero">Make the next move.</ThemedText>
            <ThemedText type="caption">
              Three cognitive tasks. One sharper you.
            </ThemedText>
          </View>
          <ThemedText type="display">↗</ThemedText>
        </AppCard>
      )}
      {isCore ? (
        <>
          <ThemedText
            type="label"
            themeColor="muted"
            style={styles.sectionLabel}
          >
            CORE MODULES
          </ThemedText>
          {visibleModules.map(([icon, name, count, progress, color]) => (
            <ModuleCard
              key={name}
              icon={icon}
              name={name}
              count={count}
              progress={progress}
              color={color}
              description={descriptions[name]}
              onPress={
                name === 'Figure Sequences' ||
                name === 'Mathematical Equations' ||
                name === 'Latin Squares'
                  ? () =>
                      router.push(
                        (name === 'Figure Sequences'
                          ? '/practice/figure-sequences'
                          : name === 'Mathematical Equations'
                            ? '/practice/mathematical-equations'
                            : '/practice/latin-squares') as never,
                      )
                  : undefined
              }
            />
          ))}
          <NativeAdPlaceholder />
          {visibleModules.length === 0 && (
            <AppCard color="surface" style={styles.emptySearch}>
              <ThemedText type="title">No modules found.</ThemedText>
              <ThemedText themeColor="muted">
                Try a different search.
              </ThemedText>
            </AppCard>
          )}
        </>
      ) : (
        <ComingSoonState
          title="Special modules are coming soon"
          body="We’re shaping focused challenges for the next stage of your prep."
          color="yellow"
        />
      )}
    </AppScreen>
  );
}

function ModuleCard({
  icon,
  name,
  count,
  progress,
  description,
  color,
  onPress,
}: {
  icon: string;
  name: string;
  count: string;
  progress: number;
  description?: string;
  color: keyof typeof Colors.light;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const card = (
    <AppCard
      color={
        onPress
          ? color === 'purple'
            ? 'accentPurple'
            : color === 'orange'
              ? 'accentYellow'
              : 'surface'
          : 'surface'
      }
      style={styles.module}
    >
      <View style={[styles.moduleIcon, { backgroundColor: theme[color] }]}>
        <ThemedText type="title">{icon}</ThemedText>
      </View>
      <View style={styles.moduleInfo}>
        <View style={styles.nameRow}>
          <ThemedText type="button">{name}</ThemedText>
          {!onPress && (
            <ThemedText type="caption" themeColor="muted">
              Coming soon
            </ThemedText>
          )}
        </View>
        {description && (
          <ThemedText type="caption" themeColor="muted">
            {description}
          </ThemedText>
        )}
        <ProgressBar value={progress} color={theme[color]} />
        <ThemedText type="caption" themeColor="muted">
          {count} questions attempted
        </ThemedText>
      </View>
      <ThemedText type="label">{onPress ? '›' : '—'}</ThemedText>
    </AppCard>
  );

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Start ${name}`}
      onPress={onPress}
    >
      {card}
    </Pressable>
  ) : (
    <View accessibilityLabel={`${name}, coming soon`}>{card}</View>
  );
}

export function ComingSoonState({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: keyof typeof Colors.light;
}) {
  const theme = useTheme();
  return (
    <AppCard color={color} style={styles.empty}>
      <View style={[styles.emptyMark, { backgroundColor: theme.surface }]}>
        <ThemedText type="display">✦</ThemedText>
      </View>
      <ThemedText type="title" style={styles.emptyTitle}>
        {title}
      </ThemedText>
      <ThemedText themeColor="muted" style={styles.emptyBody}>
        {body}
      </ThemedText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.five,
  },
  sectionLabel: { marginTop: Spacing.six, marginBottom: Spacing.three },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  search: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1.5,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.light.surface,
  },
  emptySearch: { marginTop: Spacing.four, gap: Spacing.two },
  focusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.five,
    minHeight: 126,
    gap: Spacing.three,
  },
  module: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    padding: Spacing.three,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleInfo: { flex: 1, gap: Spacing.two },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  empty: {
    marginTop: Spacing.six,
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
  },
  emptyMark: {
    width: 84,
    height: 84,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.five,
  },
  emptyTitle: { textAlign: 'center', fontSize: 24 },
  emptyBody: { textAlign: 'center', marginTop: Spacing.three, maxWidth: 250 },
});
