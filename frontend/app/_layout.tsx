import React from 'react'
import { Stack } from 'expo-router'
import LayoutInner from './LayoutInner'

export default function RootLayout() {
  return (
    <LayoutInner>
      <Stack>
        <Stack.Screen name="(bottom-navigation)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "모달" }}
        /> */}
      </Stack>
    </LayoutInner>
  )
}
