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
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
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

// --- Mock Data Generators (Replace with real API data) ---
const mockProjectTaskData = [
    { name: 'Alpha Redesign', assigned: 15, inProgress: 45, completed: 120 },
    { name: 'Beta API', assigned: 30, inProgress: 20, completed: 80 },
    { name: 'Omega Security', assigned: 5, inProgress: 60, completed: 40 },
    { name: 'Delta Mobile', assigned: 25, inProgress: 35, completed: 90 },
    { name: 'Gamma Cloud', assigned: 10, inProgress: 15, completed: 150 },
];

const mockProjectManpower = [
    { name: 'Alpha', devs: 12, leads: 2, QA: 4 },
    { name: 'Beta', devs: 8, leads: 1, QA: 2 },
    { name: 'Omega', devs: 15, leads: 3, QA: 5 },
    { name: 'Delta', devs: 6, leads: 1, QA: 2 },
    { name: 'Gamma', devs: 20, leads: 4, QA: 8 },
];

const mockDeveloperTasks = [
    { name: 'Alex H.', assigned: 4, inProgress: 3, completed: 45 },
    { name: 'Sarah J.', assigned: 2, inProgress: 5, completed: 38 },
    { name: 'Mike T.', assigned: 8, inProgress: 2, completed: 29 },
    { name: 'Emma W.', assigned: 1, inProgress: 6, completed: 52 },
    { name: 'John D.', assigned: 5, inProgress: 4, completed: 31 },
];

const mockTeamLeadData = [
    { name: 'David R.', projects: 4, progress: 85, manpower: 24 },
    { name: 'Lisa M.', projects: 2, progress: 60, manpower: 12 },
    { name: 'James K.', projects: 5, progress: 92, manpower: 35 },
    { name: 'Nina S.', projects: 3, progress: 45, manpower: 18 },
];

const mockDeadlineCrossed = [
    { name: 'Legacy Auth', daysCrossed: 14, progress: 85 },
    { name: 'DB Migration', daysCrossed: 5, progress: 92 },
    { name: 'UI Overhaul', daysCrossed: 22, progress: 60 },
    { name: 'Payment Gateway', daysCrossed: 2, progress: 98 },
];

const mockProjectDays = [
    { name: 'Alpha', days: 120 },
    { name: 'Beta', days: 85 },
    { name: 'Omega', days: 210 },
    { name: 'Delta', days: 45 },
    { name: 'Gamma', days: 160 },
];

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const user = getCookie("user");
                setProfile(user);
                // Simulate API Call delay for demo purposes
                await new Promise(resolve => setTimeout(resolve, 800));
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
                    title="Total Projects" subtitle="All time tracked" value="142" icon={Briefcase}
                    gradient="bg-gradient-to-br from-blue-600 to-indigo-800" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Active Projects" subtitle="Currently working" value="48" icon={Activity}
                    gradient="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-900" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Completed Projects" subtitle="Successfully delivered" value="81" icon={CheckCircle2}
                    gradient="bg-gradient-to-tl from-blue-700 via-purple-600 to-purple-800" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="On-Hold Projects" subtitle="Awaiting resources/client" value="13" icon={PauseCircle}
                    gradient="bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-700" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Total Manpower" subtitle="Devs, QA & Leads" value="264" icon={Users}
                    gradient="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Deadline Crossed" subtitle="Needs immediate attention" value="4" icon={ShieldAlert}
                    gradient="bg-gradient-to-br from-red-500 via-rose-600 to-orange-700" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Total Jr. Developers" subtitle="Across NexIntel & SVU" value="27" icon={Target}
                    gradient="bg-gradient-to-bl from-purple-500 via-rose-400 to-rose-600" pattern={diamonUpholstery}
                />
                <ActionCard
                    title="Total Sr. Developers" subtitle="Across NexIntel & SVU" value="9" icon={TrendingUp}
                    gradient="bg-gradient-to-br from-teal-400 to-slate-800" pattern={diamonUpholstery}
                />
            </div>

            {/* CHARTS SECTION - ROW 1 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 1. Project-wise Tasks (Assigned, In-Progress, Completed) */}
                <ChartWrapper title="Project Lifecycle Status" subtitle="Task distribution per active project">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockProjectTaskData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar dataKey="completed" name="Completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 4, 4]} />
                            <Bar dataKey="inProgress" name="In Progress" stackId="a" fill={COLORS.inProgress} />
                            <Bar dataKey="assigned" name="Assigned" stackId="a" fill={COLORS.assigned} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {/* 2. Project-wise Manpower */}
                <ChartWrapper title="Resource Allocation" subtitle="Manpower distribution across projects">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockProjectManpower} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar dataKey="devs" name="Developers" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="QA" name="QA Engineers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="leads" name="Team Leads" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </div>

            {/* CHARTS SECTION - ROW 2 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 3. Developer-wise Task Status */}
                <ChartWrapper title="Developer Output Analytics" subtitle="Individual task pipeline status">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={mockDeveloperTasks} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar dataKey="completed" name="Completed" stackId="a" fill={COLORS.completed} radius={[0, 0, 0, 4]} />
                            <Bar dataKey="inProgress" name="In Progress" stackId="a" fill={COLORS.inProgress} />
                            <Bar dataKey="assigned" name="Assigned" stackId="a" fill={COLORS.assigned} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {/* 4. Team Lead Wise Projects Count & Progress (%) */}
                <ChartWrapper title="Leadership Performance" subtitle="Projects handled vs overall completion %">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={mockTeamLeadData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar yAxisId="left" dataKey="projects" name="Active Projects" barSize={40} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="progress" name="Progress (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </div>

            {/* CHARTS SECTION - ROW 3 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 5. Deadline Crossed with Progress */}
                <ChartWrapper title="Risk Radar: Overdue Projects" subtitle="Days crossed vs Current Progress">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={mockDeadlineCrossed} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            <Bar yAxisId="left" dataKey="daysCrossed" name="Days Overdue" fill={COLORS.danger} barSize={30} radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="step" dataKey="progress" name="Completion (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                {/* 6. Projects Total Working Days */}
                <ChartWrapper title="Project Tenure" subtitle="Total working days invested per active project">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockProjectDays} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="days" name="Working Days" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDays)" />
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
                                {mockTeamLeadData.map((lead, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="py-4 text-sm font-black text-slate-900 dark:text-white uppercase">{lead.name}</td>
                                        <td className="py-4 text-sm font-bold text-slate-600">{lead.manpower} Resources</td>
                                        <td className="py-4 text-sm font-bold text-slate-600">{lead.projects + 2} Projects</td>
                                        <td className="py-4 text-sm font-black text-blue-600">{lead.projects}</td>
                                        <td className="py-4 text-sm font-black text-emerald-600">{Math.floor(lead.projects * 1.5)}</td>
                                        <td className="py-4 text-sm font-black text-amber-500">{i % 2 === 0 ? 1 : 0}</td>
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
                                {mockDeveloperTasks.map((dev, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="py-4 text-sm font-black text-slate-900 dark:text-white uppercase">{dev.name}</td>
                                        <td className="py-4 text-sm font-bold text-slate-600">{Math.ceil(dev.inProgress / 2)}</td>
                                        <td className="py-4 text-sm font-black text-emerald-600">{dev.completed}</td>
                                        <td className="py-4 text-sm font-black text-slate-500">{dev.assigned}</td>
                                        <td className="py-4 text-sm font-black text-blue-600">{dev.inProgress}</td>
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