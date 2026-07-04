import React from 'react';
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <div>
      <AuthProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </AuthProvider>
    </div>
  )
}

export default App