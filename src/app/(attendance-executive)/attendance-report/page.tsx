"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileSpreadsheet, Search,
    CalendarDays, Users, Activity, Loader2, X, Eye
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

// --- Updated Interface ---
interface EmployeeReport {
    employee_id: number;
    employee_name: string;
    month_label: string;
    month_number: number;
    present: string | number;
    late: string | number;
    out_of_office: string | number;
    absent: string | number;
    on_leave: string | number;
    half_day: string | number;
}

export default function UserwiseAttendanceExport() {
    const [reports, setReports] = useState<EmployeeReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    
    // Modal State
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeReport | null>(null);

    // Initialize with current YYYY-MM
    const today = new Date();
    const initialMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);

    const getAttendanceReport = async () => {
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const month = parseInt(monthStr, 10) || 5;
            const year = parseInt(yearStr, 10) || 2026;

            const response = await callGetAPIWithToken(
                `accountant/dashboard/attendance-report?user_id=0&month=${month}&year=${year}`
            );

            if (response?.success && response?.data) {
                setReports(response.data);
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAttendanceReport();
        setPage(1);
    }, [selectedMonthYear]);

    // --- Filtering Logic ---
    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

    // --- Pagination Logic ---
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // --- Helper for Punctuality calculation ---
    const calculatePunctuality = (presentCount: string | number, lateCount: string | number) => {
        const pres = Number(presentCount) || 0;
        const lat = Number(lateCount) || 0;
        const total = pres + lat;
        if (total === 0) return 100;
        return Math.round((pres / total) * 100);
    };

    const getHealthColor = (punctuality: number) => {
        if (punctuality >= 90) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
        if (punctuality >= 75) return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
        return "text-rose-500 bg-rose-50 dark:bg-rose-900/20";
    };

    const handleExport = (type: 'csv' | 'pdf', empName: string = 'All_Users') => {
        alert(`Exporting ${type.toUpperCase()} report for ${empName} (Period: ${selectedMonthYear})...`);
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
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Reporting & Analytics</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        User-wise <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">Exports</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Status: <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">Ready</span> — Export granular attendance data for payroll and audits.
                    </p>
                </div>

                {/* Global Export Actions */}
                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        onClick={() => handleExport('csv')}
                        variant="ghost"
                        disabled={loading || reports.length === 0}
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Master CSV
                    </Button>
                    <Button
                        onClick={() => handleExport('pdf')}
                        disabled={loading || reports.length === 0}
                        className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-white disabled:opacity-50"
                    >
                        <Download className="mr-3 h-5 w-5" />
                        Export Master PDF
                    </Button>
                </div>
            </div>

            {/* Filter Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">

                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH EMPLOYEE NAME OR ID..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                {/* Month-Year Picker */}
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                            setSelectedMonthYear(currentMonthYear);
                        }}
                        className="h-14 rounded-3xl px-6 font-black uppercase tracking-widest text-[10px] border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all shrink-0"
                    >
                        Current Month
                    </Button>
                    <Button
                        onClick={() => {
                            getAttendanceReport();
                            setPage(1);
                        }}
                        className="h-14 rounded-3xl bg-indigo-600 px-10 font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all text-white ml-2 shadow-lg shadow-indigo-600/20"
                    >
                        Generate Report
                    </Button>
                </div>

            </motion.div>

            {/* Data Table Section */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between min-h-[500px]">

                <div>
                    <div className="mb-6 p-10 pb-0 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                Employee Attendance Database
                            </h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                Displaying {filteredData.length} records for {selectedMonthYear}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Note: Out of office and half day statistics are tracked separately
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">Fetching Reports...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto p-5 pt-0">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                        <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Personnel</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Present</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Absent</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Late</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Leave</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Half Day</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Out of Office</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Punctuality %</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-20 text-center">
                                                <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                                                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No records found matching your criteria</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((emp) => {
                                            const punctualityVal = calculatePunctuality(emp.present, emp.late);
                                            return (
                                                <tr key={emp.employee_id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
                                                                {emp.employee_name ? emp.employee_name.split(' ').map(n => n[0]).join('') : 'U'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                                                    {emp.employee_name}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                                    UID: {emp.employee_id} • {emp.month_label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-5 text-center">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{emp.present}</span>
                                                    </td>
                                                    <td className="py-5 text-center">
                                                        <span className={`text-sm font-black ${Number(emp.absent) > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{emp.absent}</span>
                                                    </td>
                                                    <td className="py-5 text-center">
                                                        <span className={`text-sm font-black ${Number(emp.late) > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>{emp.late}</span>
                                                    </td>
                                                    <td className="py-5 text-center">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{emp.on_leave}</span>
                                                    </td>
                                                    <td className="py-5 text-center">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{emp.half_day}</span>
                                                    </td>
                                                    <td className="py-5 text-center">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white">{emp.out_of_office}</span>
                                                    </td>

                                                    <td className="py-5 text-center">
                                                        <span className={cn(
                                                            "inline-flex items-center rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-widest",
                                                            getHealthColor(punctualityVal)
                                                        )}>
                                                            {punctualityVal}%
                                                        </span>
                                                    </td>

                                                    <td className="py-5 text-right pr-4">
                                                        <Button
                                                            onClick={() => setSelectedEmployee(emp)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View
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

                {/* Pagination Footer */}
                {!loading && totalPages > 0 && (
                    <div className="flex items-center justify-between p-8 pt-0 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2 mt-6">
                            <Button
                                variant="ghost"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                className="rounded-xl text-xs font-black uppercase tracking-widest"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="ghost"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                className="rounded-xl text-xs font-black uppercase tracking-widest"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modal - View Specific Employee Data */}
            <AnimatePresence>
                {selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEmployee(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Body */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 z-10 overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg uppercase">
                                    {selectedEmployee.employee_name ? selectedEmployee.employee_name.split(' ').map(n => n[0]).join('') : 'U'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                        {selectedEmployee.employee_name}
                                    </h3>
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">
                                        Employee ID: {selectedEmployee.employee_id} • {selectedEmployee.month_label}
                                    </p>
                                </div>
                            </div>

                            {/* Grid Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600/75 dark:text-emerald-400/80">Present Days</span>
                                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2 block">{selectedEmployee.present}</span>
                                </div>

                                <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-wider text-rose-600/75 dark:text-rose-400/80">Absent Days</span>
                                    <span className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2 block">{selectedEmployee.absent}</span>
                                </div>

                                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-wider text-amber-600/75 dark:text-amber-400/80">Late Attendance</span>
                                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2 block">{selectedEmployee.late}</span>
                                </div>

                                <div className="p-4 bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/20 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-wider text-sky-600/75 dark:text-sky-400/80">Approved Leaves</span>
                                    <span className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2 block">{selectedEmployee.on_leave}</span>
                                </div>

                                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-600/75 dark:text-indigo-400/80">Half Days</span>
                                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2 block">{selectedEmployee.half_day}</span>
                                </div>

                                <div className="p-4 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20 rounded-2xl">
                                    <span className="block text-[10px] font-black uppercase tracking-wider text-teal-600/75 dark:text-teal-400/80">Out of Office</span>
                                    <span className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-2 block">{selectedEmployee.out_of_office}</span>
                                </div>
                            </div>

                            {/* Punctuality Indicator */}
                            <div className="mt-6 p-5 border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-850 rounded-[1.8rem] flex items-center justify-between">
                                <div>
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Punctuality Rating</span>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase">Computed against non-late shifts</p>
                                </div>
                                <span className={cn(
                                    "inline-flex items-center rounded-2xl px-5 py-2.5 text-base font-black uppercase tracking-widest",
                                    getHealthColor(calculatePunctuality(selectedEmployee.present, selectedEmployee.late))
                                )}>
                                    {calculatePunctuality(selectedEmployee.present, selectedEmployee.late)}%
                                </span>
                            </div>

                            <div className="mt-8 flex justify-end gap-2">
                                <Button
                                    onClick={() => setSelectedEmployee(null)}
                                    variant="ghost"
                                    className="rounded-2xl px-6 font-black uppercase tracking-widest text-[10px]"
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}