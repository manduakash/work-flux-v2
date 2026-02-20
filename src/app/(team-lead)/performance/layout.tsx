"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, FolderKanban, ListChecks,
    BarChartHorizontal, Settings, ChevronLeft, Search, Bell,
    Sun, Moon, Menu, ShieldCheck, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/CommonSidebar';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/Navbar';

const leadNavItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/team-lead-dashboard' },
    { icon: Users, label: 'Team Management', href: '/team' },
    { icon: FolderKanban, label: 'Project Oversight', href: '/projects' },
    { icon: ListChecks, label: 'Task Distribution', href: '/tasks' },
    { icon: BarChartHorizontal, label: 'Performance', href: '/performance' },
    { icon: Settings, label: 'Governance', href: '/settings' },
];

export default function LeadDashboardLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { currentUser, logout } = useStore();
    const router = useRouter();

    useEffect(() => setMounted(true), []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
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

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}