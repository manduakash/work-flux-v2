"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Upload, Search, 
    Trash2, Edit3, Loader2, X, FileText, 
    Download, CalendarRange, Filter
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Fallback: Importing what exists and defining what's missing 
// to prevent the "Export not found" error.
import * as API from '@/components/apis/commonAPIs';

// --- Interfaces ---
interface Holiday {
    holiday_id: number;
    holiday_name: string;
    holiday_date: string;
    day_name: string;
    month_label: string;
    month_number: number;
    year: number;
    is_active: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function HolidayManagement() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    
    // Form States
    const [formData, setFormData] = useState({ hm_name: "", hm_date: "" });
    const [submitting, setSubmitting] = useState(false);

    // Helper to safely call APIs since some exports might be missing
    const safeAPICall = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: any) => {
        try {
            // This maps to the existing functions in your commonAPIs.ts
            if (method === 'GET') return await API.callGetAPIWithToken(endpoint);
            
            // If callPostAPIWithToken is missing, we use callPutAPIWithToken as a reference for the logic
            // or use a generic approach.
            const fnName = `call${method.charAt(0) + method.slice(1).toLowerCase()}APIWithToken`;
            const apiFn = (API as any)[fnName];
            
            if (!apiFn) {
                console.error(`${fnName} is missing in commonAPIs.ts`);
                toast.error(`API Function ${fnName} not found`);
                return null;
            }
            return await apiFn(endpoint, body);
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const fetchHolidays = async () => {
        setLoading(true);
        const response = await safeAPICall('GET', `accountant/holidays?month=0&year=${selectedYear}`);
        if (response?.success) {
            setHolidays(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
            setHolidays([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHolidays();
    }, [selectedYear]);

    const handleOpenForm = (holiday?: Holiday) => {
        if (holiday) {
            setEditingHoliday(holiday);
            setFormData({ hm_name: holiday.holiday_name, hm_date: holiday.holiday_date });
        } else {
            setEditingHoliday(null);
            setFormData({ hm_name: "", hm_date: "" });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const endpoint = editingHoliday ? `accountant/holidays/${editingHoliday.holiday_id}` : `accountant/holidays`;
        const method = editingHoliday ? 'PUT' : 'POST';
        
        const response = await safeAPICall(method, endpoint, formData);
        if (response?.success) {
            toast.success(response.message || "Saved successfully");
            setIsFormOpen(false);
            fetchHolidays();
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this holiday?")) return;
        const response = await safeAPICall('DELETE', `accountant/holidays/${id}`);
        if (response?.success) {
            toast.success("Deleted");
            fetchHolidays();
        }
    };

    const filteredHolidays = holidays.filter(h => 
        h.holiday_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10">
            
            {/* Header */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Company Calendar</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Holiday <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Registry</span>
                    </h1>
                </div>

                {/* <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <Button onClick={() => setIsImportOpen(true)} variant="ghost" className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px]">
                        <Upload className="mr-3 h-5 w-5 text-indigo-500" /> Import CSV
                    </Button>
                    <Button onClick={() => handleOpenForm()} className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] text-white shadow-xl shadow-indigo-600/20">
                        <Plus className="mr-3 h-5 w-5" /> Add Holiday
                    </Button>
                </div> */}
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
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="h-14 px-8 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest cursor-pointer"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y} Fiscal Year</option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
                ) : (
                    <div className="overflow-x-auto p-10 pt-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Event</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Date</th>
                                    <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Day</th>
                                    {/* <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredHolidays.length === 0 ? (
                                    <tr><td colSpan={4} className="py-20 text-center text-xs font-black uppercase text-slate-400">No holidays found</td></tr>
                                ) : (
                                    filteredHolidays.map((holiday) => (
                                        <tr key={holiday.holiday_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="py-6 font-black text-sm uppercase tracking-tight">{holiday.holiday_name}</td>
                                            <td className="py-6 text-xs font-bold text-slate-500 uppercase">{holiday.holiday_date}</td>
                                            <td className="py-6">
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest">{holiday.day_name}</span>
                                            </td>
                                            <td className="py-6 text-right">
                                                {/* <div className="flex justify-end gap-2">
                                                    <Button onClick={() => handleOpenForm(holiday)} variant="ghost" size="icon" className="text-indigo-600"><Edit3 className="h-4 w-4" /></Button>
                                                    <Button onClick={() => handleDelete(holiday.holiday_id)} variant="ghost" size="icon" className="text-rose-500"><Trash2 className="h-4 w-4" /></Button>
                                                </div> */}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 z-10 border border-slate-200 dark:border-slate-800">
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">{editingHoliday ? "Edit Holiday" : "New Holiday"}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-4">Holiday Name</label>
                                    <input required value={formData.hm_name} onChange={(e) => setFormData({...formData, hm_name: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-4">Event Date</label>
                                    <input required type="date" value={formData.hm_date} onChange={(e) => setFormData({...formData, hm_date: e.target.value})} className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm outline-none" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button type="button" onClick={() => setIsFormOpen(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px]">Cancel</Button>
                                    <Button disabled={submitting} type="submit" className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px]">
                                        {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
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