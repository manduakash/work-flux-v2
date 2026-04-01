"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarDays, FileText, Send,
    AlertCircle, CheckCircle2, Loader2,
    ChevronRight, X, Info
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    callGetAPIWithToken,
    callAPIWithToken
} from '@/components/apis/commonAPIs';
import { getCookie } from '@/utils/cookies';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

interface LeaveType {
    LeaveApplicationTypeID: number;
    LeaveApplicationTypeName: string;
}

export default function LeaveApplicationPage() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        leaveFrom: '',
        leaveTo: '',
        description: ''
    });

    // Error/Merge Dialog State
    const [mergeDialog, setMergeDialog] = useState<{
        show: boolean;
        message: string;
        pendingData: any;
    }>({
        show: false,
        message: '',
        pendingData: null
    });

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            setLoading(true);
            try {
                const res = await callGetAPIWithToken('master/leave-application-types');
                if (res?.success) {
                    setLeaveTypes(res.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch leave types:", error);
                toast.error("Could not load leave types");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaveTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.leaveTypeId || !formData.leaveFrom || !formData.leaveTo || !formData.description) {
            toast.error("Please fill in all fields");
            return;
        }

        await applyLeave(formData);
    };

    const applyLeave = async (data: any) => {
        setIsSubmitting(true);
        try {
            // We use direct fetch here because commonAPIs.ts throws generic Error and loses the 'code' field needed for merging
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}attendance/leave-application`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Leave application submitted successfully!");
                resetForm();
            } else if (result.error?.code === 2) {
                // Duplicate detection
                setMergeDialog({
                    show: true,
                    message: result.error.message || "Leave already applied for these dates.",
                    pendingData: data
                });
            } else {
                toast.error(result.error?.message || "Failed to submit leave application");
            }
        } catch (error) {
            console.error("Apply leave error:", error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMerge = async () => {
        setIsSubmitting(true);
        try {
            const res = await callAPIWithToken('attendance/merge-leave', mergeDialog.pendingData);
            if (res?.success) {
                toast.success("Leaves merged successfully!");
                setMergeDialog({ show: false, message: '', pendingData: null });
                resetForm();
            } else {
                toast.error(res?.message || "Failed to merge leaves");
            }
        } catch (error: any) {
            toast.error(error?.message || "Merge operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            leaveTypeId: '',
            leaveFrom: '',
            leaveTo: '',
            description: ''
        });
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1200px] mx-auto space-y-10 p-4 md:p-10 relative"
        >
            {/* Header */}
            <div className="flex flex-col gap-2 relative">
                <div className="flex items-center gap-3 mb-2">
                    <span className="h-px w-8 bg-indigo-600/30" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Leave Management</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                    Apply For <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 animate-gradient-x">Leave</span>
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                    Submit your leave requests for approval. If you apply for dates that overlap with existing leaves, you can choose to merge them.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Section */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-12 rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 dark:border-slate-800 dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Leave Type Dropdown */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type of Leave</label>
                                <div className="relative">
                                    <select
                                        name="leaveTypeId"
                                        value={formData.leaveTypeId}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-6 pr-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="">Select Leave Type</option>
                                        {leaveTypes.map(type => (
                                            <option key={type.LeaveApplicationTypeID} value={type.LeaveApplicationTypeID}>
                                                {type.LeaveApplicationTypeName}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronRight className="h-4 w-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Filler to keep spacing or add more fields */}
                            <div className="hidden md:block" />

                            {/* Date From */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Leave From</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                                    <input
                                        type="date"
                                        name="leaveFrom"
                                        value={formData.leaveFrom}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Date To */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Leave To</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500" />
                                    <input
                                        type="date"
                                        name="leaveTo"
                                        value={formData.leaveTo}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason / Description</label>
                            <div className="relative">
                                <FileText className="absolute left-6 top-6 h-4 w-4 text-slate-400" />
                                <textarea
                                    name="description"
                                    rows={4}
                                    placeholder="PLEASE PROVIDE A BRIEF DESCRIPTION FOR YOUR LEAVE..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Submitting Application...</>
                            ) : (
                                <><Send className="h-5 w-5" /> Submit Application</>
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>

            {/* Merge/Overlap Dialog */}
            <AnimatePresence>
                {mergeDialog.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            onClick={() => setMergeDialog({ ...mergeDialog, show: false })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mb-6">
                                    <Info className="h-10 w-10 text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Overlap Detected</h3>
                                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {mergeDialog.message}
                                </p>
                                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                                    <Button
                                        variant="outline"
                                        onClick={() => setMergeDialog({ ...mergeDialog, show: false })}
                                        className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Discard Changes
                                    </Button>
                                    <Button
                                        onClick={handleMerge}
                                        disabled={isSubmitting}
                                        className="h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : "Merge Leaves"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
