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
    Target, LayoutDashboard, Rocket
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

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, description }: any) => (
    <motion.div
        variants={itemVariants}
        className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/50 backdrop-blur-xl"
    >
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-800/50" />
        <div className="relative flex items-center justify-between">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3", color)}>
                <Icon className="h-7 w-7" />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                    trend === 'up' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                )}>
                    {trend === 'up' ? <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> : <ArrowDownRight className="mr-1 h-3.5 w-3.5" />}
                    {trendValue}%
                </div>
            )}
        </div>
        <div className="mt-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
            <h3 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">{value}</h3>
            {description && <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
    </motion.div>
);

export default function DeveloperDashboard() {
    const { projects: storeProjects } = useStore();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [stats, setStats] = useState({
        activeProjects: 0,
        urgentTasks: 0,
        completedTasks: 0,
        goLive: 0,
        myProjects: [] as any[]
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const countsRes = await callGetAPIWithToken("developer/dashboard/counts?fromDate=2026-01-01&toDate=2026-12-31");
            const user = getCookie("user");
            setCurrentUser(user);
            const projectsRes = await callGetAPIWithToken("projects/projects-by-user-id");
            setStats({
                activeProjects: countsRes?.data?.NoOfActiveProjects || 0,
                urgentTasks: countsRes?.data?.NoOfUrgentTasks || 0,
                completedTasks: countsRes?.data?.NoOfCompletedTasks || 0,
                goLive: countsRes?.data?.NoOfGoLiveProjects || 0,
                myProjects: projectsRes.success ? projectsRes.data : []
            });
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const chartsData = useMemo(() => {
        return [
            { name: 'Stability', A: 85 },
            { name: 'Velocity', A: 92 },
            { name: 'Quality', A: 78 },
            { name: 'Scalability', A: 88 },
            { name: 'Support', A: 65 },
        ];
    }, []);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-indigo-400" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Syncing Development Intelligence...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-12 p-4 md:p-10"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Developer Governance Unit</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">{currentUser?.fullName?.split(' ')[0] || "Developer"}</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Status: <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">High Frequency</span> — Reviewing {stats.activeProjects} active workstreams.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button variant="ghost" className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all">
                        <Github className="mr-3 h-4 w-4 text-slate-900 dark:text-white" />
                        Repository Audit
                    </Button>
                    <Button className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <CloudUpload className="mr-3 h-4 w-4 fill-white" />
                        Request Deployment
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Workstreams"
                    value={stats.activeProjects}
                    icon={FolderKanban}
                    trend="up"
                    trendValue={12}
                    color="bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                    description="Assigned production pipelines"
                />
                <StatCard
                    title="Critical Backlog"
                    value={stats.urgentTasks}
                    icon={AlertCircle}
                    trend="down"
                    trendValue={4}
                    color="bg-rose-500 text-white shadow-xl shadow-rose-500/20"
                    description="High-priority impediments"
                />
                <StatCard
                    title="Delivery Cycle"
                    value={stats.completedTasks}
                    icon={CheckCircle2}
                    trend="up"
                    trendValue={22}
                    color="bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                    description="Verified unit completions"
                />
                <StatCard
                    title="Go-Live Velocity"
                    value={stats.goLive}
                    icon={Rocket}
                    color="bg-white text-indigo-600 border border-slate-200"
                    description="Production release targets"
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
                                    name="Technical Load"
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
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Portfolio Integrity</h3>
                    <p className="mb-12 text-sm font-bold text-slate-400 uppercase tracking-widest">Global workstream distribution</p>
                    <div className="h-[300px] w-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{stats.activeProjects}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Units</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.myProjects.length > 0 ? stats.myProjects.map(p => ({ name: p.ProjectName, value: 1 })) : [{ name: 'N/A', value: 1 }]}
                                    cx="50%" cy="50%"
                                    innerRadius={85}
                                    outerRadius={115}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {stats.myProjects.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-12 space-y-4">
                        {stats.myProjects.slice(0, 4).map((p, i) => (
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
