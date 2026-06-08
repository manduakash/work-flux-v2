"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays, Plus, Trash2, Edit3, 
    Search, Loader2, X, AlertCircle, Calendar as CalendarIcon,
    CheckCircle2
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
// Ensure these paths match where you saved the functions in Step 1
import { 
    callGetAPIWithToken, 
    callAPIWithToken, 
    callPutAPIWithToken, 
    callDeleteAPIWithToken 
} from '@/components/apis/commonAPIs';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

interface WeekOff {
    weekoff_id: number;
    off_date: string;
    day_name: string;
    month_label: string;
    month_number: number;
    year: number;
}

export default function WeekOffManagement() {
    const [weekOffs, setWeekOffs] = useState<WeekOff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ off_date: "" });

    const today = new Date();
    const initialMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);

    // --- API Calls ---

    const fetchWeekOffs = async () => {
        setLoading(true);
        try {
            const [year, month] = selectedMonthYear.split("-");
            // API: accountant/weekoffs?month=5&year=2026
            const response = await callGetAPIWithToken(`accountant/weekoffs?month=${parseInt(month)}&year=${year}`);
            
            if (response?.success) {
                // Ensure data is always treated as an array
                const data = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
                setWeekOffs(data);
            } else {
                setWeekOffs([]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setWeekOffs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let response;
            if (editingId) {
                response = await callPutAPIWithToken(`accountant/weekoffs/${editingId}`, formData);
            } else {
                response = await callAPIWithToken(`accountant/weekoffs`, formData);
            }

            if (response?.success) {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ off_date: "" });
                fetchWeekOffs();
            } else {
                alert(response?.message || "Operation failed");
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this week-off? This might affect attendance calculations.")) return;
        try {
            const response = await callDeleteAPIWithToken(`accountant/weekoffs/${id}`);
            if (response?.success) {
                fetchWeekOffs();
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    useEffect(() => {
        fetchWeekOffs();
    }, [selectedMonthYear]);

    // --- Helpers ---
    const openAddModal = () => {
        setEditingId(null);
        setFormData({ off_date: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (wo: WeekOff) => {
        setEditingId(wo.weekoff_id);
        setFormData({ off_date: wo.off_date });
        setIsModalOpen(true);
    };

    const filteredData = weekOffs.filter(wo => 
        wo.day_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.off_date?.includes(searchTerm)
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1200px] mx-auto space-y-8 p-4 md:p-10 relative"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Scheduler & Policy</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Week-Off <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">Management</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-emerald-500" />
                        Status: <span className="font-bold text-emerald-500 uppercase tracking-widest text-xs">Active</span> — Automated exclusion for payroll.
                    </p>
                </div>

                {/* <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button
                        onClick={openAddModal}
                        className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all text-white"
                    >
                        <Plus className="mr-3 h-5 w-5" />
                        Add Week-Off
                    </Button>
                </div> */}
            </div>

            {/* Filter Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH BY DAY OR DATE..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative">
                        <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Main Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-10 pb-6">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Scheduled Off-Days</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        Listing {filteredData.length} records for the selected period
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">Syncing Calendar...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto px-10 pb-10">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Date & Day</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Status</th>
                                    {/* <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-20 text-center">
                                            <AlertCircle className="mx-auto h-12 w-12 text-slate-200 dark:text-slate-700 mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">No week-offs found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((wo) => (
                                        <tr key={wo.weekoff_id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                                                        <span className="text-[10px] font-black text-indigo-600 uppercase leading-none">
                                                            {wo.day_name?.substring(0, 3)}
                                                        </span>
                                                        <span className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1">
                                                            {new Date(wo.off_date).getDate()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight block">
                                                            {wo.day_name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                            {wo.off_date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <span className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {wo.month_label}
                                                </span>
                                            </td>
                                            {/* <td className="py-6 text-right pr-4"> */}
                                                {/* <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => openEditModal(wo)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl h-10 w-10 p-0 border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(wo.weekoff_id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl h-10 w-10 p-0 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div> */}
                                            {/* </td> */}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 z-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                    {editingId ? "Update Week-off" : "Add New Week-off"}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X /></button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                                        Select Holiday Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.off_date}
                                        onChange={(e) => setFormData({ off_date: e.target.value })}
                                        className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-14 rounded-3xl font-black uppercase tracking-widest text-[11px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-14 rounded-3xl bg-indigo-600 font-black uppercase tracking-widest text-[11px] text-white shadow-lg shadow-indigo-600/20"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : (editingId ? "Update" : "Confirm")}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}