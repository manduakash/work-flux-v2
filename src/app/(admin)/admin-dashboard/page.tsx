"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, ComposedChart, Legend, Scatter
} from 'recharts';
import {
    Activity, Globe, ShieldCheck, TrendingUp,
    Target, Loader2, Sparkles, ChevronRight,
    DollarSign, Briefcase, Users, ShieldAlert,
    CheckCircle2, AlertCircle, Clock, PauseCircle,
    UserCheck, HardHat, CalendarDays
} from 'lucide-react';

import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';
import { getCookie } from '@/utils/cookies';
import { Button } from '@/components/ui/button';

// --- Theme & Styles ---
const COLORS = {
    assigned: '#94a3b8',   // slate-400
    inProgress: '#3b82f6', // blue-500
    completed: '#10b981',  // emerald-500
    onHold: '#f59e0b',     // amber-500
    danger: '#ef4444',     // red-500
    primary: '#6366f1',    // indigo-500
};

// SVG Patterns for Action Cards
const patternDots = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3C/g%3E%3C/svg%3E")`;
const patternLines = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`;
const patternGrid = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L0 20' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.15' fill='none'/%3E%3C/svg%3E")`;
const diamonUpholstery = `url("https://www.transparenttextures.com/patterns/diamond-upholstery.png")`;

// --- Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

// --- Custom Components ---

const ActionCard = ({ title, subtitle, value, icon: Icon, gradient, pattern }: any) => (
    <motion.div variants={itemVariants} className={cn("relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl transition-transform hover:scale-[1.02]", gradient)}>
        <div className="absolute inset-0 opacity-80 mix-blend-hard-light " style={{ backgroundImage: pattern }} />
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{title}</p>
                <h3 className="mt-2 text-4xl font-black tracking-tighter">{value}</h3>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/70">{subtitle}</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md shadow-inner border border-white/10">
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </motion.div>
);

const ChartWrapper = ({ title, subtitle, children }: any) => (
    <motion.div variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-950/50 shadow-sm flex flex-col">
        <div className="mb-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
        </div>
        <div className="flex-1 w-full min-h-[300px]">
            {children}
        </div>
    </motion.div>
);



// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                <p className="text-white font-black uppercase text-xs mb-2 tracking-widest">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 mb-1 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-300 font-medium capitalize">{entry.name}:</span>
                        <span className="text-white font-bold ml-auto">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


export default function AdminDashboard() {
    const { currentUser: storeUser } = useStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    // Dashboard Data State
    const [counts, setCounts] = useState<any>(null);
    const [projectProgress, setProjectProgress] = useState<any[]>([]);
    const [resourceAllocation, setResourceAllocation] = useState<any[]>([]);
    const [developerOutput, setDeveloperOutput] = useState<any[]>([]);
    const [leadershipPerformance, setLeadershipPerformance] = useState<any[]>([]);
    const [teamLeadStats, setTeamLeadStats] = useState<any[]>([]);
    const [projectTenure, setProjectTenure] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const user = getCookie("user");
                setProfile(user);

                // We fetch everything separately to avoid one failure blocking everything
                const fetchCount = async () => {
                    try {
                        const res = await callGetAPIWithToken('admin/dashboard/count');
                        const rawData = res.success ? res.data : res;
                        const data = Array.isArray(rawData) ? rawData[0] : rawData;
                        // Normalize keys to PascalCase for the UI if needed
                        const normalized: any = {};
                        if (data) {
                            Object.entries(data).forEach(([key, value]) => {
                                const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                normalized[normalizedKey] = (typeof value === 'string' && !isNaN(Number(value))) ? Number(value) : value;
                            });
                        }
                        setCounts(normalized);
                    } catch (e) {
                        console.error("Count Fetch Error:", e);
                    }
                };

                const fetchProgress = async () => {
                    try {
                        const res = await callGetAPIWithToken('admin/dashboard/project-wise-progress-graph');
                        const data = res.success ? res.data : res;
                        if (Array.isArray(data)) {
                            const normalized = data.map((item: any) => {
                                const norm: any = {};
                                Object.entries(item).forEach(([key, value]) => {
                                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                    norm[normalizedKey] = (typeof value === 'string' && !isNaN(Number(value)) && key !== 'ProjectName') ? Number(value) : value;
                                });
                                return norm;
                            });
                            setProjectProgress(normalized);
                        }
                    } catch (e) {
                        console.error("Progress Fetch Error:", e);
                    }
                };

                const fetchResource = async () => {
                    try {
                        const res = await callGetAPIWithToken('admin/dashboard/resource-allocation-chart');
                        const data = res.success ? res.data : res;
                        if (Array.isArray(data)) {
                            const normalized = data.map((item: any) => {
                                const norm: any = {};
                                Object.entries(item).forEach(([key, value]) => {
                                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                    norm[normalizedKey] = (typeof value === 'string' && !isNaN(Number(value)) && key !== 'ProjectName') ? Number(value) : value;
                                });
                                return norm;
                            });
                            setResourceAllocation(normalized);
                        }
                    } catch (e) {
                        console.error("Resource Fetch Error:", e);
                    }
                };

                const fetchOutput = async () => {
                    try {
                        const res = await callGetAPIWithToken('admin/dashboard/developer-output-chart');
                        const data = res.success ? res.data : res;
                        if (Array.isArray(data)) {
                            const normalized = data.map((item: any) => {
                                const norm: any = {};
                                Object.entries(item).forEach(([key, value]) => {
                                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                    norm[normalizedKey] = (typeof value === 'string' && !isNaN(Number(value)) && key !== 'DeveloperFullName') ? Number(value) : value;
                                });
                                return norm;
                            });
                            setDeveloperOutput(normalized);
                        }
                    } catch (e) {
                        console.error("Output Fetch Error:", e);
                    }
                };

                const fetchLeadership = async () => {
                    try {
                        const res = await callGetAPIWithToken('admin/dashboard/leadership-performance-chart');
                        const data = res.success ? res.data : res;
                        if (Array.isArray(data)) {
                            const normalized = data.map((item: any) => {
                                const norm: any = {};
                                Object.entries(item).forEach(([key, value]) => {
                                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                    norm[normalizedKey] = (typeof value === 'string' && !isNaN(Number(value)) && key !== 'LeadFullName') ? Number(value) : value;
                                });
                                return norm;
                            });
                            setLeadershipPerformance(normalized);
                        }
                    } catch (e) {
                        console.error("Leadership Fetch Error:", e);
                    }
                };

                const fetchTeamLeadStats = async () => {
                    try {
                        const res = await callGetAPIWithToken('admin/dashboard/team-lead-stats');
                        const data = res.success ? res.data : res;
                        if (Array.isArray(data)) {
                            const normalized = data.map((item: any) => {
                                const norm: any = {};
                                Object.entries(item).forEach(([key, value]) => {
                                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                    norm[normalizedKey] = (typeof value === 'string' && !isNaN(Number(value)) && key !== 'LeadFullName') ? Number(value) : value;
                                });
                                return norm;
                            });
                            setTeamLeadStats(normalized);
                        }
                    } catch (e) {
                        console.error("Team Lead Stats Fetch Error:", e);
                    }
                };

                const fetchTenure = async () => {
                    try {
                        const res = await callGetAPIWithToken('admin/dashboard/project-tenure-graph');
                        const data = res.success ? res.data : res;
                        if (Array.isArray(data)) {
                            const normalized = data.map((item: any) => {
                                const norm: any = {};
                                Object.entries(item).forEach(([key, value]) => {
                                    const normalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                                    norm[normalizedKey] = (typeof value === 'string' && !isNaN(Number(value)) && key !== 'ProjectName') ? Number(value) : value;
                                });
                                return norm;
                            });
                            setProjectTenure(normalized);
                        }
                    } catch (e) {
                        console.error("Tenure Fetch Error:", e);
                    }
                };

                await Promise.allSettled([
                    fetchCount(),
                    fetchProgress(),
                    fetchResource(),
                    fetchOutput(),
                    fetchLeadership(),
                    fetchTeamLeadStats(),
                    fetchTenure()
                ]);

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
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-indigo-400" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Intelligence...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-8"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Management Dashboard</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">{profile?.fullName?.split(' ')[0] || "Admin"}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 p-2 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md">
                    <Button variant="ghost" className="h-10 rounded-full px-6 font-black uppercase tracking-widest text-[10px]">
                        <Activity className="mr-2 h-4 w-4 text-emerald-500" /> Live Sync
                    </Button>
                </div>
            </div>

            {/* ACTION CARDS (8 Cards) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <ActionCard
                    title="Total Projects" subtitle="All time tracked" value={counts?.TotalProjects || 0} icon={Briefcase}
                    gradient="bg-gradient-to-br from-blue-600 to-indigo-800" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Active Projects" subtitle="Currently working" value={counts?.ActiveProjects || 0} icon={Activity}
                    gradient="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-900" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Deployed Projects" subtitle="Successfully delivered" value={counts?.DeployedProjects || 0} icon={CheckCircle2}
                    gradient="bg-gradient-to-tl from-blue-700 via-purple-600 to-purple-800" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="On-Hold Projects" subtitle="Awaiting resources/client" value={counts?.OnHoldProjects || 0} icon={PauseCircle}
                    gradient="bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-700" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Total Manpower" subtitle="Devs, QA & Leads" value={counts?.TotalManpower || 0} icon={Users}
                    gradient="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Deadline Crossed" subtitle="Needs immediate attention" value={counts?.DeadlineCrossedTask || 0} icon={ShieldAlert}
                    gradient="bg-gradient-to-br from-red-500 via-rose-600 to-orange-700" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Total Jr. Developers" subtitle="Across NexIntel & SVU" value={counts?.TotalJrDevelopers || 0} icon={Target}
                    gradient="bg-gradient-to-bl from-purple-500 via-rose-400 to-rose-600" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Total Sr. Developers" subtitle="Across NexIntel & SVU" value={counts?.TotalSrDeveloper || 0} icon={TrendingUp}
                    gradient="bg-gradient-to-br from-teal-400 to-slate-800" pattern={diamonUpholstery}
                />
            </div>

            {/* CHARTS SECTION - ROW 1 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 1. Project-wise Tasks (Assigned, In-Progress, Completed) */}
                <ChartWrapper title="Project Lifecycle Status" subtitle="Task distribution per active project">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectProgress} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="ProjectName" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar dataKey="Completed" name="Completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 4, 4]} />
                            <Bar dataKey="Review" name="Review" stackId="a" fill="#8b5cf6" />
                            <Bar dataKey="InProgress" name="In Progress" stackId="a" fill={COLORS.inProgress} />
                            <Bar dataKey="Pending" name="Pending" stackId="a" fill={COLORS.assigned} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {/* 2. Project-wise Manpower */}
                <ChartWrapper title="Resource Allocation" subtitle="Manpower distribution across projects">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={resourceAllocation} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="ProjectName" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar dataKey="NoOfDevs" name="Developers" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="NoOfLeads" name="Team Leads" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </div>

            {/* CHARTS SECTION - ROW 2 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 3. Developer-wise Task Status */}
                <ChartWrapper title="Developer Output Analytics" subtitle="Individual task pipeline status">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={developerOutput} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="DeveloperFullName" type="category" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar dataKey="Completed" name="Completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 0, 4]} />
                            <Bar dataKey="InProgress" name="In Progress" stackId="a" fill={COLORS.inProgress} />
                            <Bar dataKey="Pending" name="Pending" stackId="a" fill={COLORS.assigned} />
                            <Bar dataKey="Assigned" name="Assigned" stackId="a" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {/* 4. Team Lead Wise Projects Count & Progress (%) */}
                <ChartWrapper title="Leadership Performance" subtitle="Projects handled vs overall completion %">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={leadershipPerformance} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="LeadFullName" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar yAxisId="left" dataKey="NoOfProjects" name="Active Projects" barSize={40} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="Progress" name="Progress (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </div>

            {/* CHARTS SECTION - ROW 3 */}
            <div className="grid grid-cols-1 gap-6">
                {/* 6. Projects Total Working Days */}
                <ChartWrapper title="Project Tenure" subtitle="Total working days invested per active project">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectTenure} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="ProjectName" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="ProjectTenure" name="Working Days" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDays)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </div>

            {/* TABLES SECTION */}
            <div className="space-y-6">

                {/* Team Lead Table */}
                <motion.div variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-950/50 shadow-sm overflow-hidden">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-indigo-500" /> Team Leads Directory
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Aggregate leadership metrics</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Lead Name</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Total Manpower</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Total Working Projects</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-blue-600">Active</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-emerald-600">Completed</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-amber-500">On-Hold</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {teamLeadStats.map((lead, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="py-4 text-sm font-black text-slate-900 dark:text-white uppercase">{lead.LeadFullName}</td>
                                        <td className="py-4 text-sm font-bold text-slate-600">{lead.TotalManpower || 0} Members</td>
                                        <td className="py-4 text-sm font-bold text-slate-600">{lead.TotalWorkingProject || 0} Projects</td>
                                        <td className="py-4 text-sm font-black text-blue-600">{lead.ActiveProjects || 0}</td>
                                        <td className="py-4 text-sm font-black text-emerald-600">{lead.CompletedProjects || 0}</td>
                                        <td className="py-4 text-sm font-black text-amber-500">{lead.OnHoldProjects || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Developer Table */}
                <motion.div variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-950/50 shadow-sm overflow-hidden">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                <HardHat className="h-5 w-5 text-indigo-500" /> Developers Force
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Individual operational output</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Developer Name</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Active Projects</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-emerald-600">Total Completed Tasks</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-slate-400">Pending Tasks (Assigned)</th>
                                    <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-blue-600">In-Progress Tasks</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {developerOutput.map((dev, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="py-4 text-sm font-black text-slate-900 dark:text-white uppercase">{dev.DeveloperFullName}</td>
                                        <td className="py-4 text-sm font-bold text-slate-600">{dev.Assigned} Projects</td>
                                        <td className="py-4 text-sm font-black text-emerald-600">{dev.Completed}</td>
                                        <td className="py-4 text-sm font-black text-slate-500">{dev.Pending}</td>
                                        <td className="py-4 text-sm font-black text-blue-600">{dev.InProgress}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
}