"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';
import {
    Users, Briefcase, CheckCircle2, AlertCircle,
    TrendingUp, Activity, ShieldCheck, Zap,
    Target, BarChart3, Clock, Flame, Bug
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { UserRole } from '@/types';

// --- Professional Mock Data ---
const performanceData = [
    { name: 'Sprint 12', completed: 85, planned: 90 },
    { name: 'Sprint 13', completed: 72, planned: 85 },
    { name: 'Sprint 14', completed: 94, planned: 95 },
    { name: 'Sprint 15', completed: 60, planned: 100 },
    { name: 'Sprint 16', completed: 88, planned: 90 },
];

const workloadDistribution = [
    { name: 'Active', value: 45, color: '#10b981' },
    { name: 'Overloaded', value: 15, color: '#ef4444' },
    { name: 'Available', value: 30, color: '#6366f1' },
    { name: 'Out', value: 10, color: '#94a3b8' },
];

const teamVelocity = [
    { day: 'Mon', tasks: 12 }, { day: 'Tue', tasks: 18 },
    { day: 'Wed', tasks: 15 }, { day: 'Thu', tasks: 22 },
    { day: 'Fri', tasks: 30 },
];

const statsCards = [
    { title: 'Team Headcount', val: '14', trend: '0', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Avg Cycle Time', val: '4.2d', trend: '-12%', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Active Sprints', val: '04', trend: '+1', icon: Target, color: 'text-amber-600 bg-amber-50' },
    { title: 'Open Impediments', val: '03', trend: '+2', icon: Bug, color: 'text-rose-600 bg-rose-50' },
];

export default function TeamLeadDashboard() {

    const { currentUser, projects } = useStore();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    const myProjects = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === UserRole.DEVELOPER) return projects.filter(p => p.assignedDeveloperIds.includes(currentUser.id));
        if (currentUser.role === UserRole.TEAM_LEAD) return projects.filter(p => p.assignedLeadId === currentUser.id);
        return projects;
    }, [currentUser, projects]);

    return (
        <div className="space-y-8 pb-12">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {greeting}, {currentUser?.name.split(' ')[0] || "Guest"}
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

            {/* 1. Summary Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((s, i) => (
                    <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className={cn("p-3 rounded-2xl", s.color)}><s.icon size={22} /></div>
                            <span className="text-[10px] font-black text-slate-400">{s.trend} Weekly</span>
                        </div>
                        <div className="mt-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.title}</p>
                            <h3 className="text-3xl font-extrabold dark:text-white">{s.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 2. Team Velocity (Line Chart) */}
                <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Sprint Velocity</h3>
                            <p className="text-xs font-bold text-slate-400">Throughput of Story Points vs Planned</p>
                        </div>
                        <Button variant="outline" className="rounded-xl h-9 text-[10px] font-black uppercase">Analytics</Button>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#colorVal)" strokeWidth={3} />
                                <Area type="monotone" dataKey="planned" stroke="#e2e8f0" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Resource Load Distribution */}
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-center">Resource Load</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={workloadDistribution} innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value">
                                    {workloadDistribution.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-3">
                        {workloadDistribution.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-black uppercase text-slate-500">{item.name}</span>
                                </div>
                                <span className="text-xs font-bold">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Urgent Risks & Blockers */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <div className="p-8 pb-0 flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight">Critical Impediments</h3>
                        <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                            <Flame size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Action Required</span>
                        </div>
                    </div>
                    <div className="p-8 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Member</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Issue</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Risk</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Since</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {[
                                    { name: 'Sarah J.', issue: 'API Auth Blocked', risk: 'Critical', time: '2 days' },
                                    { name: 'Michael K.', issue: 'Build Failure', risk: 'High', time: '4 hours' },
                                    { name: 'Elena R.', issue: 'Missing Requirements', risk: 'Medium', time: '1 day' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-5 flex items-center gap-3">
                                            <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700">{row.name.split(' ')[0][0]}</div>
                                            <span className="text-xs font-bold">{row.name}</span>
                                        </td>
                                        <td className="py-5 text-xs font-medium text-slate-600 dark:text-slate-400">{row.issue}</td>
                                        <td className="py-5">
                                            <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase",
                                                row.risk === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                            )}>{row.risk}</span>
                                        </td>
                                        <td className="py-5 text-[10px] font-bold text-slate-400">{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 7. Global Deployment Metrics */}
                <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Service Reliability</h3>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Uptime (Global)</span>
                                <span className="text-emerald-400 text-xs font-bold">99.98%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[99%] bg-emerald-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-black uppercase opacity-40">Failed Runs</p>
                                <p className="text-2xl font-black mt-1">04</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-black uppercase opacity-40">Cycle Time</p>
                                <p className="text-2xl font-black mt-1">32m</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase text-emerald-400">System Health</p>
                                <ShieldCheck className="text-emerald-500" size={18} />
                            </div>
                            <p className="text-xs font-medium text-emerald-100 leading-relaxed">All production clusters are performing within expected latency parameters.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 4. Critical Projects Section */}
                <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Strategic Roadmaps</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Enterprise Synergy Launch', lead: 'Sarah Jenkins', progress: 84, status: 'Healthy' },
                            { name: 'Cloud Migration Phase 2', lead: 'Michael Ross', progress: 32, status: 'Delayed' },
                            { name: 'Core Engine Patch', lead: 'Elena V.', progress: 95, status: 'Healthy' },
                        ].map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-6 rounded-3xl border border-slate-50 dark:border-slate-800 hover:border-emerald-100 transition-all cursor-pointer">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-black uppercase tracking-tight dark:text-white">{p.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Owner: {p.lead}</p>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="hidden sm:flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.progress}% Completed</span>
                                        <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${p.progress}%` }} />
                                        </div>
                                    </div>
                                    <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase",
                                        p.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    )}>
                                        {p.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. Leadership Activity Feed */}
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Management Log</h3>
                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-[2px] before:bg-slate-50">
                        {[
                            { action: 'Approved Sprint 17 Budget', time: '1h ago', icon: ShieldCheck },
                            { action: 'Reassigned Task #442 to Sarah', time: '3h ago', icon: Users },
                            { action: 'Flagged Cloud Migration Delay', time: '5h ago', icon: AlertCircle },
                            { action: 'Updated Governance Rules', time: '1d ago', icon: Briefcase },
                        ].map((log, i) => (
                            <div key={i} className="relative flex gap-4 pl-1">
                                <div className="z-10 h-6 w-6 rounded-full bg-white ring-4 ring-white flex items-center justify-center dark:bg-slate-900 dark:ring-slate-900 border border-slate-100">
                                    <log.icon size={12} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">{log.action}</p>
                                    <span className="text-[10px] font-black uppercase text-slate-400">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}