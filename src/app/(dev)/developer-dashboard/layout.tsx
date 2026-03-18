"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, FolderKanban, CheckSquare,
    Rocket,
    BarChart3,
    Settings
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/CommonSidebar';
import { getCookie } from '@/utils/cookies';
import Loader from './loading';
import Page from './page';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const { logout } = useStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    useEffect(() => setMounted(true), []);


    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const user = getCookie("user");
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    return (
        // FIX 1: Set the parent to h-screen and overflow-hidden
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isMobileOpen={isMobileOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} pathname={pathname} currentUser={currentUser} handleLogout={handleLogout} />

            {/* Main Wrapper */}
            <div className="flex flex-1 flex-col h-full overflow-hidden">

                {/* Navbar */}
                <Navbar setIsMobileOpen={setIsMobileOpen} />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                    {/* 1. Modern Noise/Grain Texture */}
                    <div
                        className="absolute inset-0 opacity-[0.2] pointer-events-none bg-fixed"
                        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/diagonal-striped-brick.png")' }}
                    />
                    <div className='absolute inset-0 overflow-y-auto p-8 custom-scrollbar z-10'>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}