"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, Calendar, Filter, Zap,
    Clock, Database, FileSpreadsheet, FileBarChart,
    Send, CheckCircle2, AlertCircle, Loader2,
    MoreVertical, FileSearch, Layers, HardDrive, RefreshCw,
    Briefcase, ListChecks, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- Background Patterns ---
const dotPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3C/g%3E%3C/svg%3E")`;

// --- Framer Motion Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

// --- Mock Data (Strictly Tasks, Projects, Manpower) ---
const recentReports = [
    { id: 'REP-001', name: 'Q3 Project Progress & Health', category: 'Projects', icon: Briefcase, date: '2 hours ago', status: 'Ready', size: '2.4 MB', format: 'PDF' },
    { id: 'REP-002', name: 'Global Manpower Allocation', category: 'Manpower', icon: Users, date: '5 hours ago', status: 'Ready', size: '1.1 MB', format: 'CSV' },
    { id: 'REP-003', name: 'Sprint Task Velocity Aggregation', category: 'Tasks', icon: ListChecks, date: '1 day ago', status: 'Ready', size: '3.8 MB', format: 'PDF' },
    { id: 'REP-004', name: 'Developer Output & Pending', category: 'Manpower', icon: Users, date: 'Just now', status: 'Processing', size: '--', format: 'CSV' },
    { id: 'REP-005', name: 'Project Overdue Risk Analysis', category: 'Projects', icon: Briefcase, date: '2 days ago', status: 'Ready', size: '840 KB', format: 'PDF' },
];

const scheduledAutomations = [
    { name: 'Weekly Manpower Brief', frequency: 'Every Monday, 08:00 AM', targets: 4, type: 'Manpower', lastRun: 'Success' },
    { name: 'Daily Task Delta', frequency: 'Daily, 18:00 PM', targets: 12, type: 'Tasks', lastRun: 'Success' },
    { name: 'Monthly Project Health', frequency: '1st of Month, 00:00 AM', targets: 3, type: 'Projects', lastRun: 'Warning' },
];

// Data Modules available for custom generation
const dataModules = [
    'Project Status',
    'Task Velocity',
    'Manpower Allocation',
    'Developer Output',
    'Project Overdue Risk',
    'Cross-Project Tasks'
];

// --- Custom Components ---

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950/50 hover:shadow-2xl hover:shadow-indigo-500/5 group">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-800/50" />
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
                <h3 className="mt-2 text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{value}</h3>
            </div>
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner", colorClass)}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    </motion.div>
);

export default function ConsolidatedReports() {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedModules, setSelectedModules] = useState<string[]>(['Project Status', 'Task Velocity']);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const toggleModule = (mod: string) => {
        if (selectedModules.includes(mod)) {
            setSelectedModules(selectedModules.filter(m => m !== mod));
        } else {
            setSelectedModules([...selectedModules, mod]);
        }
    };

    if (!isMounted) return null;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8 relative"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between rounded-[3rem] border border-slate-200 bg-white p-8 md:p-10 dark:border-slate-800 dark:bg-slate-900/50 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay" style={{ backgroundImage: dotPattern }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Intelligence Node</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Reports</span>
                    </h1>
                    <p className="mt-3 text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-indigo-400" /> Projects •
                        <ListChecks className="h-4 w-4 text-emerald-400" /> Tasks •
                        <Users className="h-4 w-4 text-amber-400" /> Manpower
                    </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <Button variant="ghost" className="h-12 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm transition-all">
                        <HardDrive className="mr-2 h-4 w-4 text-indigo-500" /> Archive Storage
                    </Button>
                    <Button className="h-12 rounded-2xl bg-indigo-600 px-6 font-black uppercase tracking-widest text-[10px] text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] transition-all">
                        <Database className="mr-2 h-4 w-4" /> Run Global Audit
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Generated This Month" value="124" icon={FileText} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
                <StatCard title="Storage Consumed" value="4.2 GB" icon={HardDrive} colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" />
                <StatCard title="Active Automations" value="8" icon={RefreshCw} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
                <StatCard title="Pending Reports" value="1" icon={Loader2} colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">

                {/* Custom Report Generator Panel (Left Side) */}
                <motion.div variants={itemVariants} className="xl:col-span-1 rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950/50 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />

                    <div className="mb-8 relative z-10">
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="h-5 w-5 text-indigo-500" /> Report Engine
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Configure custom data payload</p>
                    </div>

                    <div className="space-y-6 relative z-10 flex-1">
                        {/* Time Range */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">1. Temporal Range</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Last 7 Days', 'Last 30 Days', 'This Quarter', 'Custom Range'].map((range, i) => (
                                    <button key={i} className={cn(
                                        "py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                                        i === 1 ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300"
                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                                    )}>
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Modules (Projects, Tasks, Manpower focused) */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">2. Target Metrics</label>
                            <div className="flex flex-wrap gap-2">
                                {dataModules.map((mod, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleModule(mod)}
                                        className={cn(
                                            "flex items-center gap-2 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                                            selectedModules.includes(mod)
                                                ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900"
                                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                                        )}
                                    >
                                        <div className={cn("h-2 w-2 rounded-full", selectedModules.includes(mod) ? "bg-indigo-400" : "bg-slate-300 dark:bg-slate-700")} />
                                        {mod}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Format */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">3. Output Format</label>
                            <div className="flex gap-2">
                                <button className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300">
                                    <FileBarChart size={16} /> PDF
                                </button>
                                <button className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
                                    <FileSpreadsheet size={16} /> CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
                        <Button className="w-full h-14 rounded-2xl bg-indigo-600 font-black uppercase tracking-[0.2em] text-[11px] text-white shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all group overflow-hidden relative">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Zap className="h-4 w-4" /> Compile Data Engine
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient-x" />
                        </Button>
                    </div>
                </motion.div>

                {/* Right Side: Archives & Automation */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Recent Archives Table */}
                    <motion.div variants={itemVariants} className="rounded-[2.5rem] border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-950/50 shadow-sm overflow-hidden">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileSearch className="h-5 w-5 text-indigo-500" /> Report Archives
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Recent generated intelligence payloads</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 font-black uppercase tracking-widest text-[10px] text-slate-600 dark:border-slate-800 dark:text-slate-400">
                                View All
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                        <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Report Name</th>
                                        <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Category</th>
                                        <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Date/Time</th>
                                        <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</th>
                                        <th className="pb-4 pt-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {recentReports.map((report, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                                        report.format === 'PDF' ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10"
                                                    )}>
                                                        {report.format === 'PDF' ? <FileBarChart size={18} /> : <FileSpreadsheet size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{report.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{report.id} • {report.size}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    <report.icon size={12} className={cn(
                                                        report.category === 'Projects' ? "text-indigo-500" :
                                                            report.category === 'Tasks' ? "text-emerald-500" : "text-amber-500"
                                                    )} />
                                                    {report.category}
                                                </div>
                                            </td>
                                            <td className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{report.date}</td>
                                            <td className="py-4">
                                                {report.status === 'Ready' ? (
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md w-fit dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        <CheckCircle2 size={12} /> Ready
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md w-fit dark:bg-amber-500/10 dark:text-amber-400">
                                                        <Loader2 size={12} className="animate-spin" /> Processing
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20" disabled={report.status !== 'Ready'}>
                                                    <Download size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Scheduled Automations */}
                    <motion.div variants={itemVariants}>
                        <div className="mb-4 flex items-center justify-between px-2">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Active Automations
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {scheduledAutomations.map((auto, i) => (
                                <div key={i} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/50 hover:border-indigo-300 transition-colors group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors text-white shadow-sm",
                                            auto.type === 'Projects' ? "bg-indigo-500 group-hover:bg-indigo-600" :
                                                auto.type === 'Tasks' ? "bg-emerald-500 group-hover:bg-emerald-600" :
                                                    "bg-amber-500 group-hover:bg-amber-600"
                                        )}>
                                            <Send size={18} />
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{auto.type}</p>
                                        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight mb-4">{auto.name}</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/50 pt-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Trigger</span>
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{auto.frequency}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/50 pt-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recipients</span>
                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{auto.targets} Users</span>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/50 pt-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Last Run</span>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    auto.lastRun === 'Success' ? "text-emerald-500" : "text-amber-500"
                                                )}>
                                                    {auto.lastRun}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}