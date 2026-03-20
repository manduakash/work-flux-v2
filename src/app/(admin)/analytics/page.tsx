"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ScatterChart, Scatter, ZAxis, ComposedChart, Bar, Line, Legend, Cell
} from 'recharts';
import {
    Download, Calendar, Filter, TrendingUp, Activity, Zap,
    Clock, Crosshair, BoxSelect, Briefcase, ListChecks, Users,
    HardHat, AlertOctagon, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- Background Patterns ---
const gridPattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%236366f1' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`;

// --- Framer Motion Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

// --- Mock Analytics Data (Strictly Tasks, Projects, Manpower) ---
const taskTrends = [
    { sprint: 'Sprint 1', assigned: 120, completed: 110, overdue: 15 },
    { sprint: 'Sprint 2', assigned: 130, completed: 135, overdue: 12 },
    { sprint: 'Sprint 3', assigned: 140, completed: 125, overdue: 25 },
    { sprint: 'Sprint 4', assigned: 135, completed: 145, overdue: 8 },
    { sprint: 'Sprint 5', assigned: 150, completed: 155, overdue: 5 },
    { sprint: 'Sprint 6', assigned: 160, completed: 140, overdue: 18 },
];

const teamLeadRadar = [
    { subject: 'Velocity', David: 85, Sarah: 95, Mike: 70 },
    { subject: 'Accuracy', David: 90, Sarah: 85, Mike: 88 },
    { subject: 'Workload', David: 95, Sarah: 75, Mike: 80 },
    { subject: 'Completion', David: 80, Sarah: 95, Mike: 90 },
    { subject: 'Efficiency', David: 85, Sarah: 90, Mike: 75 },
];

const projectManpowerLoad = [
    { project: 'Alpha Redesign', activeTasks: 45, devsAssigned: 12 },
    { project: 'Beta API', activeTasks: 85, devsAssigned: 8 },
    { project: 'Omega Core', activeTasks: 35, devsAssigned: 15 },
    { project: 'Delta Mobile', activeTasks: 110, devsAssigned: 6 },
    { project: 'Gamma Cloud', activeTasks: 60, devsAssigned: 20 },
];

// X: Assigned Tasks, Y: Avg Completion Hours, Z: Task Complexity/Weight
const workloadScatter = [
    { name: 'Alex H.', tasks: 12, hours: 4.5, complexity: 80, fill: '#6366f1' },
    { name: 'Sarah J.', tasks: 18, hours: 3.2, complexity: 40, fill: '#10b981' },
    { name: 'Mike T.', tasks: 8, hours: 8.5, complexity: 120, fill: '#ef4444' },
    { name: 'Emma W.', tasks: 22, hours: 2.8, complexity: 30, fill: '#3b82f6' },
    { name: 'John D.', tasks: 15, hours: 5.0, complexity: 60, fill: '#f59e0b' },
    { name: 'Nina S.', tasks: 5, hours: 12.0, complexity: 150, fill: '#8b5cf6' },
];

const taskBottlenecks = [
    { id: 'TSK-802', dev: 'Mike T.', project: 'Delta Mobile', issue: 'Critical Overload', delay: '+4 Days' },
    { id: 'TSK-104', dev: 'Nina S.', project: 'Omega Core', issue: 'Complex Blocking Task', delay: '+2 Days' },
    { id: 'PRJ-992', dev: 'Team Gamma', project: 'Gamma Cloud', issue: 'Manpower Shortage', delay: '+6 Days' },
    { id: 'TSK-441', dev: 'Alex H.', project: 'Alpha Redesign', issue: 'Dependency Pending', delay: '+1 Day' },
];

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-50">
                {label && <p className="text-white font-black uppercase text-[10px] mb-3 tracking-widest border-b border-slate-700 pb-2">{label}</p>}
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 mb-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }} />
                        <span className="text-slate-400 font-bold uppercase tracking-wider">{entry.name || entry.dataKey}:</span>
                        <span className="text-white font-black ml-auto">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const AnalyticStatCard = ({ title, value, icon: Icon, trend, trendValue, subtitle }: any) => (
    <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950/50 hover:shadow-2xl hover:shadow-indigo-500/5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-indigo-500/10" />
        <div className="relative z-10 flex justify-between items-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest",
                    trend === 'up' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                )}>
                    {trend === 'up' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                    {trendValue}%
                </div>
            )}
        </div>
        <div className="mt-6">
            <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{value}</h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
            {subtitle && <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-500">{subtitle}</p>}
        </div>
    </motion.div>
);

const ChartBox = ({ title, subtitle, icon: Icon, children, className }: any) => (
    <motion.div variants={itemVariants} className={cn("relative rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-950/50 shadow-sm flex flex-col overflow-hidden", className)}>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: gridPattern }} />
        <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon className="h-5 w-5 text-indigo-500" /> {title}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600">
                <BoxSelect className="h-4 w-4" />
            </Button>
        </div>
        <div className="relative z-10 flex-1 w-full min-h-[300px]">
            {children}
        </div>
    </motion.div>
);

export default function AnalyticsEngine() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between rounded-[3rem] bg-indigo-950 p-8 md:p-10 relative overflow-hidden shadow-2xl">
                {/* Abstract Tech Background */}
                <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]" />
                <div className="absolute -left-20 -bottom-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-[100px]" />
                <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: gridPattern, backgroundSize: '30px 30px' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Operations Intelligence</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">
                        Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Engine</span>
                    </h1>
                    <p className="mt-3 text-sm font-semibold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-indigo-400" /> Projects •
                        <ListChecks className="h-4 w-4 text-emerald-400" /> Tasks •
                        <Users className="h-4 w-4 text-amber-400" /> Manpower
                    </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="h-12 rounded-2xl border-indigo-500/30 bg-indigo-900/50 px-6 font-black uppercase tracking-widest text-[10px] text-white hover:bg-indigo-800 hover:text-white backdrop-blur-md">
                        <Calendar className="mr-2 h-4 w-4 text-cyan-400" /> Last 30 Days
                    </Button>
                    <Button variant="outline" className="h-12 rounded-2xl border-indigo-500/30 bg-indigo-900/50 px-6 font-black uppercase tracking-widest text-[10px] text-white hover:bg-indigo-800 hover:text-white backdrop-blur-md">
                        <Filter className="mr-2 h-4 w-4 text-indigo-400" /> Filters
                    </Button>
                    <Button className="h-12 rounded-2xl bg-cyan-500 px-6 font-black uppercase tracking-widest text-[10px] text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:scale-[1.02]">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Micro KPIs */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AnalyticStatCard title="Task Output" value="142 pts" icon={Target} trend="up" trendValue={12} subtitle="Average tasks cleared per sprint" />
                <AnalyticStatCard title="Active Projects" value="48" icon={Briefcase} trend="up" trendValue={3.4} subtitle="Projects actively worked on" />
                <AnalyticStatCard title="Manpower Overload" value="4.2%" icon={AlertOctagon} trend="down" trendValue={1.2} subtitle="Devs exceeding standard task limits" />
                <AnalyticStatCard title="Resource Utilization" value="88.5%" icon={Users} trend="up" trendValue={4} subtitle="Active allocation of developer forces" />
            </div>

            {/* Grid Row 1: Velocity vs Radar */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Task Trend (Area/Composed) */}
                <ChartBox className="lg:col-span-2" title="Task Output Trends" subtitle="Assigned vs Completed against Overdue Tasks" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={taskTrends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="sprint" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 900, fill: '#f87171' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginTop: '10px' }} />
                            <Bar yAxisId="left" dataKey="assigned" name="Assigned Tasks" barSize={20} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                            <Area yAxisId="left" type="monotone" dataKey="completed" name="Completed Tasks" stroke="#10b981" strokeWidth={3} fill="url(#actualColor)" />
                            <Line yAxisId="right" type="step" dataKey="overdue" name="Overdue Tasks" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartBox>

                {/* Leadership Radar */}
                <ChartBox title="Team Lead Output Vectors" subtitle="Leadership capability matrix" icon={Activity}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={teamLeadRadar}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="David (Lead A)" dataKey="David" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                            <Radar name="Sarah (Lead B)" dataKey="Sarah" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                            <Radar name="Mike (Lead C)" dataKey="Mike" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartBox>
            </div>

            {/* Grid Row 2: Scatter vs Manpower Load */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Workload Scatter Plot */}
                <ChartBox title="Developer Workload Density" subtitle="X: Tasks | Y: Hours | Bubble: Task Complexity" icon={Crosshair}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis type="number" dataKey="tasks" name="Active Tasks" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis type="number" dataKey="hours" name="Avg Task Hours" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <ZAxis type="number" dataKey="complexity" range={[50, 400]} name="Task Complexity" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                            <Scatter name="Developers" data={workloadScatter}>
                                {workloadScatter.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartBox>

                {/* Project Manpower vs Tasks */}
                <ChartBox className="lg:col-span-2" title="Project Manpower vs Task Load" subtitle="Tracking active tasks against assigned developers" icon={HardHat}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={projectManpowerLoad} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="project" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8', textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                            <Bar yAxisId="left" dataKey="activeTasks" name="Active Tasks" radius={[4, 4, 0, 0]} barSize={40}>
                                {projectManpowerLoad.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.activeTasks / entry.devsAssigned > 8 ? '#ef4444' : '#6366f1'} />
                                ))}
                            </Bar>
                            <Line yAxisId="right" type="monotone" dataKey="devsAssigned" name="Devs Assigned" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartBox>

            </div>

            {/* Bottom Table: Critical Bottlenecks */}
            <motion.div variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-950/50 shadow-sm overflow-hidden relative">
                <div className="absolute right-0 top-0 h-64 w-64 bg-rose-500/5 blur-[100px] pointer-events-none rounded-full" />

                <div className="mb-8 flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-rose-500" /> Manpower & Task Bottlenecks
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Active operational delays requiring immediate re-assignment</p>
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Trace ID</th>
                                <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Blocked Resource</th>
                                <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Project</th>
                                <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Root Issue</th>
                                <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right">Projected Delay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {taskBottlenecks.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group cursor-default">
                                    <td className="py-5 text-xs font-black text-slate-400 dark:text-slate-500 tracking-wider">{item.id}</td>
                                    <td className="py-5 text-sm font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" /> {item.dev}
                                    </td>
                                    <td className="py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">{item.project}</td>
                                    <td className="py-5">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                                            item.issue.includes('Overload') ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                                                item.issue.includes('Pending') ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        )}>
                                            {item.issue}
                                        </span>
                                    </td>
                                    <td className="py-5 text-right text-sm font-black text-rose-500 uppercase tracking-widest">{item.delay}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </motion.div>
    );
}