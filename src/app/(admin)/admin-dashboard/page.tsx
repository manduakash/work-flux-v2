"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import {
    Briefcase, Landmark, ShieldAlert, Globe,
    TrendingUp, Activity, Gavel, Zap,
    Target, BarChart3, CreditCard, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- Executive Mock Data ---
const portfolioHealth = [
    { month: 'Q1', budget: 400, actual: 320 },
    { month: 'Q2', budget: 500, actual: 480 },
    { month: 'Q3', budget: 450, actual: 510 },
    { month: 'Q4', budget: 600, actual: 550 },
];

const resourceAllocation = [
    { name: 'Research', value: 30 },
    { name: 'Engineering', value: 45 },
    { name: 'Marketing', value: 15 },
    { name: 'Legal', value: 10 },
];

const COLORS = ['#8b5cf6', '#6366f1', '#10b981', '#f59e0b'];

const statsData = [
    { title: 'Portfolio Budget', val: '$4.2M', trend: '+14%', icon: Landmark, color: 'text-violet-600 bg-violet-50' },
    { title: 'Global Headcount', val: '1,240', trend: '+85', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Delivery Velocity', val: '92%', trend: '+4%', icon: Target, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Strategic Risks', val: '02', trend: '-1', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8 pb-12">

            {/* 1. Executive Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statsData.map((s, i) => (
                    <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className={cn("p-3 rounded-2xl", s.color)}><s.icon size={22} /></div>
                            <span className="text-[10px] font-black text-emerald-500">{s.trend} YoY</span>
                        </div>
                        <div className="mt-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.title}</p>
                            <h3 className="text-3xl font-extrabold dark:text-white">{s.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 2. Portfolio Burn Rate (Area Chart) */}
                <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight leading-none">Strategic Velocity</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2">Allocated Budget vs Actual Burn Rate (USD)</p>
                        </div>
                        <Button variant="outline" className="rounded-xl h-9 text-[10px] font-black uppercase border-slate-200">Fiscal Report</Button>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={portfolioHealth}>
                                <defs>
                                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="actual" stroke="#8b5cf6" fill="url(#colorBudget)" strokeWidth={4} />
                                <Area type="monotone" dataKey="budget" stroke="#e2e8f0" fill="transparent" strokeWidth={2} strokeDasharray="10 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 6. Portfolio Composition (Donut) */}
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-center">Portfolio Mix</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={resourceAllocation} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {resourceAllocation.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-2">
                        {resourceAllocation.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-[10px] font-black uppercase text-slate-500">{item.name}</span>
                                </div>
                                <span className="text-xs font-black">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 3. Operational Risks (Table) */}
                <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                    <div className="p-8 pb-0 flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight leading-none">Governance Risks</h3>
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    </div>
                    <div className="p-8 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Factor</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Exposure</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Mitigation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {[
                                    { factor: 'Quarterly Burn Overrun', exposure: '$120k', status: 'Critical', action: 'Budget Reallocation' },
                                    { factor: 'Data Compliance (GDPR)', exposure: 'Legal', status: 'Review', action: 'Security Audit' },
                                    { factor: 'Resource Churn Rate', exposure: 'High', status: 'Monitor', action: 'Retention Strategy' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 font-bold text-sm text-slate-900 dark:text-white">{row.factor}</td>
                                        <td className="py-5 text-xs font-bold text-slate-500">{row.exposure}</td>
                                        <td className="py-5">
                                            <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                row.status === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600'
                                            )}>{row.status}</span>
                                        </td>
                                        <td className="py-5 text-[10px] font-bold text-slate-400 italic underline underline-offset-4">{row.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 7. Strategic Financial Health */}
                <div className="rounded-[2.5rem] bg-indigo-900 p-8 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <Landmark size={24} className="text-indigo-400" />
                        <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase">Q4 Fiscal Window</div>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Cash on Hand</p>
                            <h4 className="text-4xl font-black mt-2">$12.8M</h4>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                                <span>Projected Burn</span>
                                <span>82%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase opacity-40">Burn Rate</span>
                                <span className="text-sm font-bold text-emerald-400">-$240k / mo</span>
                            </div>
                            <Activity className="text-emerald-500" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* 4. Strategic Initiatives Section */}
                <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Strategic Initiatives</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: 'Global Infrastructure Expansion', dept: 'Operations', cost: '$1.2M', progress: 65 },
                            { name: 'AI Integration Framework', dept: 'R&D', cost: '$450k', progress: 88 },
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-violet-200 transition-all">
                                <p className="text-[10px] font-black uppercase text-violet-500 tracking-widest mb-2">{item.dept}</p>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">{item.name}</h4>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[10px] font-bold text-slate-400">{item.cost} Budget</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. Executive Action Feed */}
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Executive Feed</h3>
                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-[2px] before:bg-slate-50 dark:before:bg-slate-800">
                        {[
                            { action: 'Approved Q1 Expansion Budget', time: '2h ago', icon: Gavel },
                            { action: 'Initiated System Audit', time: '5h ago', icon: ShieldAlert },
                            { action: 'New Portfolio Target Set', time: '1d ago', icon: Target },
                            { action: 'Hiring Freeze Lifted', time: '2d ago', icon: Users },
                        ].map((log, i) => (
                            <div key={i} className="relative flex gap-4 pl-1">
                                <div className="z-10 h-6 w-6 rounded-full bg-white ring-4 ring-white flex items-center justify-center dark:bg-slate-900 dark:ring-slate-900 border border-slate-100 dark:border-slate-800">
                                    <log.icon size={12} className="text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-tight">{log.action}</p>
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