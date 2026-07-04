import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'light' ? 'light' : 'dark';
    });

    const setTheme = (newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setThemeState(newTheme);
            localStorage.setItem('theme', newTheme);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light-theme');
        } else {
            root.classList.remove('light-theme');
        }
    }, [theme]);

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
