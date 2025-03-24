import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import { Slot } from 'expo-router'

interface Props {
  children?: ReactNode
}

export default function LayoutInner({ children }: Props) {
  return (
    <Provider store={store}>
      {children ?? <Slot />}
    </Provider>
  )
}
