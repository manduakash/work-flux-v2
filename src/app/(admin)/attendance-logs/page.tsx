"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Users, Clock, CheckCircle2, XCircle, 
    AlertCircle, Loader2, ArrowRightLeft, Activity
} from 'lucide-react';

import { callGetAPIWithToken } from '@/components/apis/commonAPIs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- Interfaces ---
interface DailyLog {
    UserID: number;
    UserFullName: string;
    AttendenceStatusName: string;
}

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function DailyAttendanceLogsPage() {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await callGetAPIWithToken('attendance/daily-log-admin');
            if (response?.success && response?.data) {
                setLogs(response.data);
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error("Failed to fetch daily logs:", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // --- Filtering ---
    const filteredLogs = logs.filter(log =>
        log.UserFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.AttendenceStatusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.UserID.toString().includes(searchTerm)
    );

    // --- Helpers ---
    const getStatusStyles = (status: string) => {
        if (!status) return "text-slate-500 bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50";
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('on time') || lowerStatus.includes('present')) {
            return "text-emerald-500 bg-emerald-50 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50";
        }
        if (lowerStatus.includes('late')) {
            return "text-amber-500 bg-amber-50 border-amber-100 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50";
        }
        if (lowerStatus.includes('absent')) {
            return "text-rose-500 bg-rose-50 border-rose-100 hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-800/50";
        }
        return "text-slate-500 bg-slate-50 border-slate-100 hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50";
    };

    const getStatusIcon = (status: string) => {
        if (!status) return <Activity size={14} className="mr-2" />;
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('on time') || lowerStatus.includes('present')) return <CheckCircle2 size={14} className="mr-2" />;
        if (lowerStatus.includes('late')) return <Clock size={14} className="mr-2" />;
        if (lowerStatus.includes('absent')) return <XCircle size={14} className="mr-2" />;
        return <Activity size={14} className="mr-2" />;
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-10 p-4 md:p-10 relative"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Daily Operations</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">
                        Attendance <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 group-hover:animate-gradient-x">Live Logs</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        Snapshot: <span className="font-bold text-slate-900 dark:text-white mx-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-white"
                    >
                        {loading ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-3 h-4 w-4" />}
                        Refresh Live Stream
                    </Button>
                </div>
            </div>

            {/* Matrix Filter */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl items-center ring-1 ring-slate-100 dark:ring-white/5">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH BY PERSONNEL NAME, UID OR STATUS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-[1.75rem] text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                </div>
            </motion.div>

            {/* Data Grid Section */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col min-h-[600px] relative">
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <div className="p-10 pb-0 mb-6 flex items-center justify-between relative z-10">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                            Real-time Attendance Registry
                        </h3>
                        <p className="text-xs font-black text-indigo-500 mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Feed Synchronized
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                        <span>Total Records: <span className="text-slate-900 dark:text-white">{filteredLogs.length}</span></span>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto p-10 pt-0 relative z-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                <th className="pb-6 px-4 font-black text-[10px] uppercase tracking-[0.25em] text-slate-500">Personnel Data</th>
                                <th className="pb-6 font-black text-[10px] uppercase tracking-[0.25em] text-slate-500 text-right pr-10">Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                            {loading && (
                                <tr>
                                    <td colSpan={2} className="py-24 text-center">
                                        <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Decrypting Daily Logs...</p>
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="py-24 text-center">
                                        <Users className="mx-auto h-16 w-16 text-slate-200 dark:text-slate-800 mb-6" />
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Zero Personnel Matched Your Query</p>
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredLogs.map((log) => (
                                <tr key={log.UserID} className="group transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                                {log.UserFullName?.split(' ').map(n => n[0]).join('') || "??"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                                    {log.UserFullName}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 group-hover:text-indigo-500 transition-colors">
                                                    Employee UID: {log.UserID}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="py-6 text-right pr-10">
                                        <span className={cn(
                                            "inline-flex items-center rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all duration-300 transform group-hover:-translate-x-2",
                                            getStatusStyles(log.AttendenceStatusName)
                                        )}>
                                            {getStatusIcon(log.AttendenceStatusName)}
                                            {log.AttendenceStatusName}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Insight */}
                <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strict Punctuality</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Immediate Action Required</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-50">
                            Work-Flux Attendance Oracle v2.0
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
