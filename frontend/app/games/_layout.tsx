import { Slot } from 'expo-router';
import AppShell from '@/components/layout/AppShell';

export default function WalletLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
