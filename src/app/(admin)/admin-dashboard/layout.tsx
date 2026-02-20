"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Globe, Briefcase, PieChart,
    ShieldAlert, Settings, ChevronLeft, Search, Bell,
    Sun, Moon, Menu, Gavel, Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

const adminNavItems = [
    { icon: LayoutDashboard, label: 'Global Overview', href: '/admin-dashboard' },
    { icon: Globe, label: 'Project Portfolio', href: '/portfolio' },
    { icon: Landmark, label: 'Financials & Burn', href: '/financials' },
    { icon: PieChart, label: 'Resource Analytics', href: '/analytics' },
    { icon: ShieldAlert, label: 'Risk & Compliance', href: '/governance' },
    { icon: Settings, label: 'System Settings', href: '/settings' },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {isMobileOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0",
                isCollapsed ? "w-20" : "w-64",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-full flex-col px-4 py-6">
                    <div className="mb-10 flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/30">
                            <Gavel size={22} />
                        </div>
                        {!isCollapsed && <span className="text-xl font-black tracking-tighter uppercase dark:text-white">AdminHub</span>}
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto">
                        {adminNavItems.map((item) => (
                            <button
                                key={item.label}
                                className={cn(
                                    "group flex w-full items-center rounded-xl px-3 py-3 transition-all",
                                    pathname === item.href
                                        ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <item.icon size={20} className={cn("shrink-0", pathname === item.href ? "text-violet-600" : "group-hover:text-slate-900 dark:group-hover:text-slate-200")} />
                                {!isCollapsed && <span className="ml-3 text-xs font-black uppercase tracking-widest">{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="mt-auto hidden lg:flex">
                        <ChevronLeft className={cn("transition-transform", isCollapsed && "rotate-180")} />
                    </Button>
                </div>
            </aside>

            <div className="flex flex-1 flex-col h-full overflow-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="flex items-center gap-4 flex-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="lg:hidden"><Menu size={20} /></Button>
                        <div className="relative max-w-md w-full hidden md:block group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input placeholder="Search portfolio, financial logs, or departments..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 text-xs font-bold outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-800 dark:bg-slate-900" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {mounted && (
                            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </Button>
                        )}
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-1 pl-3 dark:border-slate-800">
                            <div className="text-right hidden sm:block leading-tight">
                                <p className="text-[10px] font-black uppercase text-violet-600">Executive VP</p>
                                <p className="text-xs font-bold dark:text-white">Marcus Thorne</p>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center font-black text-white text-xs text-center dark:bg-violet-600">MT</div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-950/50 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}