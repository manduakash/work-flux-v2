"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
    Activity, Globe, ShieldCheck, AlertCircle, TrendingUp, Clock,
    Zap, Target, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight,
    Loader2, Sparkles, Binary, ChevronRight, FolderKanban,
    Users, Briefcase, Award
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

export default function Dashboard() {
    const { currentUser: storeUser } = useStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Use user data from cookie
                const user = getCookie("user");
                setProfile(user);
                const projectsRes = await callGetAPIWithToken('projects/projects-by-user-id');
                if (projectsRes.success) setProjects(projectsRes.data);
                // If developer role, fetch specific counts
                if (user?.role === UserRole.DEVELOPER) {
                    const countsRes = await callGetAPIWithToken('developer/dashboard/counts');
                    if (countsRes.success) setStats(countsRes.data);
                }
            } catch (error) {
                console.error("Dashboard Synchronization Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 5) return "Surviving the Night";
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    const radarData = useMemo(() => {
        const categories = ['Stability', 'Innovation', 'Growth', 'Security', 'Scale'];
        return categories.map(cat => ({
            subject: cat,
            A: Math.floor(Math.random() * 60) + 40,
            fullMark: 100,
        }));
    }, []);

    const statusPieData = useMemo(() => {
        const counts: Record<string, number> = {};
        projects.forEach(p => {
            const status = p.ProjectStatusName || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [projects]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-indigo-400" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Syncing Intelligence Matrix...</p>
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
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">NexIntel Overview Governance</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">{profile?.fullName?.split(' ')[0] || "Operative"}</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        System Status: <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">Optimized</span> — Monitoring {projects.length} global workstreams.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button variant="ghost" className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all">
                        <Binary className="mr-3 h-4 w-4 text-indigo-500" />
                        Audit Log
                    </Button>
                    <Button className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Zap className="mr-3 h-4 w-4 fill-white" />
                        Strategic Intelligence
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Workstreams"
                    value={projects.filter(p => p.ProjectStatusName === 'Active').length}
                    icon={FolderKanban}
                    trend="up"
                    trendValue={12}
                    color="bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                    description="Production-verified pipelines"
                />
                <StatCard
                    title="Portfolio Health"
                    value={`${Math.round(projects.reduce((acc, p) => acc + (p.ProgressPercentage || 0), 0) / (projects.length || 1))}%`}
                    icon={ShieldCheck}
                    trend="up"
                    trendValue={3}
                    color="bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                    description="Aggregate delivery index"
                />
                <StatCard
                    title="Strategic Momentum"
                    value={stats?.totalTasks || 42}
                    icon={TrendingUp}
                    trend="up"
                    trendValue={5.4}
                    color="bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    description="Performance throughput velocity"
                />
                <StatCard
                    title="Global Network"
                    value={projects.length}
                    icon={Globe}
                    color="bg-white text-indigo-600 border border-slate-200"
                    description="Managed enterprise assets"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Strategic Radar */}
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <Activity className="text-slate-100 dark:text-slate-800 h-32 w-32 group-hover:text-indigo-500/10 transition-colors duration-700" />
                    </div>
                    <div className="mb-10 relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Strategic Resource Matrix</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Global saturation and sector distribution</p>
                    </div>
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }} />
                                <Radar
                                    name="Current deployment"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.4}
                                    strokeWidth={3}
                                />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Health PIE */}
                <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Sector Integrity</h3>
                    <p className="mb-12 text-sm font-bold text-slate-400 uppercase tracking-widest">Aggregate portfolio distribution</p>
                    <div className="h-[300px] w-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{projects.length}</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Units</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusPieData.length > 0 ? statusPieData : [{ name: 'N/A', value: 1 }]}
                                    innerRadius={85}
                                    outerRadius={115}
                                    paddingAngle={10}
                                    dataKey="value"
                                >
                                    {(statusPieData.length > 0 ? statusPieData : [{ name: 'N/A', value: 1 }]).map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-12 space-y-4">
                        {statusPieData.map((entry, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-hover hover:scale-[1.02] cursor-default border border-transparent hover:border-indigo-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{entry.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Critical Workstreams */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <motion.div variants={itemVariants} className="lg:col-span-2 rounded-[3.5rem] border border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
                    <div className="mb-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Critical Initiatives</h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">High-impact delivery pipelines</p>
                        </div>
                        <Button variant="ghost" className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] text-indigo-600 hover:bg-indigo-50">
                            Roadmap <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Workstream</th>
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Phase</th>
                                    <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Saturation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {projects.slice(0, 5).map((project) => (
                                    <tr key={project.ProjectID} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-8">
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{project.ProjectName}</span>
                                                <span className="mt-1 text-[11px] font-bold text-slate-400">Governance ID: <span className="text-indigo-500">#PX-{project.ProjectID}</span></span>
                                            </div>
                                        </td>
                                        <td className="py-8">
                                            <span className={cn("inline-flex items-center rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest shadow-sm",
                                                project.ProjectStatusName === 'Active' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                                            )}>
                                                {project.ProjectStatusName}
                                            </span>
                                        </td>
                                        <td className="py-8 min-w-[200px]">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                    <span>{project.ProgressPercentage}%</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${project.ProgressPercentage}%` }}
                                                        className="h-full bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.4)] rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Growth Wave */}
                <motion.div variants={itemVariants} className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="mb-10 flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Throughput Lift</h3>
                            <TrendingUp className="h-6 w-6 text-indigo-400 animate-pulse" />
                        </div>
                        <p className="text-4xl font-black tracking-tighter mb-2">+14.2%</p>
                        <p className="text-sm font-bold text-indigo-300/60 uppercase tracking-widest mb-10">Quarterly velocity trajectory</p>

                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[{ v: 30 }, { v: 45 }, { v: 35 }, { v: 60 }, { v: 40 }, { v: 85 }]}>
                                    <defs>
                                        <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="v" stroke="#818cf8" strokeWidth={4} fill="url(#colorWave)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-12 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase text-indigo-200">Governance AI</p>
                                <Award className="h-4 w-4 text-indigo-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed uppercase tracking-wider">Strategic throughput is exceeding benchmarks. Expansion protocols authorized for Q3.</p>
                        </div>
                    </div>
                    {/* decoration */}
                    <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000" />
                </motion.div>
            </div>
        </motion.div>
    );
}
