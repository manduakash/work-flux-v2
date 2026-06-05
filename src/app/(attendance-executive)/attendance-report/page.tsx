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

// --- Interfaces ---
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

// Interface for detailed daily records of a user
interface DailyRecord {
    date: string;
    day: string;
    status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Half Day' | 'Out of Office' | string;
    check_in?: string;
    check_out?: string;
    total_hours?: string;
}

export default function UserwiseAttendanceExport() {
    const [reports, setReports] = useState<EmployeeReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    // Modal & Detailed Records States
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeReport | null>(null);
    const [detailedRecords, setDetailedRecords] = useState<DailyRecord[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

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

    // Fetch details for specific user
    const getEmployeeDetailedRecords = async (employeeId: number) => {
        setModalLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const month = parseInt(monthStr, 10) || 5;
            const year = parseInt(yearStr, 10) || 2026;

            const response = await callGetAPIWithToken(
                `accountant/dashboard/attendance-report?user_id=${employeeId}&month=${month}&year=${year}`
            );

            if (response?.success && response?.data) {
                setDetailedRecords(response.data);
            } else {
                setDetailedRecords([]);
            }
        } catch (error) {
            console.error("Failed to fetch detailed records:", error);
            setDetailedRecords([]);
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        getAttendanceReport();
        setPage(1);
    }, [selectedMonthYear]);

    const handleViewDetails = (emp: EmployeeReport) => {
        setSelectedEmployee(emp);
        getEmployeeDetailedRecords(emp.employee_id);
    };

    // --- Filtering Logic ---
    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

    // --- Pagination Logic ---
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

    const getStatusColor = (status: string) => {
        const normalized = status.toLowerCase();
        if (normalized.includes("present")) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20";
        if (normalized.includes("late")) return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20";
        if (normalized.includes("absent")) return "text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20";
        if (normalized.includes("leave")) return "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/20";
        if (normalized.includes("half")) return "text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/20";
        return "text-slate-600 bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800";
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
                        onClick={() => alert(`Exporting CSV for ${selectedMonthYear}`)}
                        variant="ghost"
                        disabled={loading || reports.length === 0}
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Master CSV
                    </Button>
                    <Button
                        onClick={() => alert(`Exporting PDF for ${selectedMonthYear}`)}
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
                                                            onClick={() => handleViewDetails(emp)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View Logs
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

            {/* Modal Dialog with table layout for daily logs */}
            <AnimatePresence>
                {selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEmployee(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Body */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 z-10 my-8 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedEmployee(null)}
                                className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg uppercase">
                                        {selectedEmployee.employee_name ? selectedEmployee.employee_name.split(' ').map(n => n[0]).join('') : 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                            {selectedEmployee.employee_name}
                                        </h3>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">
                                            UID: {selectedEmployee.employee_id} • {selectedEmployee.month_label} Detailed Logs
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Month Punctuality</span>
                                    <span className={cn(
                                        "inline-block rounded-xl px-3 py-1 mt-1 text-[11px] font-black uppercase tracking-widest",
                                        getHealthColor(calculatePunctuality(selectedEmployee.present, selectedEmployee.late))
                                    )}>
                                        {calculatePunctuality(selectedEmployee.present, selectedEmployee.late)}%
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Records Table Area */}
                            <div className="overflow-y-auto flex-1 pr-1">
                                {modalLoading ? (
                                    <div className="flex flex-col items-center justify-center py-24 opacity-50">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
                                        <span className="text-xs font-bold tracking-widest uppercase">Fetching user logs...</span>
                                    </div>
                                ) : detailedRecords.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <CalendarDays className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">No logs returned for this employee ID</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                                <th className="pb-3 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500">Date</th>
                                                <th className="pb-3 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500">Day</th>
                                                <th className="pb-3 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center">Status</th>
                                                <th className="pb-3 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center">Check-In</th>
                                                <th className="pb-3 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-center">Check-Out</th>
                                                <th className="pb-3 font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 text-right pr-2">Hours Worked</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                            {detailedRecords.map((record, index) => (
                                                <tr key={index} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="py-3 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                                        {record.date}
                                                    </td>
                                                    <td className="py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                        {record.day || "N/A"}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <span className={cn(
                                                            "inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border",
                                                            getStatusColor(record.status || "")
                                                        )}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                        {record.check_in || "—"}
                                                    </td>
                                                    <td className="py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                        {record.check_out || "—"}
                                                    </td>
                                                    <td className="py-3 text-right pr-2 text-xs font-black text-slate-900 dark:text-white">
                                                        {record.total_hours || "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Footer Options */}
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                <Button
                                    onClick={() => setSelectedEmployee(null)}
                                    variant="ghost"
                                    className="rounded-2xl px-6 font-black uppercase tracking-widest text-[10px]"
                                >
                                    Dismiss
                                </Button>
                                <Button
                                    onClick={() => alert(`Exporting individual logs for ${selectedEmployee?.employee_name}`)}
                                    className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 font-black uppercase tracking-widest text-[10px]"
                                >
                                    Export Logs
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}