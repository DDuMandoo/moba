// app/promises/_layout.tsx
import { Slot } from 'expo-router';
import AppShell from '@/components/layout/AppShell';

export default function GamesLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
