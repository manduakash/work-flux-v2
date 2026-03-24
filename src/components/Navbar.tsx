"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import {
    Menu, Search, Sun, Moon, Bell,
    Folder,
    Calendar,
    User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Notifications from './Notifications';
import { getCookie } from '@/utils/cookies';


const Navbar = ({ setIsMobileOpen }: { setIsMobileOpen: (value: boolean) => void }) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(getCookie("user"));
        setMounted(true);
    }, []);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-transparent px-4 backdrop-blur-3xl dark:border-slate-800 dark:bg-slate-950/80 md:px-8">
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

                {/* Notification Drawer */}
                {
                    (user?.role_id == 2 || user?.role_id == 3) && <Notifications />
                }

                <div className="ml-2 flex items-center gap-3 rounded-xl border border-slate-200 p-1 pl-3 dark:border-slate-800">
                    <span className="hidden text-xs font-black uppercase text-slate-500 lg:block">Dev_Team</span>
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs">JS</div>
                </div>
            </div>
        </header>
    )
}


export default Navbar;