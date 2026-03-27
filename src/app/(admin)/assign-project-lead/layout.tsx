"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/CommonSidebar';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';

export default function AssignProjectLeadLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const { currentUser, logout } = useStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!mounted) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <Sidebar isMobileOpen={isMobileOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} pathname={pathname} currentUser={currentUser} handleLogout={handleLogout} />


            {/* Content Wrapper */}
            <div className="flex flex-1 flex-col h-full overflow-hidden">

                {/* Navbar */}
                <Navbar setIsMobileOpen={setIsMobileOpen} />

                <main className="flex-1 overflow-y-auto custom-scrollbar z-0 relative h-full">
                    <div
                        className="absolute inset-0 opacity-[0.6] dark:opacity-30 pointer-events-none bg-fixed"
                        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dimension.png")' }}
                    />

                    <div className='absolute inset-0 overflow-y-auto p-4 md:p-8 custom-scrollbar z-10'>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
