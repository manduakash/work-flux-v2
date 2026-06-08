"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileSpreadsheet, Search,
    CalendarDays, Users, PieChart, Loader2, X, Eye,
    Info, AlertCircle, CheckCircle2, Calculator, CalendarClock,
    ArrowUpRight, ArrowDownRight, Briefcase
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

// --- Interface ---
interface LeaveReport {
    employee_id: number;
    employee_name: string;
    elr_year: string | number | null;
    elr_month: string | number | null;
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
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<LeaveReport | null>(null);

    const today = new Date();
    const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(currentMonthYear);

    const isFutureMonth = () => {
        const [selYear, selMonth] = selectedMonthYear.split("-").map(Number);
        const currYear = today.getFullYear();
        const currMonth = today.getMonth() + 1;
        if (selYear > currYear) return true;
        if (selYear === currYear && selMonth > currMonth) return true;
        return false;
    };

    const getLeaveReport = async () => {
        if (isFutureMonth()) return;
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const response = await callGetAPIWithToken(
                `accountant/dashboard/leaves?user_id=0&month=${parseInt(monthStr)}&year=${yearStr}`
            );
            if (response?.success && response?.data) setReports(response.data);
            else setReports([]);
        } catch (error) {
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isFutureMonth()) getLeaveReport();
        else setReports([]);
        setPage(1);
    }, [selectedMonthYear]);

    const formatVal = (val: string | number | null) => (val === null || val === undefined ? "0" : val);

    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const handleExportCSV = () => {
        if (reports.length === 0) return;
        const headers = ["ID", "Name", "Year", "BF", "Yearly Quota", "Permissible", "PL Taken", "CL Taken", "SL Taken", "Total Taken", "Excess", "CF"];
        const rows = reports.map(emp => [
            emp.employee_id, `"${emp.employee_name}"`, emp.elr_year || "N/A",
            formatVal(emp.elr_bf_leave), formatVal(emp.elr_yearly_leave), formatVal(emp.elr_permissible_leave),
            formatVal(emp.elr_privileged_leave), formatVal(emp.elr_casual_leave), formatVal(emp.elr_sick_leave),
            formatVal(emp.elr_total_leave), formatVal(emp.elr_excess_leave), formatVal(emp.elr_cf_leave)
        ].join(","));
        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Full_Leave_Report_${selectedMonthYear}.csv`;
        link.click();
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10 relative">
            
            {/* Header */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">HR Analytics & Payroll</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Leave <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">Ledger</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        onClick={handleExportCSV}
                        variant="ghost"
                        disabled={loading || reports.length === 0 || isFutureMonth()}
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Full CSV
                    </Button>
                </div>
            </div>

            {/* Filter */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH EMPLOYEE NAME OR ID..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                        className={cn(
                            "h-14 px-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest outline-none",
                            isFutureMonth() ? "text-rose-500 border-rose-200" : "text-slate-900 dark:text-white"
                        )}
                    />
                    <Button
                        onClick={getLeaveReport}
                        disabled={isFutureMonth() || loading}
                        className="h-14 rounded-3xl bg-indigo-600 px-10 font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all text-white disabled:opacity-30"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Fetch Data"}
                    </Button>
                </div>
            </motion.div>

            {/* Main Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[600px]">
                {isFutureMonth() ? (
                    <div className="flex flex-col items-center justify-center py-40 text-center px-6">
                        <CalendarClock className="h-16 w-16 text-rose-500 mb-6 opacity-20" />
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Upcoming Month Restricted</h3>
                        <p className="max-w-md text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">Future projections are locked until the month begins.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto p-10 pt-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500">Personnel</th>
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center">BF</th>
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center">Yearly</th>
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center text-indigo-600">PL</th>
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center text-amber-600">CL</th>
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center text-rose-600">SL</th>
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center">Total Taken</th>
                                    <th className="pb-4 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Ledger</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {paginatedData.length === 0 ? (
                                    <tr><td colSpan={8} className="py-20 text-center text-[10px] font-black uppercase text-slate-400">No records found</td></tr>
                                ) : (
                                    paginatedData.map((emp) => (
                                        <tr key={emp.employee_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs uppercase">{emp.employee_name[0]}</div>
                                                    <div>
                                                        <p className="font-black text-xs uppercase text-slate-900 dark:text-white">{emp.employee_name}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {emp.employee_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 text-center font-black text-xs text-slate-500">{formatVal(emp.elr_bf_leave)}</td>
                                            <td className="py-5 text-center font-black text-xs text-slate-900 dark:text-white">{formatVal(emp.elr_yearly_leave)}</td>
                                            <td className="py-5 text-center font-black text-xs text-indigo-600">{formatVal(emp.elr_privileged_leave)}</td>
                                            <td className="py-5 text-center font-black text-xs text-amber-600">{formatVal(emp.elr_casual_leave)}</td>
                                            <td className="py-5 text-center font-black text-xs text-rose-600">{formatVal(emp.elr_sick_leave)}</td>
                                            <td className="py-5 text-center font-black text-xs">
                                                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{formatVal(emp.elr_total_leave)}</span>
                                            </td>
                                            <td className="py-5 text-right pr-4">
                                                <Button
                                                    onClick={() => setSelectedEmployee(emp)}
                                                    variant="outline"
                                                    className={cn(
                                                        "rounded-xl font-black uppercase tracking-widest text-[8px] h-8 border-2 gap-2",
                                                        Number(emp.elr_excess_leave) > 0 ? "text-rose-600 border-rose-100 bg-rose-50 dark:bg-rose-950/20" : "text-emerald-600 border-emerald-100 bg-emerald-50 dark:bg-emerald-950/20"
                                                    )}
                                                >
                                                    View Full Ledger
                                                    <ArrowUpRight className="h-3 w-3" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-10 pt-0 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-black uppercase text-slate-400 mt-6 tracking-widest">Page {page} / {totalPages}</span>
                        <div className="flex gap-2 mt-6">
                            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl text-[9px] font-black uppercase tracking-widest">Prev</Button>
                            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl text-[9px] font-black uppercase tracking-widest">Next</Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Detailed Modal Breakdown (ALL FIELDS) */}
            <AnimatePresence>
                {selectedEmployee && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEmployee(null)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 z-10 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                            
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white font-black text-2xl uppercase shadow-xl shadow-indigo-600/20">{selectedEmployee.employee_name[0]}</div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">{selectedEmployee.employee_name}</h3>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">Personnel Detail ID: {selectedEmployee.employee_id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedEmployee(null)} className="h-12 w-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* All Field Cards */}
                                {[
                                    { label: "Yearly Quota", val: selectedEmployee.elr_yearly_leave, icon: Briefcase, color: "text-slate-900" },
                                    { label: "Brought Forward", val: selectedEmployee.elr_bf_leave, icon: ArrowDownRight, color: "text-slate-500" },
                                    { label: "Permissible Quota", val: selectedEmployee.elr_permissible_leave, icon: CheckCircle2, color: "text-emerald-500" },
                                    { label: "Privileged (PL)", val: selectedEmployee.elr_privileged_leave, icon: Info, color: "text-indigo-600" },
                                    { label: "Casual (CL)", val: selectedEmployee.elr_casual_leave, icon: Info, color: "text-amber-600" },
                                    { label: "Sick (SL)", val: selectedEmployee.elr_sick_leave, icon: Info, color: "text-rose-600" },
                                    { label: "Total Leaves Taken", val: selectedEmployee.elr_total_leave, icon: Calculator, color: "text-slate-900" },
                                    { label: "Excess Over Quota", val: selectedEmployee.elr_excess_leave, icon: AlertCircle, color: "text-rose-600" },
                                    { label: "Carried Forward", val: selectedEmployee.elr_cf_leave, icon: ArrowUpRight, color: "text-blue-600" },
                                    { label: "Fiscal Year", val: selectedEmployee.elr_year, icon: CalendarDays, color: "text-slate-400" },
                                    { label: "Month Index", val: selectedEmployee.elr_month, icon: CalendarDays, color: "text-slate-400" },
                                    { label: "Month Name", val: selectedEmployee.elr_month_name, icon: CalendarDays, color: "text-slate-400" },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <item.icon className={cn("h-3 w-3", item.color)} />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                        </div>
                                        <span className={cn("text-xl font-black block", item.color)}>{formatVal(item.val)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <Button onClick={() => setSelectedEmployee(null)} className="h-14 px-10 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px]">Close Report</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}