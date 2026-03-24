"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Download, FileText, FileSpreadsheet, Search, Filter, 
    CalendarDays, CalendarOff, ChevronRight, Activity, Loader2,
    CheckCircle2, XCircle, Clock, Umbrella
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

// --- Mock Data ---
const mockLeaveReports = [
    { ReqID: "LR-1042", EmpID: "EMP-001", Name: "Sarah Jenkins", Dept: "Engineering", Type: "Sick Leave", Start: "Oct 12, 2023", End: "Oct 14, 2023", Days: 3, Status: "Approved", AppliedOn: "Oct 10, 2023" },
    { ReqID: "LR-1043", EmpID: "EMP-002", Name: "Michael Chang", Dept: "Design", Type: "Annual Leave", Start: "Oct 15, 2023", End: "Oct 20, 2023", Days: 6, Status: "Pending", AppliedOn: "Oct 11, 2023" },
    { ReqID: "LR-1044", EmpID: "EMP-003", Name: "David Kumar", Dept: "Sales", Type: "Half Day", Start: "Oct 08, 2023", End: "Oct 08, 2023", Days: 0.5, Status: "Approved", AppliedOn: "Oct 07, 2023" },
    { ReqID: "LR-1045", EmpID: "EMP-004", Name: "Emily Ross", Dept: "HR", Type: "Casual Leave", Start: "Oct 09, 2023", End: "Oct 09, 2023", Days: 1, Status: "Rejected", AppliedOn: "Oct 08, 2023" },
    { ReqID: "LR-1046", EmpID: "EMP-005", Name: "James Wilson", Dept: "Engineering", Type: "Sick Leave", Start: "Oct 22, 2023", End: "Oct 23, 2023", Days: 2, Status: "Pending", AppliedOn: "Oct 18, 2023" },
    { ReqID: "LR-1047", EmpID: "EMP-006", Name: "Anita Desai", Dept: "Marketing", Type: "Maternity Leave", Start: "Nov 01, 2023", End: "Apr 30, 2024", Days: 180, Status: "Approved", AppliedOn: "Sep 15, 2023" },
    { ReqID: "LR-1048", EmpID: "EMP-007", Name: "Robert Fox", Dept: "Sales", Type: "Casual Leave", Start: "Oct 25, 2023", End: "Oct 26, 2023", Days: 2, Status: "Approved", AppliedOn: "Oct 20, 2023" },
    { ReqID: "LR-1049", EmpID: "EMP-008", Name: "Cody Fisher", Dept: "Design", Type: "Unpaid Leave", Start: "Oct 28, 2023", End: "Nov 05, 2023", Days: 9, Status: "Pending", AppliedOn: "Oct 21, 2023" },
];

export default function LeaveReportExport() {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);

    // Filtering Logic
    const filteredData = mockLeaveReports.filter(req => {
        const matchesSearch = 
            req.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            req.EmpID.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.ReqID.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "All" || req.Status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Helpers for Badges
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Approved": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
            case "Pending": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
            case "Rejected": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
            default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Approved": return <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />;
            case "Pending": return <Clock className="h-3.5 w-3.5 mr-1.5" />;
            case "Rejected": return <XCircle className="h-3.5 w-3.5 mr-1.5" />;
            default: return null;
        }
    };

    const getTypeColor = (type: string) => {
        if (type.includes("Sick")) return "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400";
        if (type.includes("Annual") || type.includes("Casual")) return "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400";
        if (type.includes("Maternity")) return "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400";
        if (type.includes("Half")) return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400";
        return "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400";
    };

    // Mock Export Handlers
    const handleExport = (format: 'csv' | 'pdf', id: string = 'All_Leaves') => {
        alert(`Exporting ${format.toUpperCase()} leave report for ${id}...`);
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Compiling Leave Data...</p>
            </div>
        );
    }

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
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Leave Management</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Leave <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 animate-gradient-x">Reports</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Umbrella className="h-4 w-4 text-amber-500" />
                        Status: <span className="font-bold text-amber-500 uppercase tracking-widest text-xs">Active</span> — Audit and export comprehensive time-off records.
                    </p>
                </div>

                {/* Global Export Actions */}
                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button 
                        onClick={() => handleExport('csv')}
                        variant="ghost" 
                        className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
                    >
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export All CSV
                    </Button>
                    <Button 
                        onClick={() => handleExport('pdf')}
                        className="h-14 rounded-3xl bg-slate-900 dark:bg-white px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-white dark:text-slate-900"
                    >
                        <Download className="mr-3 h-5 w-5" />
                        Export All PDF
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
                        placeholder="SEARCH BY EMPLOYEE OR REQUEST ID..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                {/* Status Filter Buttons */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
                        <Button 
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            variant={statusFilter === status ? "default" : "outline"} 
                            className={cn(
                                "h-14 rounded-3xl px-6 font-black uppercase tracking-widest text-[10px] transition-all",
                                statusFilter === status 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                                    : "border-slate-200 dark:border-slate-800 text-slate-500"
                            )}
                        >
                            {status}
                        </Button>
                    ))}
                    
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2 self-center" />
                    
                    <Button variant="outline" className="h-14 flex-shrink-0 rounded-3xl px-6 font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800">
                        <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
                        Date Range
                    </Button>
                </div>

            </motion.div>

            {/* Data Table Section */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between min-h-[500px]">
                
                <div>
                    <div className="mb-6 p-10 pb-0 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                Master Leave Log
                            </h3>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                Displaying {filteredData.length} leave applications based on filters
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto p-5 pt-0">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Employee Details</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Leave Type</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Duration</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Status</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Export Record</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <CalendarOff className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">No leave records match your search</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((leave) => (
                                        <tr key={leave.ReqID} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            {/* Employee Info */}
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-sm uppercase">
                                                        {leave.Name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                                            {leave.Name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                            {leave.EmpID} • {leave.Dept}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Leave Type & Application Date */}
                                            <td className="py-5">
                                                <div className="flex flex-col items-start gap-1.5">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                                                        getTypeColor(leave.Type)
                                                    )}>
                                                        {leave.Type}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">
                                                        Applied: {leave.AppliedOn}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Duration (Start/End & Total Days) */}
                                            <td className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                        {leave.Start} — {leave.End}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                        Total: {leave.Days} Day{leave.Days > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-5">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
                                                    getStatusStyles(leave.Status)
                                                )}>
                                                    {getStatusIcon(leave.Status)}
                                                    {leave.Status}
                                                </span>
                                            </td>
                                            
                                            {/* Action / Individual Export */}
                                            <td className="py-5 text-right pr-4">
                                                <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <Button 
                                                        onClick={() => handleExport('csv', leave.ReqID)}
                                                        size="icon" 
                                                        variant="ghost" 
                                                        title="Export CSV"
                                                        className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-400"
                                                    >
                                                        <FileSpreadsheet className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleExport('pdf', leave.ReqID)}
                                                        size="icon" 
                                                        variant="ghost" 
                                                        title="Export PDF"
                                                        className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-900/50 dark:hover:text-rose-400"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Footer */}
                {totalPages > 0 && (
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