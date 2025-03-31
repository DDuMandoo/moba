// app/promises/_layout.tsx
import { Slot } from 'expo-router';
import AppShell from '@/components/layout/AppShell';

export default function PromisesLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
