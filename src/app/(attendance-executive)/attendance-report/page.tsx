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

interface DailyRecord {
    date: string;
    day: string;
    status: string;
    check_in?: string;
    check_out?: string;
    total_hours?: string;
}

export default function UserwiseAttendanceExport() {
    const [reports, setReports] = useState<EmployeeReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeReport | null>(null);
    const [detailedRecords, setDetailedRecords] = useState<DailyRecord[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    const today = new Date();
    const initialMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);

    const getAttendanceReport = async () => {
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const month = parseInt(monthStr, 10);
            const year = parseInt(yearStr, 10);

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

    // --- CSV Export Logic ---
    const handleExportCSV = () => {
        if (reports.length === 0) return;

        // 1. Define Headers
        const headers = [
            "Employee ID",
            "Employee Name",
            "Month",
            "Present",
            "Absent",
            "Late",
            "On Leave",
            "Half Day",
            "Out of Office",
            "Punctuality %"
        ];

        // 2. Map data to rows
        const rows = reports.map(emp => {
            const punctuality = calculatePunctuality(emp.present, emp.late);
            return [
                emp.employee_id,
                `"${emp.employee_name}"`, // Wrap name in quotes to handle commas
                emp.month_label,
                emp.present,
                emp.absent,
                emp.late,
                emp.on_leave,
                emp.half_day,
                emp.out_of_office,
                `${punctuality}%`
            ].join(",");
        });

        // 3. Combine headers and rows
        const csvContent = [headers.join(","), ...rows].join("\n");

        // 4. Create Blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Attendance_Master_${selectedMonthYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getEmployeeDetailedRecords = async (employeeId: number) => {
        setModalLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const response = await callGetAPIWithToken(
                `accountant/dashboard/attendance-report?user_id=${employeeId}&month=${monthStr}&year=${yearStr}`
            );
            if (response?.success && response?.data) setDetailedRecords(response.data);
            else setDetailedRecords([]);
        } catch (error) {
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

    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

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
        const normalized = (status || "").toLowerCase();
        if (normalized.includes("present")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
        if (normalized.includes("late")) return "text-amber-600 bg-amber-50 border-amber-100";
        if (normalized.includes("absent")) return "text-rose-600 bg-rose-50 border-rose-100";
        if (normalized.includes("leave")) return "text-blue-600 bg-blue-50 border-blue-100";
        return "text-slate-600 bg-slate-50 border-slate-100";
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10 relative">
            
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
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        onClick={handleExportCSV}
                        variant="ghost"
                        disabled={loading || reports.length === 0}
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Master CSV
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
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <input
                        type="month"
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                        className="h-14 px-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                    />
                    <Button
                        onClick={getAttendanceReport}
                        className="h-14 rounded-3xl bg-indigo-600 px-10 font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all text-white ml-2 shadow-lg shadow-indigo-600/20"
                    >
                        Generate Report
                    </Button>
                </div>
            </motion.div>

            {/* Main Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Fetching Reports...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto p-10">
                         <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                        <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Personnel</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Present</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Absent</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Late</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Leave</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Punctuality %</th>
                                        <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedData.map((emp) => {
                                        const punctualityVal = calculatePunctuality(emp.present, emp.late);
                                        return (
                                            <tr key={emp.employee_id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                                <td className="py-5 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                                                            {emp.employee_name ? emp.employee_name[0] : 'U'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{emp.employee_name}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {emp.employee_id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5 text-center font-black text-sm">{emp.present}</td>
                                                <td className="py-5 text-center font-black text-sm text-rose-500">{emp.absent}</td>
                                                <td className="py-5 text-center font-black text-sm text-amber-500">{emp.late}</td>
                                                <td className="py-5 text-center font-black text-sm">{emp.on_leave}</td>
                                                <td className="py-5 text-center">
                                                    <span className={cn("inline-flex items-center rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-widest", getHealthColor(punctualityVal))}>
                                                        {punctualityVal}%
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right pr-4">
                                                    <Button onClick={() => handleViewDetails(emp)} size="sm" variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[9px] h-9 gap-1.5">
                                                        <Eye className="h-3.5 w-3.5" /> View Logs
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-8 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase text-slate-400">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl text-xs font-black uppercase tracking-widest">Previous</Button>
                            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl text-xs font-black uppercase tracking-widest">Next</Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modal Logic Remains the Same... */}
        </motion.div>
    );
}