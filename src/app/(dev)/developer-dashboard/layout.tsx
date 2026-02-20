"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, FolderKanban, CheckSquare, Rocket,
    BarChart3, Settings, ChevronLeft, Search, Bell,
    Sun, Moon, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

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
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

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
            {/* FIX 2: Sidebar is h-full and handles its own internal scroll if items exceed height */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0",
                isCollapsed ? "w-20" : "w-64",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col px-4 py-6">
                    <div className="mb-10 flex items-center gap-3 px-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                            <Rocket size={20} />
                        </div>
                        {!isCollapsed && (
                            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">NexIntel</span>
                        )}
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                className={cn(
                                    "group flex w-full items-center rounded-xl px-3 py-2.5 transition-all",
                                    pathname === item.href
                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <item.icon size={20} className={cn("shrink-0", pathname === item.href ? "text-indigo-600" : "group-hover:text-slate-900 dark:group-hover:text-slate-200")} />
                                {!isCollapsed && <span className="ml-3 text-sm font-bold uppercase tracking-widest">{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="mt-auto hidden lg:flex">
                        <ChevronLeft className={cn("transition-transform", isCollapsed && "rotate-180")} />
                    </Button>
                </div>
            </aside>

            {/* FIX 3: Main Wrapper is flex-1, h-full, and also overflow-hidden to prevent body scroll */}
            <div className="flex flex-1 flex-col h-full overflow-hidden">

                {/* Navbar (Fixed at the top of the content area) */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 md:px-8">
                    <div className="flex items-center gap-4 flex-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="lg:hidden">
                            <Menu size={20} />
                        </Button>
                        <div className="relative max-w-md w-full hidden md:block group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
                            <input
                                placeholder="Search resources..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {mounted && (
                            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell size={18} />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                        </Button>
                        <div className="ml-2 flex items-center gap-3 rounded-xl border border-slate-200 p-1 pl-3 dark:border-slate-800">
                            <span className="hidden text-xs font-black uppercase text-slate-500 lg:block">Dev_Team</span>
                            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs">JS</div>
                        </div>
                    </div>
                </header>

                {/* FIX 4: This is the only scrolling container */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}