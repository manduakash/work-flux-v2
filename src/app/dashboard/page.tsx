"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, CheckCircle2, AlertCircle, Clock,
    ArrowUpRight, ArrowDownRight, Activity, FolderKanban,
    ShieldCheck, Zap, Target, MoreHorizontal,
    ChevronRight
} from 'lucide-react';

import { useStore } from '@/store/useStore'; // Ensure this path matches your project
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import { UserRole, ProjectStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <motion.div
        variants={itemVariants}
        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900/50"
    >
        <div className="flex items-center justify-between">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110", color)}>
                <Icon className="h-6 w-6" />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                    trend === 'up' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                )}>
                    {trend === 'up' ? <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" /> : <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
                    {trendValue}%
                </div>
            )}
        </div>
        <div className="mt-5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const { currentUser, projects, tasks, users, activityLogs } = useStore();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    // Logical processing...
    const myProjects = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === UserRole.DEVELOPER) return projects.filter(p => p.assignedDeveloperIds.includes(currentUser.id));
        if (currentUser.role === UserRole.TEAM_LEAD) return projects.filter(p => p.assignedLeadId === currentUser.id);
        return projects;
    }, [currentUser, projects]);

    const activeProjectsCount = myProjects.filter(p => p.status === ProjectStatus.ACTIVE).length;
    const completedTasksCount = tasks.filter(t => t.status === 'Completed' && (currentUser?.role === UserRole.DEVELOPER ? t.assignedDeveloperId === currentUser.id : true)).length;

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const projectStatusData = Object.values(ProjectStatus).map(status => ({
        name: status,
        value: projects.filter(p => p.status === status).length
    }));

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {greeting}, {currentUser?.name.split(' ')[0]}
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        System status: <span className="font-semibold text-emerald-500 underline underline-offset-4 decoration-emerald-500/30">Operational</span>. Reviewing {myProjects.length} active workstreams.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="h-11 rounded-xl px-5 border-slate-200 dark:border-slate-800">
                        <Clock className="mr-2 h-4 w-4 text-slate-400" />
                        History
                    </Button>
                    <Button className="h-11 rounded-xl bg-indigo-600 px-5 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
                        <Zap className="mr-2 h-4 w-4 fill-white" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Projects"
                    value={activeProjectsCount}
                    icon={FolderKanban}
                    trend="up"
                    trendValue={12}
                    color="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                />
                <StatCard
                    title="Completed Tasks"
                    value={completedTasksCount}
                    icon={CheckCircle2}
                    trend="up"
                    trendValue={8}
                    color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                />
                <StatCard
                    title="Productivity Score"
                    value="94%"
                    icon={Target}
                    trend="up"
                    trendValue={5}
                    color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                />
                <StatCard
                    title="Total Resources"
                    value={users.length}
                    icon={Users}
                    color="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Growth Velocity</h3>
                            <p className="text-sm text-slate-500">Monthly project and task completions</p>
                        </div>
                        <select className="rounded-lg border-none bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-300">
                            <option>Last 6 Months</option>
                            <option>Last 12 Months</option>
                        </select>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{ name: 'Jan', p: 40, t: 24 }, { name: 'Feb', p: 30, t: 13 }, { name: 'Mar', p: 20, t: 98 }, { name: 'Apr', p: 27, t: 39 }, { name: 'May', p: 18, t: 48 }, { name: 'Jun', p: 23, t: 38 }]}>
                                <defs>
                                    <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="p" stroke="#6366f1" fillOpacity={1} fill="url(#colorP)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Status Health</h3>
                    <p className="mb-8 text-sm text-slate-500">Global project distribution</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStatusData}
                                    cx="50%" cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {projectStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {projectStatusData.map((entry, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-xs font-medium text-slate-500">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Table & Activity Feed */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-8 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Critical Projects</h3>
                        <Button variant="ghost" size="sm" className="rounded-lg text-indigo-600 hover:bg-indigo-50">
                            View Roadmap <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-4 font-semibold text-slate-400">Project</th>
                                    <th className="pb-4 font-semibold text-slate-400">Ownership</th>
                                    <th className="pb-4 font-semibold text-slate-400">Health</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {myProjects.slice(0, 5).map((project) => (
                                    <tr key={project.id} className="group">
                                        <td className="py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white">{project.name}</span>
                                                <span className="text-xs text-slate-400">Due {formatDate(project.deadline)}</span>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <span className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", getStatusColor(project.status))}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="py-5 min-w-[120px]">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                    <span>{project.progressPercentage}%</span>
                                                </div>
                                                <Progress value={project.progressPercentage} className="h-1.5 w-full bg-slate-100 dark:bg-slate-800" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Activity Feed */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mb-8 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Live Feed</h3>
                        <Activity className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="relative space-y-8 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-10px)] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                        {activityLogs.slice(0, 6).map((log) => (
                            <div key={log.id} className="relative flex gap-4 pl-1">
                                <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-slate-900 dark:ring-slate-900">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                        {users.find(u => u.id === log.userId)?.name} <span className="font-normal text-slate-500">{log.action.toLowerCase()}</span>
                                    </p>
                                    <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                        {formatDate(log.timestamp)} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}