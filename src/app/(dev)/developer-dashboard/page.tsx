"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, LineChart, Line
} from 'recharts';
import {
    Activity, FolderKanban, Github, AlertCircle, TrendingUp, Clock,
    ShieldCheck, Zap, CheckCircle2, CloudUpload, ArrowUpRight,
    ArrowDownRight, Loader2, Sparkles, Binary, ChevronRight,
    Target, LayoutDashboard, Rocket,
    Clock1,
    Clock3,
    CheckCheck,
    ClockCheck,
    ClipboardList
} from 'lucide-react';

import { useStore } from '@/store/useStore';
import { cn, formatDate } from '@/lib/utils';
import { ProjectStatus, UserRole } from '@/types';
import { getCookie } from '@/utils/cookies';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';
import { Button } from '@/components/ui/button';

// --- Components ---

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color,
    description,
    bgColor,
    iconColor,
    borderColor
}: any) => {

    const isPositive = trend === 'up';

    return (
        <motion.div
            variants={itemVariants} // Ensure itemVariants is defined in your parent component
            className={cn(
                "group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-none",
                bgColor // Applies the vibrant gradient you passed in
            )}
        >
            {/* 1. Modern Noise/Grain Texture */}
            <div
                className="absolute inset-0 opacity-[0.8] pointer-events-none"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")' }}
            />

            {/* 2. Glassy Shine / Reflection Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            {/* 3. Subtle Inner Glow Ring */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20 pointer-events-none" />

            {/* Content Container (z-10 to stay above backgrounds) */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Top Row: Icon & Trend */}
                <div className="grid grid-cols-3 items-center justify-between">
                    {/* Icon */}
                    <div className={cn(
                        `flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 shadow-sm shadow-white/70 group-hover:scale-110 group-hover:-rotate-6 backdrop-blur-sm text-white bg-white/80 ${borderColor}`,
                    )}>
                        <Icon className={`h-7 w-7 ${iconColor}`} />
                    </div>
                    <div className="col-span-2 text-md font-bold uppercase tracking-widest text-white/80">
                        {title}
                    </div>
                </div>

                {/* Bottom Row: Text content */}
                <div className="mt-8">

                    <h3 className="mt-2 text-4xl font-black tracking-tight text-white drop-shadow-md">
                        {value}
                    </h3>
                    {description && (
                        <p className="mt-2 text-sm tracking-tight line-height-tighter font-medium text-white/65">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default function DeveloperDashboard() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [stats, setStats] = useState<any>({
        PendingTasks: 0,
        InProgressTasks: 0,
        ReviewTasks: 0,
        CompletedTasks: 0,
        ActiveProjects: 0
    });
    const [projects, setProjects] = useState<any>([]);
    const [chartsData, setChartsData] = useState<any>([
        { name: 'Pending Tasks', A: 0 },
        { name: 'In-Progress Tasks', A: 0 },
        { name: 'Review Pending Tasks', A: 0 },
        { name: 'Completed Tasks', A: 0 },
        { name: 'Active Projects', A: 0 },
    ]);
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const countsRes = await callGetAPIWithToken("developer/dashboard/count");
            const user = getCookie("user");
            setCurrentUser(user);
            const projectsRes = await callGetAPIWithToken("projects/projects-by-user-id");
            setStats({
                PendingTasks: countsRes?.data?.PendingTasks || 0,
                InProgressTasks: countsRes?.data?.InProgressTasks || 0,
                ReviewTasks: countsRes?.data?.ReviewTasks || 0,
                CompletedTasks: countsRes?.data?.CompletedTasks || 0,
                ActiveProjects: countsRes?.data?.ActiveProjects || 0
            });
            setProjects(projectsRes?.data || []);

        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useMemo(() => {
        if (!stats?.length) return null;
        setChartsData([
            { name: 'Pending Tasks', A: stats?.PendingTasks || 0 },
            { name: 'In-Progress Tasks', A: stats?.InProgressTasks || 0 },
            { name: 'Review Pending Tasks', A: stats?.ReviewTasks || 0 },
            { name: 'Completed Tasks', A: stats?.CompletedTasks || 0 },
            { name: 'Active Projects', A: stats?.ActiveProjects || 0 }
        ]);
    }, [stats])

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 5) return "Surviving the Night";
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Loading...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-12 p-4 md:p-10 relative"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Developer's Dashboard</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">{currentUser?.fullName?.split(' ')[0] || "Developer"}</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Status: <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">High Frequency</span> — Reviewing {stats.activeProjects} active workstreams.
                    </p>
                </div>
                {/* <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button variant="ghost" className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all">
                        <Github className="mr-3 h-4 w-4 text-slate-900 dark:text-white" />
                        Repository Audit
                    </Button>
                    <Button className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <CloudUpload className="mr-3 h-4 w-4 fill-white" />
                        Request Deployment
                    </Button>
                </div> */}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                    title="Newly Assigned Tasks"
                    value={stats.PendingTasks}
                    icon={ClipboardList}
                    trend="up"
                    trendValue={12}
                    color="bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 border border-indigo-500"
                    description="Tasks recently assigned to you by your team lead"
                    bgColor="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700"
                    iconColor="text-purple-500"
                    borderColor="border-2 border-purple-500"
                />

                <StatCard
                    title="Tasks In-Progress"
                    value={stats.InProgressTasks}
                    icon={Activity}
                    trend="down"
                    trendValue={4}
                    color="bg-rose-500 text-white shadow-lg shadow-rose-900/50 border border-rose-400"
                    description="Tasks actively being worked on by you"
                    bgColor="bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700"
                    iconColor="text-indigo-500"
                    borderColor="border-2 border-indigo-400"
                />

                <StatCard
                    title="Tasks Pending Approval"
                    value={stats.ReviewTasks}
                    icon={ClockCheck}
                    trend="up"
                    trendValue={22}
                    color="bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400"
                    bgColor="bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600"
                    description="Tasks submitted and awaiting review & approval of your team lead"
                    iconColor="text-amber-500"
                    borderColor="border-2 border-amber-400"
                />

                <StatCard
                    title="Completed Tasks"
                    value={stats.CompletedTasks}
                    icon={CheckCheck}
                    trend="up"
                    trendValue={8}
                    color="bg-white/20 text-white border border-white/30 shadow-lg"
                    description="Tasks completed and approved by your team lead"
                    bgColor="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700"
                    iconColor="text-emerald-500"
                    borderColor="border-2 border-emerald-400"
                />

                <StatCard
                    title="Active Projects"
                    value={stats.ActiveProjects}
                    icon={Rocket}
                    color="bg-white/20 text-white border border-white/30 shadow-lg"
                    description="Projects currently underway by you"
                    bgColor="bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-700"
                    iconColor="text-cyan-500"
                    borderColor="border-2 border-cyan-400"
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 2. Technical Quality (Radar) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <ShieldCheck className="text-slate-100 dark:text-slate-800 h-32 w-32 group-hover:text-indigo-500/10 transition-colors duration-700" />
                    </div>
                    <div className="mb-10 relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Professional Saturation</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Skill metrics and technical proficiency index</p>
                    </div>
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartsData}>
                                <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                <Radar
                                    name="Count"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.4}
                                    strokeWidth={3}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Status Health (Pie) */}
                <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Projects Status</h3>
                    <p className="mb-12 text-sm font-bold text-slate-400 uppercase tracking-widest">Global workstream distribution</p>
                    <div className="h-[300px] w-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{projects?.length || 0}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Projects</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projects?.length > 0 ? projects?.map((p: any) => ({ name: p.ProjectName, value: 1 })) : [{ name: 'N/A', value: 1 }]}
                                    cx="50%" cy="50%"
                                    innerRadius={85}
                                    outerRadius={115}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {projects?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-12 space-y-4">
                        {projects?.slice(0, 4)?.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-hover hover:scale-[1.02] cursor-default border border-transparent hover:border-indigo-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{p.ProjectName}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{p.ProgressPercentage || 0}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Urgent Task Tracker */}
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Verified Critical Tasks</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Tactical impediments requiring immediate attention</p>
                        </div>
                        <Button variant="ghost" className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] text-indigo-600 hover:bg-indigo-50">
                            Task Board <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Operation</th>
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Priority</th>
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Lifecycle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {[
                                    { name: 'Core API Optimization', priority: 'Critical', status: 'In Progress', color: 'bg-indigo-600' },
                                    { name: 'Auth Module Redesign', priority: 'High', status: 'Reviewing', color: 'bg-rose-500' },
                                    { name: 'CI/CD Pipeline Fix', priority: 'Emergency', status: 'Blocked', color: 'bg-amber-500' },
                                ].map((task, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-8 font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">{task.name}</td>
                                        <td className="py-8">
                                            <span className={cn("inline-flex items-center rounded-[0.75rem] px-4 py-2 text-[9px] font-black uppercase tracking-widest shadow-sm text-white", task.color)}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="py-8">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{task.status}</span>
                                                <div className="mt-2 h-1.5 w-32 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", task.color)} style={{ width: '65%' }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Deployment Metrics */}
                <motion.div variants={itemVariants} className="rounded-[3.5rem] bg-indigo-900 p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="mb-10 flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight">System Delivery</h3>
                            <TrendingUp className="h-6 w-6 text-indigo-400 animate-pulse" />
                        </div>
                        <p className="text-4xl font-black tracking-tighter mb-2">99.4%</p>
                        <p className="text-sm font-bold text-indigo-300/60 uppercase tracking-widest mb-10">Build integrity index</p>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Stable</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[94%] bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-black uppercase opacity-40">Failed</p>
                                    <p className="text-2xl font-black">01</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-black uppercase opacity-40">Pipelines</p>
                                    <p className="text-2xl font-black">04</p>
                                </div>
                            </div>

                            <div className="mt-8 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Last Deploy</p>
                                    <p className="text-xs font-bold text-indigo-200">Production - 4h 12m ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
