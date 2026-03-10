import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ isDark: true, toggleTheme: () => { } });

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('kk-theme');
        return saved !== null ? saved === 'dark' : true; // default: dark
    });

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('kk-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(d => !d);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
