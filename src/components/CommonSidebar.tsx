import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard, FolderKanban, CheckSquare, Rocket,
    BarChart3, Settings, ChevronLeft, Search, Bell,
    Sun, Moon, Menu,
    LogOut,
    Users,
    ListChecks,
    BarChartHorizontal,
    Globe,
    Landmark,
    PieChart,
    ShieldAlert,
    UserCircleIcon
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types';
import { useEffect, useState } from 'react';

const Sidebar = ({ isMobileOpen, isCollapsed, setIsCollapsed, pathname, currentUser, handleLogout }: { isMobileOpen: boolean; isCollapsed: boolean; setIsCollapsed: (value: boolean) => void; pathname: string; currentUser: any; handleLogout: () => void }) => {

    const [navItems, setNavItems] = useState<any[]>([]);
    const leadNavItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/team-lead-dashboard' },
        { icon: Users, label: 'Team Management', href: '/team-management' },
        { icon: FolderKanban, label: 'Project Oversight', href: '/project-oversight' },
        { icon: ListChecks, label: 'Task Distribution', href: '/tasks' },
        { icon: BarChartHorizontal, label: 'Performance', href: '/performance' },
        { icon: UserCircleIcon, label: 'Profile', href: '/profile' },
    ];

    const devNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/developer-dashboard' },
        { icon: FolderKanban, label: 'Projects', href: '/projects' },
        { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
        { icon: Rocket, label: 'Deployments', href: '/deployments' },
        { icon: BarChart3, label: 'Reports', href: '/reports' },
        { icon: UserCircleIcon, label: 'Profile', href: '/profile' },
    ];

    const adminNavItems = [
        { icon: LayoutDashboard, label: 'Global Overview', href: '/admin-dashboard' },
        { icon: Globe, label: 'Project Portfolio', href: '/portfolio' },
        { icon: Landmark, label: 'Financials & Burn', href: '/financials' },
        { icon: PieChart, label: 'Resource Analytics', href: '/analytics' },
        { icon: ShieldAlert, label: 'Risk & Compliance', href: '/governance' },
        { icon: UserCircleIcon, label: 'Profile', href: '/profile' },
    ];

    useEffect(() => {
        if (currentUser?.role === 'TEAM_LEAD') {
            setNavItems(leadNavItems);
        } else if (currentUser?.role === 'DEVELOPER') {
            setNavItems(devNavItems);
        } else if (currentUser?.role === 'ADMIN') {
            setNavItems(adminNavItems);
        } else {
            setNavItems([]);
        }
    }, [])

    return (
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
                        <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">Work-Flux</span>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="mt-auto hidden lg:flex">
                        <ChevronLeft className={cn("transition-transform", isCollapsed && "rotate-180")} />
                    </Button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                    {navItems?.map((item: any) => (
                        <Link
                            href={item.href}
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
                        </Link>
                    ))}
                </nav>

                {!isCollapsed && <div className="rounded-2xl mt-2 border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
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
                </div>}
            </div>
        </aside>
    )
}

export default Sidebar