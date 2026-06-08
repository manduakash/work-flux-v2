"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Download, Search, 
    Trash2, Edit3, Loader2, X
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as API from '@/components/apis/commonAPIs';

// --- Interfaces ---
interface Holiday {
    holiday_id: number;
    holiday_name: string;
    holiday_date: string; // "DD MMM YYYY"
    day_name: string;
    month_label: string;
    month_number: number;
    year: number;
    is_active: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export default function HolidayManagement() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Modal & Form States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [formData, setFormData] = useState({ hm_name: "", hm_date: "" });
    const [submitting, setSubmitting] = useState(false);

    /**
     * Fetch Holidays from API
     */
    const fetchHolidays = useCallback(async (yearToFetch: number) => {
        setLoading(true);
        try {
            // month=0 fetches the entire year
            const response = await API.callGetAPIWithToken(`accountant/holidays?month=0&year=${yearToFetch}`);
            if (response?.success) {
                const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
                // Sort by actual date timestamp
                const sortedData = data.sort((a: Holiday, b: Holiday) => 
                    new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime()
                );
                setHolidays(sortedData);
            } else {
                setHolidays([]);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to fetch holidays");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHolidays(selectedYear);
    }, [selectedYear, fetchHolidays]);

    /**
     * Helper: Convert API date format to HTML Input YYYY-MM-DD
     */
    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    /**
     * Export Table to CSV
     */
    const handleExportCSV = () => {
        if (holidays.length === 0) {
            toast.error("No data available to export");
            return;
        }

        const headers = ["Holiday Name", "Date", "Day", "Year"];
        const csvRows = holidays.map(h => [
            `"${h.holiday_name.replace(/"/g, '""')}"`, // Handle names with commas or quotes
            h.holiday_date,
            h.day_name,
            h.year
        ].join(","));

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Holidays_Registry_${selectedYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("CSV Exported Successfully");
    };

    const handleOpenForm = (holiday?: Holiday) => {
        if (holiday) {
            setEditingHoliday(holiday);
            setFormData({ 
                hm_name: holiday.holiday_name, 
                hm_date: formatDateForInput(holiday.holiday_date) 
            });
        } else {
            setEditingHoliday(null);
            setFormData({ hm_name: "", hm_date: new Date().toISOString().split('T')[0] });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.hm_name || !formData.hm_date) {
            toast.error("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        try {
            const endpoint = editingHoliday 
                ? `accountant/holidays/${editingHoliday.holiday_id}` 
                : `accountant/holidays`;
            
            const method = editingHoliday ? API.callPutAPIWithToken : API.callAPIWithToken;
            const response = await method(endpoint, formData);
            
            if (response?.success) {
                toast.success(response.message || "Holiday saved successfully");
                
                // Parse submitted year using local time to avoid shifting
                const submittedYear = new Date(formData.hm_date + "T00:00:00").getFullYear();
                setSearchTerm(""); // Clear search to show new item
                
                if (submittedYear !== selectedYear) {
                    setSelectedYear(submittedYear);
                } else {
                    fetchHolidays(selectedYear);
                }
                setIsFormOpen(false);
            } else {
                toast.error(response?.message || "Failed to save holiday");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this holiday?")) return;
        try {
            const response = await API.callDeleteAPIWithToken(`accountant/holidays/${id}`);
            if (response?.success) {
                toast.success("Holiday deleted");
                fetchHolidays(selectedYear);
            }
        } catch (error) {
            toast.error("Delete request failed");
        }
    };

    const filteredHolidays = holidays.filter(h => 
        h.holiday_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10">
            
            {/* Header */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Company Calendar</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Holiday <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Registry</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button 
                        onClick={handleExportCSV} 
                        variant="ghost" 
                        className="h-14 rounded-3xl px-6 font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Download className="mr-3 h-5 w-5 text-indigo-500" /> Export CSV
                    </Button>
                    <Button 
                        onClick={() => handleOpenForm()} 
                        className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                    >
                        <Plus className="mr-3 h-5 w-5" /> Add Holiday
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH HOLIDAY NAME..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 ring-indigo-500/20"
                    />
                </div>
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-14 px-8 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest cursor-pointer outline-none focus:ring-2 ring-indigo-500/20"
                >
                    {[2023, 2024, 2025, 2026, 2027].map(y => (
                        <option key={y} value={y}>{y} Fiscal Year</option>
                    ))}
                </select>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Calendar...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto p-10 pt-6">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="opacity-50">
                                    <th className="pb-4 pl-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Holiday Name</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Date</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Weekday</th>
                                    <th className="pb-4 pr-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHolidays.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center text-xs font-black uppercase text-slate-400">No records found for {selectedYear}</td>
                                    </tr>
                                ) : (
                                    filteredHolidays.map((holiday) => (
                                        <tr key={holiday.holiday_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-6 pl-4 font-black text-sm uppercase text-indigo-600">
                                                {holiday.holiday_name}
                                            </td>
                                            <td className="py-6 text-xs font-bold text-slate-500 uppercase">
                                                {holiday.holiday_date}
                                            </td>
                                            <td className="py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                    holiday.day_name === "Sunday" || holiday.day_name === "Saturday" 
                                                        ? "bg-rose-100 text-rose-600" 
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                                                )}>
                                                    {holiday.day_name}
                                                </span>
                                            </td>
                                            <td className="py-6 pr-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button onClick={() => handleOpenForm(holiday)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-indigo-50 hover:text-indigo-600">
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button onClick={() => handleDelete(holiday.holiday_id)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 z-10 border border-slate-200 dark:border-slate-800 shadow-2xl">
                            <div className="flex justify-between items-start mb-8">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">
                                    {editingHoliday ? "Modify" : "New"} <span className="text-indigo-600">Holiday</span>
                                </h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)} className="rounded-full">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-4">Holiday Title</label>
                                    <input 
                                        required 
                                        placeholder="e.g. September Celebration"
                                        value={formData.hm_name} 
                                        onChange={(e) => setFormData({...formData, hm_name: e.target.value})} 
                                        className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-4">Select Date</label>
                                    <input 
                                        required 
                                        type="date" 
                                        value={formData.hm_date} 
                                        onChange={(e) => setFormData({...formData, hm_date: e.target.value})} 
                                        className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20" 
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button disabled={submitting} type="submit" className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-indigo-600/20">
                                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm Registry"}
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