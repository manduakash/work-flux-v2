"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Users,
    LogOut,
    Moon,
    Sun,
    Bell,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useStore } from '@/store/useStore';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";
import { useEffect, useState } from 'react';

export const Sidebar = () => {
    const { currentUser, logout, isDarkMode, toggleDarkMode } = useStore();
    const pathname = usePathname();
    const router = useRouter();

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Or a skeleton/placeholder
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: FolderKanban, label: 'Projects', path: '/projects' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    ];

    if (currentUser?.role === UserRole.MANAGEMENT || currentUser?.role === UserRole.TEAM_LEAD) {
        menuItems.push({ icon: Users, label: 'Team', path: '/team' });
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex h-full flex-col px-4 py-6">

                {/* Brand Logo */}
                <div className="mb-8 flex items-center px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                        <FolderKanban size={20} strokeWidth={2.5} />
                    </div>
                    <span className="ml-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        WorkFlux
                    </span>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.path} href={item.path}>
                                <div className={cn(
                                    "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                                )}>
                                    <item.icon className={cn(
                                        "mr-3 h-5 w-5 transition-colors",
                                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                    )} />
                                    {item.label}

                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute left-0 h-5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="mt-auto space-y-4">

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 px-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-[18px] w-[18px] text-yellow-500 transition-all" />
                            ) : (
                                <Moon className="h-[18px] w-[18px] text-slate-700 transition-all" />
                            )}
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Bell size={18} />
                        </Button>
                    </div>

                    {/* User Profile Card */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[13px] font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                {currentUser?.name.charAt(0) || "AS"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                    {currentUser?.name || "Akash Singh"}
                                </p>
                                <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                    {currentUser?.role.replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/30 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-900/20"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};