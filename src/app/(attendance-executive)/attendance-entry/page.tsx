"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, CalendarDays, CheckCircle2, UserX, MapPin,
    CalendarOff, Save, Loader2, RotateCcw, Activity
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

// --- Types & Mock Data ---
type StatusType = 'Present' | 'Absent' | 'Leave' | 'Out of Office';

interface EmployeeEntry {
    id: string;
    name: string;
    dept: string;
    status: StatusType;
    checkIn: string;
    checkOut: string;
    isDirty?: boolean;
}

const initialData: EmployeeEntry[] = [
    { id: "EMP-001", name: "Sarah Jenkins", dept: "Engineering", status: "Present", checkIn: "08:50", checkOut: "" },
    { id: "EMP-002", name: "Michael Chang", dept: "Design", status: "Absent", checkIn: "", checkOut: "" },
    { id: "EMP-003", name: "David Kumar", dept: "Sales", status: "Out of Office", checkIn: "09:00", checkOut: "" },
    { id: "EMP-004", name: "Emily Ross", dept: "HR", status: "Leave", checkIn: "", checkOut: "" },
    { id: "EMP-005", name: "James Wilson", dept: "Engineering", status: "Present", checkIn: "09:15", checkOut: "" },
    { id: "EMP-006", name: "Anita Desai", dept: "Marketing", status: "Present", checkIn: "08:55", checkOut: "" },
];

export default function RapidDataEntry() {
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [employees, setEmployees] = useState<EmployeeEntry[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Check if any row has been modified
    const hasUnsavedChanges = employees.some(emp => emp.isDirty);

    // --- Handlers for 1-Click Inline Editing ---

    const handleStatusChange = (id: string, newStatus: StatusType) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                const isDisabling = newStatus === 'Absent' || newStatus === 'Leave';
                return {
                    ...emp,
                    status: newStatus,
                    // Auto-clear times if absent/leave. Auto-fill 09:00 if marked present from absent.
                    checkIn: isDisabling ? "" : (emp.checkIn || "09:00"),
                    checkOut: isDisabling ? "" : emp.checkOut,
                    isDirty: true
                };
            }
            return emp;
        }));
    };

    const handleTimeChange = (id: string, field: 'checkIn' | 'checkOut', value: string) => {
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                return { ...emp, [field]: value, isDirty: true };
            }
            return emp;
        }));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        // Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Clear dirty flags
        setEmployees(prev => prev.map(emp => ({ ...emp, isDirty: false })));
        setIsSaving(false);
        // In a real app, you might show a success toast here
    };

    const handleResetRow = (id: string) => {
        // Revert a single row to its initial state (mocked by finding it in initialData)
        const original = initialData.find(e => e.id === id);
        if (original) {
            setEmployees(prev => prev.map(emp => emp.id === id ? { ...original, isDirty: false } : emp));
        }
    };

    // Filtered data for rendering
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10 relative pb-32">

            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Rapid Data Entry</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">Attendance Log</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" />
                        Inline Edit Mode: <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs">Changes autosave locally</span>
                    </p>
                </div>

                {/* Date & Search Controls */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm w-full lg:w-auto">
                    {/* Date Picker (Native input styled perfectly) */}
                    <div className="relative flex-1 lg:flex-none">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full"
                        />
                    </div>
                    <div className="relative flex-1 lg:flex-none lg:min-w-[300px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="SEARCH EMPLOYEE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Main Interactive Table */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto p-5">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[25%]">Personnel</th>
                                <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[35%] text-center">1-Click Status</th>
                                <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[15%] text-center">Check-In</th>
                                {/* <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[15%] text-center">Check-Out</th> */}
                                <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 w-[10%] text-right pr-4">Reset</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {filteredEmployees.map((emp) => {
                                const isDisabling = emp.status === 'Absent' || emp.status === 'Leave';

                                return (
                                    <motion.tr
                                        variants={itemVariants}
                                        key={emp.id}
                                        className={cn(
                                            "group transition-all duration-300",
                                            emp.isDirty ? "bg-indigo-50/50 dark:bg-indigo-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                        )}
                                    >
                                        {/* 1. Employee Info */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-sm uppercase">
                                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                                        {emp.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                        {emp.id} • {emp.dept}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. 1-Click Segmented Status Toggle */}
                                        <td className="py-4 text-center">
                                            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                                <button
                                                    onClick={() => handleStatusChange(emp.id, 'Present')}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        emp.status === 'Present' ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                    )}
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Present
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(emp.id, 'Absent')}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        emp.status === 'Absent' ? "bg-white dark:bg-slate-900 text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                    )}
                                                >
                                                    <UserX className="h-3.5 w-3.5" /> Absent
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(emp.id, 'Out of Office')}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        emp.status === 'Out of Office' ? "bg-white dark:bg-slate-900 text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                    )}
                                                >
                                                    <MapPin className="h-3.5 w-3.5" /> Out of Office
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(emp.id, 'Leave')}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        emp.status === 'Leave' ? "bg-white dark:bg-slate-900 text-amber-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                    )}
                                                >
                                                    <CalendarOff className="h-3.5 w-3.5" /> Leave
                                                </button>
                                            </div>
                                        </td>

                                        {/* 3. Check-In Time Input */}
                                        {/* <td className="py-4 text-center">
                                            <input
                                                type="time"
                                                disabled={isDisabling}
                                                value={emp.checkIn}
                                                onChange={(e) => handleTimeChange(emp.id, 'checkIn', e.target.value)}
                                                className={cn(
                                                    "w-[110px] h-10 px-3 mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                                    emp.isDirty && "border-indigo-300 bg-indigo-50/30 dark:border-indigo-500/30"
                                                )}
                                            />
                                        </td> */}

                                        {/* 4. Check-Out Time Input */}
                                        <td className="py-4 text-center">
                                            <input
                                                type="time"
                                                disabled={isDisabling}
                                                value={emp.checkOut}
                                                onChange={(e) => handleTimeChange(emp.id, 'checkOut', e.target.value)}
                                                className={cn(
                                                    "w-[110px] h-10 px-3 mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                                                    emp.isDirty && "border-indigo-300 bg-indigo-50/30 dark:border-indigo-500/30"
                                                )}
                                            />
                                        </td>

                                        {/* 5. Undo Action */}
                                        <td className="py-4 text-right pr-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleResetRow(emp.id)}
                                                disabled={!emp.isDirty}
                                                className={cn(
                                                    "h-9 w-9 rounded-xl transition-all",
                                                    emp.isDirty ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" : "opacity-0"
                                                )}
                                                title="Undo changes"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Floating Bulk Save Action Bar */}
            <AnimatePresence>
                {hasUnsavedChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-[2rem] shadow-2xl border border-slate-800 dark:border-slate-200"
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-widest">Unsaved Changes Detected</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Click save to update the master database</span>
                        </div>
                        <Button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 h-12 px-8 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Save All Updates</>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}