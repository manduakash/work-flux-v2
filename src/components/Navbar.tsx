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
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Notifications from './Notifications';
import { getCookie } from '@/utils/cookies';


const Navbar = ({ setIsMobileOpen }: { setIsMobileOpen: (value: boolean) => void }) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { logout } = useStore();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const cookieUser = getCookie("user");
        if (cookieUser) setUser(cookieUser);
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-transparent px-4 backdrop-blur-3xl dark:border-slate-800 dark:bg-slate-950/80 md:px-8 relative z-[100]">
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

                <div className="relative">
                    <div 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="ml-2 flex items-center gap-3 rounded-2xl border border-slate-200 p-1.5 pl-4 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-500 transition-all group"
                    >
                        <span className="hidden text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 lg:block group-hover:text-indigo-500 transition-colors">
                            {user?.fullName || user?.name || "Guest User"}
                        </span>
                        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-indigo-600/30">
                            {(user?.fullName || user?.name || "??").substring(0, 2).toUpperCase()}
                        </div>
                        <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                    </div>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-3 w-56 rounded-[2rem] border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900 shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Authorized Session</p>
                                        <p className="text-xs font-bold text-slate-400 mt-1 truncate">{user?.email || "user@workflux.io"}</p>
                                    </div>

                                    <button 
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-500/20"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}


export default Navbar;