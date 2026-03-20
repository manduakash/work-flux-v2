import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard, FolderKanban, CheckSquare, Rocket,
    BarChart3, Settings, ChevronLeft, Search, Bell,
    Sun, Moon, Menu,
    LogOut,
    Users,
    ShieldCheck,
    ListChecks,
    BarChartHorizontal,
    Globe,
    Landmark,
    PieChart,
    ShieldAlert,
    UserCircleIcon,
    Plus,
    Users2
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types';
import { useEffect, useState } from 'react';
import { getCookie } from '@/utils/cookies';

// SVG Dot Pattern
const patternDots = `url("https://www.transparenttextures.com/patterns/padded-light.png")`;

const Sidebar = ({ isMobileOpen, isCollapsed, setIsCollapsed, pathname, currentUser, handleLogout }: { isMobileOpen: boolean; isCollapsed: boolean; setIsCollapsed: (value: boolean) => void; pathname: string; currentUser: any; handleLogout: () => void }) => {

    const [navItems, setNavItems] = useState<any[]>([]);

    const leadNavItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/team-lead-dashboard' },
        { icon: Plus, label: 'Add Project', href: '/project-create' },
        { icon: FolderKanban, label: 'Project Oversight', href: '/project-oversight' },
        { icon: Users, label: 'User Management', href: '/team' },
        { icon: ShieldCheck, label: 'Project Assignments', href: '/team-management' },
        { icon: ListChecks, label: 'Task Management', href: '/create-manage-task' },
        { icon: UserCircleIcon, label: 'Profile', href: '/profile' },
    ];

    const devNavItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/developer-dashboard' },
        { icon: ListChecks, label: 'My Tasks', href: '/create-manage-task' },
        { icon: UserCircleIcon, label: 'Profile', href: '/profile' },
    ];

    const adminNavItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/admin-dashboard' },
        { icon: PieChart, label: 'Analytics', href: '/analytics' },
        { icon: Globe, label: 'Reports', href: '/reports' },
        // { icon: Landmark, label: 'Finance', href: '/financials' },
        // { icon: ShieldAlert, label: 'Settings', href: '/governance' },
        { icon: Users2, label: 'User Management', href: '/team' },
        { icon: UserCircleIcon, label: 'Profile', href: '/profile' },
    ];

    useEffect(() => {
        const roleIdRaw = getCookie("role_id");
        const roleId = currentUser?.role_id || (roleIdRaw ? parseInt(roleIdRaw) : null);

        if (roleId === 2) {
            setNavItems(leadNavItems);
        } else if (roleId === 3) {
            setNavItems(devNavItems);
        } else if (roleId === 1) {
            setNavItems(adminNavItems);
        } else {
            // Robust fallback if role_id is not yet set or unavailable
            const role = currentUser?.role || getCookie("role");
            if (role === 'TEAM_LEAD') {
                setNavItems(leadNavItems);
            } else if (role === 'DEVELOPER') {
                setNavItems(devNavItems);
            } else if (role === 'MANAGEMENT') {
                setNavItems(adminNavItems);
            } else {
                setNavItems([]);
            }
        }
    }, [currentUser])

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-indigo-500/80 border-r-4 bg-indigo-950 transition-all duration-75 dark:border-[#0a0f24] dark:bg-[#060913] lg:static lg:translate-x-0 relative overflow-show",
            isCollapsed ? "w-20" : "w-64",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Background Pattern Layer */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{ backgroundImage: patternDots }}
            />

            {/* Content Container (z-10 ensures it stays above the pattern) */}
            <div className="relative z-10 flex h-full flex-col px-4 py-6">
                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                        <Rocket size={20} />
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-black tracking-tighter text-white uppercase">Project Management</span>
                    )}
                    <Button size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className={cn("cursor-pointer mt-auto duration-75 hidden lg:flex text-indigo-300 bg-gradient-tr", isCollapsed ? "hover:bg-slate-50 hover:text-indigo-800 hover:border hover:border-indigo-950/10" : "bg-indigo-900 hover:bg-indigo-900 hover:text-white")}>
                        <ChevronLeft className={cn("transition-transform", isCollapsed && "rotate-180")} />
                    </Button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                    {navItems?.map((item: any) => (
                        <Link
                            href={item.href}
                            key={item.label}
                            className={cn(
                                "group flex w-full items-center rounded-xl px-3 py-2.5 transition-all duration-200",
                                pathname === item.href
                                    ? "bg-indigo-600 shadow-md shadow-indigo-900/20 text-white"
                                    : "text-indigo-200/70 hover:bg-indigo-900/50 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={cn("shrink-0 transition-colors", pathname === item.href ? "text-white" : "text-indigo-400/70 group-hover:text-white")} />
                            {!isCollapsed && <span className="ml-3 text-sm font-bold uppercase tracking-widest">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {!isCollapsed && <div className="rounded-2xl mt-2 border border-indigo-800/50 bg-indigo-900/20 p-3 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-[13px] font-bold text-indigo-300 shadow-sm border border-indigo-700/50">
                            {(() => {
                                const localImg = typeof window !== 'undefined' ? localStorage.getItem('profile_image') : null;
                                const avatarUrl = currentUser?.avatar || currentUser?.profile_image || (localImg !== "null" && localImg !== "undefined" ? localImg : null);

                                if (avatarUrl) {
                                    return (
                                        <img
                                            src={avatarUrl}
                                            className="h-full w-full object-cover rounded-full ring-2 ring-indigo-500 shadow-sm"
                                            alt="Profile"
                                        />
                                    );
                                }
                                return (
                                    <div className="h-full w-full flex items-center justify-center bg-indigo-800 text-indigo-100 font-black text-xs rounded-full uppercase tracking-tighter">
                                        {(currentUser?.name || currentUser?.username || "??").substring(0, 2)}
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-white">
                                {currentUser?.name || currentUser?.username || "Guest User"}
                            </p>
                            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-indigo-300/80">
                                {currentUser?.role?.replace('_', ' ')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleLogout()}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 py-2 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>}
            </div>
        </aside>
    )
}

export default Sidebar