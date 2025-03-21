// src/App.tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Link } from 'expo-router';

const App = () => {
  return (
    <Provider store={store}>
      <Link href="/">Go to Home</Link>
    </Provider>
  );
};

export default App;
