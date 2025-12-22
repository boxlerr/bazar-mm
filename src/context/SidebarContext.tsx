'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarContextType {
    isMobileOpen: boolean;
    toggleMobileSidebar: () => void;
    closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const toggleMobileSidebar = () => setIsMobileOpen(prev => !prev);
    const closeMobileSidebar = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider
            value={{
                isMobileOpen,
                toggleMobileSidebar,
                closeMobileSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
