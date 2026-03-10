import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext({ collapsed: false, setCollapsed: () => { } });

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem('kk-sidebar-collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const [mobileOpen, setMobileOpen] = useState(false);

    const toggle = () => {
        setCollapsed(prev => {
            const next = !prev;
            try { localStorage.setItem('kk-sidebar-collapsed', String(next)); } catch { }
            return next;
        });
    };

    return (
        <SidebarContext.Provider value={{ collapsed, toggle, mobileOpen, setMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    );
};
