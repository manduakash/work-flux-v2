"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileSpreadsheet, Search,
    CalendarDays, Users, Banknote, Loader2, X, Eye,
    TrendingDown, CreditCard, CalendarCheck, ReceiptIndianRupee,
    CalendarRange, ChevronRight, Award
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
interface SalaryReport {
    employee_id: number;
    employee_name: string;
    designation: string;
    salary_month: string | null;
    basic?: string | number | null;
    hra?: string | number | null;
    conv_allowance?: string | number | null;
    special_allowance?: string | number | null;
    gross_salary: string | number | null;
    pf_deduction: string | number | null;
    esi_deduction: string | number | null;
    professional_tax: string | number | null;
    lop_days: string | number | null;
    excess_leave_deduction: string | number | null;
    discipline_incentive?: string | number | null;
    total_deduction: string | number | null;
    net_salary: string | number | null;
    payment_status: string | null;
    payment_date: string | null;
    yearly_gross: string;
    yearly_deduction: string;
    yearly_net: string;
}

export default function SalaryReportExport() {
    const [reports, setReports] = useState<SalaryReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    // Modal State
    const [selectedSalary, setSelectedSalary] = useState<SalaryReport | null>(null);

    // Receipt Date Range States (for Individual Modal)
    const [receiptRangeType, setReceiptRangeType] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
    const [receiptCustomStart, setReceiptCustomStart] = useState("");
    const [receiptCustomEnd, setReceiptCustomEnd] = useState("");

    // Date State for main table
    const today = new Date();
    const initialMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);

    const getSalaryReport = async () => {
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const month = parseInt(monthStr, 10);
            const year = parseInt(yearStr, 10);

            const response = await callGetAPIWithToken(
                `accountant/dashboard/salary?user_id=0&month=${month}&year=${year}`
            );

            if (response?.success && response?.data) {
                setReports(response.data);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Failed to fetch salary data:", error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    // --- CSV Export Logic ---
    const handleExportCSV = () => {
        if (reports.length === 0) return;

        const headers = [
            "Employee ID", "Name", "Designation", "Month",
            "Gross Salary", "Discipline Incentive", "PF Deduction", "ESI Deduction",
            "Prof. Tax", "LOP Days", "Leave Deduction",
            "Total Deduction", "Net Salary", "Status", "Payment Date"
        ];

        const csvRows = reports.map(emp => [
            emp.employee_id,
            `"${emp.employee_name}"`,
            `"${emp.designation}"`,
            emp.salary_month || selectedMonthYear,
            emp.gross_salary || 0,
            emp.discipline_incentive || 0,
            emp.pf_deduction || 0,
            emp.esi_deduction || 0,
            emp.professional_tax || 0,
            emp.lop_days || 0,
            emp.excess_leave_deduction || 0,
            emp.total_deduction || 0,
            emp.net_salary || 0,
            emp.payment_status || 'Pending',
            emp.payment_date || 'N/A'
        ].join(","));

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Salary_Report_${selectedMonthYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        getSalaryReport();
        setPage(1);
    }, [selectedMonthYear]);

    // --- Formatters ---
    const formatCurrency = (val: string | number | null | undefined) => {
        const num = Number(val) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const getStatusStyles = (status: string | null) => {
        const s = status?.toLowerCase() || 'pending';
        if (s === 'paid') return "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/20";
        return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/20";
    };

    // --- Filtering & Pagination ---
    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

    const itemsPerPage = 7;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10 relative"
        >
            {/* Header */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-emerald-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Financial Reporting</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Payroll <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 animate-gradient-x">Disbursement</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-emerald-500" />
                        System: <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">Active</span> — Auditing salary structure and tax deductions.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        onClick={handleExportCSV}
                        disabled={loading || reports.length === 0}
                        variant="ghost"
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Master CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH PERSONNEL OR DESIGNATION..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                        />
                    </div>
                    <Button
                        onClick={() => { getSalaryReport(); setPage(1); }}
                        className="h-14 rounded-3xl bg-emerald-600 px-10 font-black uppercase tracking-widest text-[11px] hover:bg-emerald-700 transition-all text-white ml-2 shadow-lg shadow-emerald-600/20"
                    >
                        Re-Calculate
                    </Button>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between min-h-[550px]">
                <div>
                    <div className="mb-6 p-10 pb-0">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Monthly Disbursement Ledger</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Processing {filteredData.length} active payrolls</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 opacity-50">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">Aggregating Financials...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto p-5 pt-0">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                        <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Employee Details</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Gross Salary</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Deductions</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Discipline Incentive</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Net Salary</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Status</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Breakdown</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedData.length === 0 ? (
                                        <tr><td colSpan={6} className="py-20 text-center uppercase font-black text-slate-400 text-xs tracking-widest">No payroll data found</td></tr>
                                    ) : (
                                        paginatedData.map((emp) => (
                                            <tr key={emp.employee_id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="py-5 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-black text-sm uppercase">{emp.employee_name[0]}</div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{emp.employee_name}</span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{emp.designation}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 text-center font-black text-sm text-slate-900 dark:text-white">{formatCurrency(emp.gross_salary)}</td>
                                                <td className="py-5 text-center">
                                                    <span className="text-xs font-black text-rose-500">-{formatCurrency(emp.total_deduction)}</span>
                                                </td>
                                                <td className="py-5 text-center font-black text-sm text-slate-600">{formatCurrency(emp.discipline_incentive)}</td>
                                                <td className="py-5 text-center font-black text-sm text-emerald-600">{formatCurrency(emp.net_salary)}</td>
                                                <td className="py-5 text-center">
                                                    <span className={cn("inline-flex items-center rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border", getStatusStyles(emp.payment_status))}>
                                                        {emp.payment_status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right pr-4">
                                                    <Button onClick={() => setSelectedSalary(emp)} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9 gap-1.5 border-slate-200 dark:border-slate-800">
                                                        <Eye className="h-3.5 w-3.5" /> View
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
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-10 pt-0 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl text-xs font-black uppercase">Prev</Button>
                            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl text-xs font-black uppercase">Next</Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Detailed Salary Modal */}
            <AnimatePresence>
                {selectedSalary && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSalary(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-10 z-10 max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setSelectedSalary(null)} className="absolute right-8 top-8 p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><X className="h-6 w-6" /></button>

                            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                                <div className="h-20 w-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-black text-3xl">{selectedSalary.employee_name[0]}</div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{selectedSalary.employee_name}</h3>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{selectedSalary.designation} • UID: {selectedSalary.employee_id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Monthly Breakdown */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20">
                                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Monthly Gross</span>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(selectedSalary.gross_salary)}</p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/20">
                                            <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest flex items-center gap-1">
                                                <Award className="h-3 w-3" /> Discipline Incentive
                                            </span>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(selectedSalary.discipline_incentive)}</p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Monthly Net</span>
                                            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(selectedSalary.net_salary)}</p>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                            <TrendingDown className="h-4 w-4 text-rose-500" /> Statutory & Other Deductions
                                        </h4>
                                        <div className="space-y-4">
                                            {[
                                                { label: "Provident Fund (PF)", val: selectedSalary.pf_deduction },
                                                { label: "ESI Deduction", val: selectedSalary.esi_deduction },
                                                { label: "Professional Tax", val: selectedSalary.professional_tax },
                                                { label: "Loss of Pay (Days: " + (selectedSalary.lop_days || 0) + ")", val: selectedSalary.excess_leave_deduction },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
                                                    <span className="text-xs font-black text-rose-500">{formatCurrency(item.val)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center pt-4 mt-2">
                                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Total Month Deductions</span>
                                                <span className="text-lg font-black text-rose-600">{formatCurrency(selectedSalary.total_deduction)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Yearly & Payment Info */}
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[2.5rem] bg-slate-900 dark:bg-slate-800/50 text-white space-y-6 shadow-xl">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Year-to-Date (YTD) Summary</h4>
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Yearly Gross Earnings</span>
                                            <p className="text-xl font-black">{formatCurrency(selectedSalary.yearly_gross)}</p>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Yearly Tax/Deductions</span>
                                            <p className="text-xl font-black text-rose-400">{formatCurrency(selectedSalary.yearly_deduction)}</p>
                                        </div>
                                        <div className="pt-4 border-t border-slate-700">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Yearly Net Payout</span>
                                            <p className="text-2xl font-black text-emerald-400">{formatCurrency(selectedSalary.yearly_net)}</p>
                                        </div>
                                    </div>

                                    {/* Salary Receipt Generation Options */}
                                    <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CalendarRange className="h-4 w-4 text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest">Receipt Period</span>
                                        </div>

                                        {/* Range Selector */}
                                        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            {(['monthly', 'yearly', 'custom'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setReceiptRangeType(type)}
                                                    className={cn(
                                                        "flex-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all",
                                                        receiptRangeType === type
                                                            ? "bg-emerald-600 text-white shadow-md"
                                                            : "text-slate-400 hover:text-slate-600"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Conditional Inputs for Receipt */}
                                        <AnimatePresence mode="wait">
                                            {receiptRangeType === 'monthly' && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2 ml-1">Current Period</span>
                                                    <div className="h-11 px-4 flex items-center bg-white dark:bg-slate-900 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                                                        {selectedMonthYear}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {receiptRangeType === 'yearly' && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2 ml-1">Fiscal Year</span>
                                                    <div className="h-11 px-4 flex items-center bg-white dark:bg-slate-900 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                                                        {selectedMonthYear.split('-')[0]}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {receiptRangeType === 'custom' && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1 ml-1">Start</span>
                                                        <input
                                                            type="date"
                                                            value={receiptCustomStart}
                                                            onChange={(e) => setReceiptCustomStart(e.target.value)}
                                                            className="w-full h-11 px-4 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1 ml-1">End</span>
                                                        <input
                                                            type="date"
                                                            value={receiptCustomEnd}
                                                            onChange={(e) => setReceiptCustomEnd(e.target.value)}
                                                            className="w-full h-11 px-4 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: Reactivate action buttons when needed */}
                            {/* <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <Button onClick={() => setSelectedSalary(null)} variant="ghost" className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]">Dismiss</Button>
                                <Button 
                                    onClick={() => alert(`Generating ${receiptRangeType} Payslip for ${selectedSalary.employee_name}`)}
                                    className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-emerald-600/20"
                                >
                                    <ReceiptIndianRupee className="h-4 w-4" /> Download Receipt
                                </Button>
                            </div> */}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}