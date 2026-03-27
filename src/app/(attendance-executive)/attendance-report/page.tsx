"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Download, FileText, FileSpreadsheet, Search, Filter,
    CalendarDays, Users, Activity, Loader2
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
interface EmployeeReport {
    UserID: number;
    UserFullName: string;
    Present: string | number;
    Absent: string | number;
    OnTime: string | number;
    Late: string | number;
    OnLeave: string | number;
    TotalWorkingDaysUntilToday: number;
    Punctuality: string | number;
}

export default function UserwiseAttendanceExport() {
    const [reports, setReports] = useState<EmployeeReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    // Initialize with current YYYY-MM
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(formatDate(firstDay));
    const [toDate, setToDate] = useState(formatDate(today));

    const getAttendanceReport = async () => {
        setLoading(true);
        try {
            const response = await callGetAPIWithToken(`attendance/employee-report?fromDate=${fromDate}&toDate=${toDate}`);

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
    }, [fromDate, toDate]); // Restored for stability and HMR consistency

    // --- Filtering Logic ---
    const filteredData = reports.filter(emp =>
        emp.UserFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.UserID.toString().includes(searchTerm)
    );

    // --- Pagination Logic ---
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // --- Helper for Punctuality Badge ---
    const getHealthColor = (punctuality: number) => {
        if (punctuality >= 90) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
        if (punctuality >= 75) return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
        return "text-rose-500 bg-rose-50 dark:bg-rose-900/20";
    };

    // --- Export Handlers ---
    const handleExport = (type: 'csv' | 'pdf', empName: string = 'All_Users') => {
        // In reality, this triggers a file download via API utilizing the date range
        alert(`Exporting ${type.toUpperCase()} report for ${empName} (Period: ${fromDate} to ${toDate})...`);

        // TODO: window.open(`/api/export?type=${type}&user=${empName}&fromDate=${fromDate}&toDate=${toDate}`)
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
                            setPage(1); // Reset pagination on search
                        }}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                {/* Date Range Picker */}
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">TO</span>
                    <div className="relative flex-1 md:flex-none flex items-center gap-2">
                        <div className="relative">
                            <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setToDate(formatDate(today))}
                            className="h-10 rounded-xl px-4 font-black uppercase tracking-widest text-[9px] border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all shrink-0"
                        >
                            Today
                        </Button>
                    </div>
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
                                Displaying {filteredData.length} records from {fromDate} to {toDate}
                            </p>
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
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Punctuality %</th>
                                        {/* <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Individual Export</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                                                <p className="text-sm font-black uppercase tracking-widest text-slate-400">No records found matching your criteria</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((emp) => (
                                            <tr key={emp.UserID} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="py-5 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
                                                            {emp.UserFullName.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                                                {emp.UserFullName}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                                UID: {emp.UserID} • Total Working Days: {emp.TotalWorkingDaysUntilToday}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-5 text-center">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{emp.Present}</span>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <span className={`text-sm font-black ${Number(emp.Absent) > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{emp.Absent}</span>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <span className={`text-sm font-black ${Number(emp.Late) > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>{emp.Late}</span>
                                                </td>
                                                <td className="py-5 text-center">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{emp.OnLeave}</span>
                                                </td>

                                                <td className="py-5 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-widest",
                                                        getHealthColor(Number(emp.Punctuality) || 0)
                                                    )}>
                                                        {emp.Punctuality}%
                                                    </span>
                                                </td>

                                                {/* <td className="py-5 text-right pr-4">
                                                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <Button 
                                                            onClick={() => handleExport('csv', emp.Name)}
                                                            size="icon" 
                                                            variant="ghost" 
                                                            title="Export CSV"
                                                            className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400"
                                                        >
                                                            <FileSpreadsheet className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleExport('pdf', emp.Name)}
                                                            size="icon" 
                                                            variant="ghost" 
                                                            title="Export PDF"
                                                            className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-900/50 dark:hover:text-rose-400"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td> */}
                                            </tr>
                                        ))
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
        </motion.div>
    );
}