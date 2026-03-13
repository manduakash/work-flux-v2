"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, LineChart, Line
} from 'recharts';
import {
    Activity, Globe, ShieldCheck, AlertCircle, TrendingUp, Clock,
    Zap, Target, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight,
    Loader2, Sparkles, Binary, ChevronRight, FolderKanban,
    DollarSign, Briefcase, Award, Users, ShieldAlert, Gavel
} from 'lucide-react';

import { useStore } from '@/store/useStore';
import { cn, formatDate } from '@/lib/utils';
import { UserRole } from '@/types';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';
import { getCookie } from '@/utils/cookies';
import { Button } from '@/components/ui/button';

// --- Variants ---

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

export default function AdminDashboard() {
    const { currentUser: storeUser } = useStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const user = getCookie("user");
                setProfile(user);
                const projectsRes = await callGetAPIWithToken('projects/projects-by-user-id');
                if (projectsRes.success) setProjects(projectsRes.data);
            } catch (error) {
                console.error("Admin Dashboard Sync Failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 5) return "Surviving the Night";
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    const portfolioGrowth = useMemo(() => [
        { month: 'Jan', value: 450000, projects: 12 },
        { month: 'Feb', value: 520000, projects: 15 },
        { month: 'Mar', value: 480000, projects: 14 },
        { month: 'Apr', value: 610000, projects: 22 },
        { month: 'May', value: 590000, projects: 20 },
        { month: 'Jun', value: 750000, projects: 28 },
    ], []);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-indigo-400" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Loading Dashboard...</p>
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
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Admin Overview</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">{profile?.fullName?.split(' ')[0] || "Administrator"}</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        System Status: <span className="font-bold text-indigo-500 uppercase tracking-widest text-xs">Good</span> — Overseeing {projects.length} active projects.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button variant="ghost" className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all">
                        <ShieldCheck className="mr-3 h-4 w-4 text-indigo-500" />
                        System Logs
                    </Button>
                    <Button className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <DollarSign className="mr-3 h-4 w-4 fill-white" />
                        Budget Overview
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Value"
                    value="$12.4M"
                    icon={DollarSign}
                    trend="up"
                    trendValue={18}
                    color="bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                    description="Aggregate asset worth"
                />
                <StatCard
                    title="System Efficiency"
                    value="94.2%"
                    icon={Activity}
                    trend="up"
                    trendValue={2}
                    color="bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                    description="System-wide throughput"
                />
                <StatCard
                    title="Active Projects"
                    value={projects.length}
                    icon={Briefcase}
                    trend="up"
                    trendValue={5}
                    color="bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    description="Active high-level workstreams"
                />
                <StatCard
                    title="Risk Level"
                    value="Low"
                    icon={ShieldCheck}
                    color="bg-white text-emerald-500 border border-slate-200"
                    description="Security check passed"
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Portfolio Growth */}
                <motion.div  className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <TrendingUp className="text-slate-100 dark:text-slate-800 h-32 w-32 group-hover:text-indigo-500/10 transition-colors duration-700" />
                    </div>
                    <div className="mb-10 relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Project Growth</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Aggregate growth and project expansion metrics</p>
                    </div>
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={portfolioGrowth}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#colorValue)" strokeWidth={4} />
                                <Area type="step" dataKey="projects" stroke="#10b981" fill="transparent" strokeWidth={2} strokeDasharray="10 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Composition */}
                <motion.div  className="rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Department Overview</h3>
                    <p className="mb-12 text-sm font-bold text-slate-400 uppercase tracking-widest">Team distribution by department</p>
                    <div className="h-[300px] w-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">100%</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aggregated</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'R&D', value: 40 },
                                        { name: 'Core Ops', value: 25 },
                                        { name: 'Security', value: 20 },
                                        { name: 'Expansion', value: 15 }
                                    ]}
                                    innerRadius={85}
                                    outerRadius={115}
                                    paddingAngle={10}
                                    dataKey="value"
                                >
                                    {[0, 1, 2, 3].map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-12 space-y-4">
                        {['R&D', 'Core Ops', 'Security', 'Expansion'].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-hover hover:scale-[1.02] cursor-default border border-transparent hover:border-indigo-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{item}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{[40, 25, 20, 15][i]}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Strategic Initiatives */}
                <motion.div  className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Key Projects</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Important projects currently in progress</p>
                        </div>
                        <Button variant="ghost" className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] text-indigo-600 hover:bg-indigo-50">
                            View All <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Project</th>
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Progress</th>
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {projects.slice(0, 4).map((project, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                    <Briefcase size={18} className="text-indigo-600" />
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{project.ProjectName}</span>
                                            </div>
                                        </td>
                                        <td className="py-8 text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">High Velocity</td>
                                        <td className="py-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-500">
                                                    <span>On Track</span>
                                                    <span>{project.ProgressPercentage || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${project.ProgressPercentage || 0}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Executive Action Feed */}
                <motion.div  className="rounded-[3.5rem] bg-indigo-950 p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="mb-10 flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Recent Activity</h3>
                            <Award className="h-6 w-6 text-indigo-400 animate-pulse" />
                        </div>

                        <div className="space-y-10">
                            {[
                                { action: 'Updated project roadmap', time: '2h ago', icon: Target },
                                { action: 'Updated project budget', time: '5h ago', icon: DollarSign },
                                { action: 'Approved security update', time: '1d ago', icon: ShieldCheck },
                            ].map((log, i) => (
                                <div key={i} className="relative flex gap-6">
                                    <div className="z-10 h-10 w-10 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5">
                                        <log.icon size={18} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight text-white mb-1">{log.action}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-8 rounded-[2rem] bg-indigo-600/20 border border-indigo-500/30 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase text-indigo-300">Strategy Unit</p>
                                <Zap className="h-4 w-4 text-amber-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed uppercase tracking-wider">System is running smoothly. No issues detected.</p>
                        </div>
                    </div>
                    {/* Visual bg decoration */}
                    <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
                </motion.div>
            </div>
        </motion.div>
    );
}