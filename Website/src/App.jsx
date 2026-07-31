import React from 'react';
import AppRouter from './router/AppRouter'
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </div>
  )
}

export default App