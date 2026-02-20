"use client";

import React, { useState, useEffect } from 'react';
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

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/developer-dashboard' },
    { icon: FolderKanban, label: 'Projects', href: '/projects' },
    { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
    { icon: Rocket, label: 'Deployments', href: '/deployments' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const { currentUser, logout } = useStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    useEffect(() => setMounted(true), []);

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
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}