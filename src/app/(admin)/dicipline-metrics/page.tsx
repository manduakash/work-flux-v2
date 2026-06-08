"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileSpreadsheet, Search,
    CalendarDays, Users, ShieldAlert, Loader2, X, Eye, 
    ShieldCheck, AlertTriangle, Info
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

// --- Interfaces ---
interface DisciplineReport {
    employee_id: number;
    employee_name: string;
    period_label: string;
    discipline_permissible: string | number;
    discipline_breach: string | number;
    absent_count: string | number;
    on_leave: string | number;
    permissible_pct: string | number;
    breach_pct: string | number;
    absent_pct: string | number;
    leave_pct: string | number;
}

export default function DisciplineComplianceExport() {
    const [reports, setReports] = useState<DisciplineReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    // Modal States
    const [selectedEmployee, setSelectedEmployee] = useState<DisciplineReport | null>(null);

    // Date State
    const today = new Date();
    const initialMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);

    const getDisciplineReport = async () => {
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const month = parseInt(monthStr, 10);
            const year = parseInt(yearStr, 10);

            const response = await callGetAPIWithToken(
                `accountant/dashboard/discipline?user_id=0&month=${month}&year=${year}`
            );

            if (response?.success && response?.data) {
                setReports(response.data);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Failed to fetch discipline data:", error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDisciplineReport();
        setPage(1);
    }, [selectedMonthYear]);

    // --- Logic Helpers ---
    const getComplianceStatus = (breachPct: string | number) => {
        const pct = Number(breachPct);
        if (pct <= 5) return { label: "Excellent", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100", icon: ShieldCheck };
        if (pct <= 15) return { label: "Good", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100", icon: Info };
        if (pct <= 30) return { label: "Warning", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-100", icon: AlertTriangle };
        return { label: "Critical", color: "text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-100", icon: ShieldAlert };
    };

    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10 relative"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-rose-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600">Compliance & Governance</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Discipline <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-400 to-rose-600 animate-gradient-x">Indicators</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-500" />
                        Overview: Tracking policy breaches and permissible conduct metrics.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        variant="ghost"
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Audit CSV
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH PERSONNEL BY NAME OR UID..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" />
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer"
                        />
                    </div>
                    <Button
                        onClick={() => { getDisciplineReport(); setPage(1); }}
                        className="h-14 rounded-3xl bg-rose-600 px-10 font-black uppercase tracking-widest text-[11px] hover:bg-rose-700 transition-all text-white ml-2 shadow-lg shadow-rose-600/20"
                    >
                        Refresh Data
                    </Button>
                </div>
            </motion.div>

            {/* Data Table Section */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[500px] flex flex-col justify-between">
                <div>
                    <div className="mb-6 p-10 pb-0 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                Compliance Database
                            </h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                Showing discipline analytics for {selectedMonthYear}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Loader2 className="h-10 w-10 animate-spin text-rose-600 mb-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">Analyzing Conduct Data...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto p-5 pt-0">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                        <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Personnel</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Permissible (Count/%)</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Breaches (Count/%)</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Absent %</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Compliance Status</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No data found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((emp) => {
                                            const status = getComplianceStatus(emp.breach_pct);
                                            const StatusIcon = status.icon;
                                            return (
                                                <tr key={emp.employee_id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-sm">
                                                                {emp.employee_name[0]}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{emp.employee_name}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">UID: {emp.employee_id}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-5 text-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">{emp.discipline_permissible}</span>
                                                            <span className="text-[10px] text-emerald-500 font-bold">{emp.permissible_pct}%</span>
                                                        </div>
                                                    </td>

                                                    <td className="py-5 text-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-rose-600">{emp.discipline_breach}</span>
                                                            <span className="text-[10px] text-rose-400 font-bold">{emp.breach_pct}%</span>
                                                        </div>
                                                    </td>

                                                    <td className="py-5 text-center">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{emp.absent_pct}%</span>
                                                    </td>

                                                    <td className="py-5 text-center">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
                                                            status.color
                                                        )}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {status.label}
                                                        </span>
                                                    </td>

                                                    <td className="py-5 text-right pr-4">
                                                        <Button
                                                            onClick={() => setSelectedEmployee(emp)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            Audit
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-8 pt-0 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl text-xs font-black uppercase">Prev</Button>
                            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl text-xs font-black uppercase">Next</Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedEmployee(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 z-10 overflow-hidden"
                        >
                            <button onClick={() => setSelectedEmployee(null)} className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 font-black text-xl">
                                    {selectedEmployee.employee_name[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{selectedEmployee.employee_name}</h3>
                                    <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Breach Audit: {selectedEmployee.period_label}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Breaches", val: selectedEmployee.discipline_breach, pct: selectedEmployee.breach_pct, color: "text-rose-600" },
                                    { label: "Permissible", val: selectedEmployee.discipline_permissible, pct: selectedEmployee.permissible_pct, color: "text-emerald-600" },
                                    { label: "Leaves", val: selectedEmployee.on_leave, pct: selectedEmployee.leave_pct, color: "text-blue-600" },
                                    { label: "Absences", val: selectedEmployee.absent_count, pct: selectedEmployee.absent_pct, color: "text-amber-600" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className={cn("text-3xl font-black", stat.color)}>{stat.val}</span>
                                            <span className="text-xs font-bold text-slate-400">({stat.pct}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <Button onClick={() => setSelectedEmployee(null)} className="rounded-2xl bg-slate-900 text-white px-8 font-black uppercase text-[10px] h-12">
                                    Close Report
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}