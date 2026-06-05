"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileSpreadsheet, Search,
    CalendarDays, Users, PieChart, Loader2, X, Eye,
    Info, AlertCircle, CheckCircle2, Calculator
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
interface LeaveReport {
    employee_id: number;
    employee_name: string;
    elr_year: string | null;
    elr_month: string | null;
    elr_month_name: string | null;
    elr_yearly_leave: string | number | null;
    elr_bf_leave: string | number | null;
    elr_cf_leave: string | number | null;
    elr_privileged_leave: string | number | null;
    elr_casual_leave: string | number | null;
    elr_sick_leave: string | number | null;
    elr_permissible_leave: string | number | null;
    elr_total_leave: string | number | null;
    elr_excess_leave: string | number | null;
}

export default function LeaveReportExport() {
    const [reports, setReports] = useState<LeaveReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    // Modal State
    const [selectedEmployee, setSelectedEmployee] = useState<LeaveReport | null>(null);

    // Initialize with current YYYY-MM
    const today = new Date();
    const initialMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);

    const getLeaveReport = async () => {
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const month = parseInt(monthStr, 10);
            const year = parseInt(yearStr, 10);

            const response = await callGetAPIWithToken(
                `accountant/dashboard/leaves?user_id=0&month=${month}&year=${year}`
            );

            if (response?.success && response?.data) {
                setReports(response.data);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Failed to fetch leave reports:", error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLeaveReport();
        setPage(1);
    }, [selectedMonthYear]);

    // --- Utility: Format Nulls ---
    const formatVal = (val: string | number | null) => (val === null ? "0" : val);

    // --- Filtering Logic ---
    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

    // --- Pagination Logic ---
    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getExcessStatusColor = (excess: string | number | null) => {
        const val = Number(excess) || 0;
        if (val > 0) return "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20";
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20";
    };

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
                        <span className="h-px w-8 bg-blue-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">HR Management</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Leave <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-gradient-x">Balances</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-cyan-500" />
                        Audit Status: <span className="font-bold text-cyan-500 uppercase tracking-widest text-xs">Live</span> — Monitor PL/CL/SL quotas and excess leave usage.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        variant="ghost"
                        disabled={loading || reports.length === 0}
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Master CSV
                    </Button>
                    <Button
                        className="h-14 rounded-3xl bg-blue-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-white disabled:opacity-50"
                    >
                        <Download className="mr-3 h-5 w-5" />
                        Export PDF Report
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH EMPLOYEE NAME OR ID..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                        />
                    </div>
                    <Button
                        onClick={() => { getLeaveReport(); setPage(1); }}
                        className="h-14 rounded-3xl bg-blue-600 px-10 font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition-all text-white ml-2 shadow-lg shadow-blue-600/20"
                    >
                        Fetch Records
                    </Button>
                </div>
            </motion.div>

            {/* Table Section */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between min-h-[550px]">
                <div>
                    <div className="mb-6 p-10 pb-0">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Leave Ledger Database</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            {filteredData.length} records active for {selectedMonthYear}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 opacity-50">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">Calculating Balances...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto p-5 pt-0">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                        <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Personnel</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Brought Forward</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Yearly Quota</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">PL Taken</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">CL Taken</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">SL Taken</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Total Taken</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Balance Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-20 text-center">
                                                <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No leave records found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((emp) => (
                                            <tr key={emp.employee_id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="py-5 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-sm uppercase">
                                                            {emp.employee_name[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{emp.employee_name}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">UID: {emp.employee_id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 text-center font-black text-sm text-slate-600">{formatVal(emp.elr_bf_leave)}</td>
                                                <td className="py-5 text-center font-black text-sm text-slate-900 dark:text-white">{formatVal(emp.elr_yearly_leave)}</td>
                                                <td className="py-5 text-center font-black text-sm text-slate-600">{formatVal(emp.elr_privileged_leave)}</td>
                                                <td className="py-5 text-center font-black text-sm text-slate-600">{formatVal(emp.elr_casual_leave)}</td>
                                                <td className="py-5 text-center font-black text-sm text-slate-600">{formatVal(emp.elr_sick_leave)}</td>
                                                <td className="py-5 text-center">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white">
                                                        {formatVal(emp.elr_total_leave)}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right pr-4">
                                                    <Button
                                                        onClick={() => setSelectedEmployee(emp)}
                                                        variant="outline"
                                                        className={cn(
                                                            "rounded-xl font-black uppercase tracking-widest text-[9px] h-9 border-2 gap-2",
                                                            getExcessStatusColor(emp.elr_excess_leave)
                                                        )}
                                                    >
                                                        {Number(emp.elr_excess_leave) > 0 ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                                        {Number(emp.elr_excess_leave) > 0 ? `${emp.elr_excess_leave} Excess` : "Balanced"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 0 && (
                    <div className="flex items-center justify-between p-10 pt-0 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">Page {page} of {totalPages}</p>
                        <div className="flex gap-2 mt-6">
                            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl text-xs font-black uppercase">Previous</Button>
                            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl text-xs font-black uppercase">Next</Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modal Detail Breakdown */}
            <AnimatePresence>
                {selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedEmployee(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 z-10"
                        >
                            <button onClick={() => setSelectedEmployee(null)} className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-2xl uppercase">
                                    {selectedEmployee.employee_name[0]}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{selectedEmployee.employee_name}</h3>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Employee UID: {selectedEmployee.employee_id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {[
                                    { label: "Yearly Quota", val: selectedEmployee.elr_yearly_leave, icon: CalendarDays },
                                    { label: "Brought Forward", val: selectedEmployee.elr_bf_leave, icon: Info },
                                    { label: "Permissible", val: selectedEmployee.elr_permissible_leave, icon: CheckCircle2 },
                                    { label: "Leaves Taken", val: selectedEmployee.elr_total_leave, icon: Calculator },
                                    { label: "Excess Leave", val: selectedEmployee.elr_excess_leave, icon: AlertCircle, warn: true },
                                    { label: "Carried Forward", val: selectedEmployee.elr_cf_leave, icon: Download },
                                ].map((item, idx) => (
                                    <div key={idx} className={cn(
                                        "p-5 rounded-3xl border flex flex-col",
                                        item.warn && Number(item.val) > 0 ? "bg-rose-50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20" : "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800"
                                    )}>
                                        <item.icon className={cn("h-4 w-4 mb-3", item.warn && Number(item.val) > 0 ? "text-rose-500" : "text-slate-400")} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                        <span className={cn("text-xl font-black mt-1", item.warn && Number(item.val) > 0 ? "text-rose-600" : "text-slate-900 dark:text-white")}>
                                            {formatVal(item.val)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Report Period: {selectedEmployee.elr_month_name || 'N/A'} {selectedEmployee.elr_year || 'N/A'}
                                </div>
                                <Button onClick={() => setSelectedEmployee(null)} className="rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 font-black uppercase text-[10px] h-12">
                                    Dismiss Report
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}