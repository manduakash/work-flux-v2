"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
    Rocket, FolderKanban, Github,
    AlertCircle, TrendingUp, Clock, ShieldCheck, Zap,
    CheckCircle2,
    CloudUpload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProjectStatus, UserRole } from '@/types';
import { useStore } from '@/store/useStore';

// --- Mock Data ---
const statsData = [
    { title: 'Active Projects', count: '12', trend: '+12%', color: 'bg-indigo-50 text-indigo-600', icon: FolderKanban },
    { title: 'Urgent Tasks', count: '08', trend: '+5%', color: 'bg-rose-50 text-rose-600', icon: AlertCircle },
    { title: 'Completed Tasks', count: '142', trend: '+18%', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
    { title: 'Go Live Projects', count: '98%', trend: '+2%', color: 'bg-amber-50 text-amber-600', icon: CloudUpload },
];

const taskAnalytics = [
    { name: 'Mon', completed: 40, pending: 24 },
    { name: 'Tue', completed: 30, pending: 13 },
    { name: 'Wed', completed: 20, pending: 98 },
    { name: 'Thu', completed: 27, pending: 39 },
    { name: 'Fri', completed: 18, pending: 48 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];



// --- Components ---

const StatCard = ({ item }: any) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between">
            <div className={cn("rounded-2xl p-3", item.color)}>
                <item.icon size={24} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500">
                <TrendingUp size={12} /> {item.trend}
            </div>
        </div>
        <div className="mt-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.title}</p>
            <h3 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{item.count}</h3>
        </div>
        <div className="mt-4 h-10 w-full opacity-30">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={taskAnalytics.slice(0, 5)}>
                    <Area type="monotone" dataKey="completed" stroke="#6366f1" fill="#6366f1" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default function DeveloperDashboard() {

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

    const projectStatusData = Object.values(ProjectStatus).map(status => ({
        name: status,
        value: projects.filter(p => p.status === status).length
    }));
    return (
        <div className="space-y-8 pb-12">
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

            {/* 1. Top Summary Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {statsData.map((stat, i) => <StatCard key={i} item={stat} />)}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 2. Task Analytics (Bar Chart) */}
                <div className="lg:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-8 flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight">Pending v/s Complete Tasks</h3>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><div className="h-2 w-2 rounded-full bg-indigo-500" /> COMPLETED</span>
                            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><div className="h-2 w-2 rounded-full bg-slate-200" /> PENDING</span>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={taskAnalytics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="pending" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Global Project Distribution (Donut) */}
                <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
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
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 3. Urgent Tasks Section */}
                <div className="lg:col-span-2 rounded-[2rem] border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <div className="p-8 pb-0 flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight">Urgent Tasks</h3>
                        <Button variant="outline" className="rounded-xl h-9 text-[10px] font-black uppercase">View All</Button>
                    </div>
                    <div className="overflow-x-auto p-8">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Task Name</th>
                                    <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Priority</th>
                                    <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                                    <th className="pb-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Deadline</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {[
                                    { name: 'Core Auth Redesign', p: 'Critical', s: 'Active', d: 'Oct 24', color: 'bg-rose-500' },
                                    { name: 'Edge Functions Optimization', p: 'High', s: 'Review', d: 'Oct 25', color: 'bg-amber-500' },
                                    { name: 'Schema Migration', p: 'Medium', s: 'Pending', d: 'Oct 28', color: 'bg-indigo-500' },
                                ].map((task, i) => (
                                    <tr key={i} className="group">
                                        <td className="py-5 font-bold text-slate-900 dark:text-white">{task.name}</td>
                                        <td className="py-5">
                                            <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase text-white", task.color)}>{task.p}</span>
                                        </td>
                                        <td className="py-5 text-[11px] font-bold text-slate-500">{task.s}</td>
                                        <td className="py-5 text-[11px] font-bold text-slate-500">{task.d}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 7. Deployment Status */}
                <div className="rounded-[2rem] border border-slate-200 bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-500/20">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight">Deployed Project Status</h3>
                        <ShieldCheck className="h-6 w-6 opacity-50" />
                    </div>
                    <div className="mt-8 space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Last Deployment</p>
                            <p className="text-sm font-bold">Today, 04:24 PM (Production)</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Build Success Rate</p>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="h-2 flex-1 rounded-full bg-white/20">
                                    <div className="h-full w-[94%] rounded-full bg-emerald-400" />
                                </div>
                                <span className="text-sm font-black">94%</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-white/10 p-4">
                                <p className="text-[10px] font-black uppercase">Failed Builds</p>
                                <p className="text-2xl font-black">02</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-4">
                                <p className="text-[10px] font-black uppercase">Active Pipelines</p>
                                <p className="text-2xl font-black">05</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 4. Critical Projects */}
                <div className="lg:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-8 text-xl font-black uppercase tracking-tight">Active Projects</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'NexIntel Synergy v2', health: 92, risk: 'Healthy', color: 'bg-emerald-500' },
                            { name: 'Global Asset Tracker', health: 45, risk: 'At Risk', color: 'bg-amber-500' },
                            { name: 'Core Engine Refactor', health: 12, risk: 'Critical', color: 'bg-rose-500' },
                        ].map((project, i) => (
                            <div key={i} className="flex flex-col gap-4 rounded-3xl border-[2px] hover:border-slate-100 border-slate-50 px-6 py-2 hover:bg-slate-50 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center dark:bg-slate-800"><FolderKanban className="text-slate-400" size={20} /></div>
                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{project.name}</p>
                                    </div>
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", project.health < 20 ? 'text-rose-500' : 'text-emerald-500')}>{project.risk}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                        <span>Progress</span>
                                        <span>{project.health}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div className={cn("h-full rounded-full", project.color)} style={{ width: `${project.health}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. Recent Activity Feed */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-8 text-xl font-black uppercase tracking-tight">Live Feed</h3>
                    <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                        {[
                            { user: 'Admin', action: 'Deployed Sygery v2', time: '12m ago', icon: Rocket },
                            { user: 'Dev_1', action: 'Merged PR #122', time: '45m ago', icon: Github },
                            { user: 'Lead_2', action: 'Flagged Critical Bug', time: '2h ago', icon: AlertCircle },
                            { user: 'System', action: 'Schema Optimized', time: '5h ago', icon: Zap },
                        ].map((log, i) => (
                            <div key={i} className="relative flex gap-4 pl-1">
                                <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-4 ring-white dark:bg-slate-900 dark:ring-slate-900">
                                    <log.icon size={12} className="text-indigo-600" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{log.user} <span className="font-normal text-slate-500 lowercase">{log.action}</span></p>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}