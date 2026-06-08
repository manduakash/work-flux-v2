"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileSpreadsheet, Search, CalendarDays, 
    Users, Activity, Loader2, X, Eye, Fingerprint, 
    Globe, Smartphone, ShieldCheck, MapPin, Clock, Info, Key
} from 'lucide-react';
import Cookies from 'js-cookie';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';
import { getCookie } from '@/utils/cookies';

// Dynamic Import for Map
const FaceAuditMap = dynamic(() => import('@/components/AuditMap'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-[2rem]" />
});

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// --- Interfaces ---
interface AttendanceSummary {
    employee_id: number;
    employee_name: string;
    present: string | number;
    late: string | number;
    absent: string | number;
    on_leave: string | number;
    half_day: string | number;
    out_of_office: string | number;
}

interface FaceLog {
    log_id: number;
    employee_name: string;
    nspl_id: string;
    latitude: number;
    longitude: number;
    match_score: number;
    checkin_time: string;
    checkout_time: string;
    login_date: string;
    device_info: string;
    ip_address: string;
    status: string;
    profile_image: string;
    designation: string;
    duration: string;
}

export default function AttendanceDashboard() {
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [faceLogs, setFaceLogs] = useState<FaceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLog, setSelectedLog] = useState<FaceLog | null>(null);

    // Initialize date
    const today = new Date();
    const [selectedMonthYear, setSelectedMonthYear] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    );

    // Get current user ID from cookie
    
    const fetchData = async () => {
        const currentUser = getCookie('user') ;
        const currentUserId = currentUser.user_id ;
        console.log(currentUserId);
        setLoading(true);
        try {
            const [year, month] = selectedMonthYear.split("-");
            
            // 1. Fetch Attendance Report (Stats)
            const resStats = await callGetAPIWithToken(
                `accountant/dashboard/attendance-report?user_id=${currentUserId}&month=${month}&year=${year}`
            );

            // 2. Fetch Face Login Logs
            const resFace = await callGetAPIWithToken(`accountant/face-login-logs?ua_id=${currentUserId}&date_from=2026-06-01&date_to=2026-06-08`);

            if (resStats?.success) setSummary(resStats.data[0]);
            if (resFace?.success) setFaceLogs(resFace.data);
        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonthYear]);
    
    

    // CSV Export Logic
    const handleExportCSV = () => {
        const headers = ["Date", "Employee", "NSPL ID", "Check-In", "Check-Out", "Duration", "Confidence", "Status"];
        const rows = faceLogs.map(log => [
            log.login_date,
            `"${log.employee_name}"`,
            log.nspl_id,
            log.checkin_time,
            log.checkout_time || "Pending",
            log.duration || "N/A",
            `${(log.match_score * 100).toFixed(1)}%`,
            log.status
        ].join(","));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Face_Audit_${selectedMonthYear}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const filteredLogs = faceLogs.filter(log =>
        log.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.nspl_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Enterprise Attendance Audit</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                        Logs <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">& Biometrics</span>
                    </h1>
                </div>

                <div className="flex gap-4">
                    <input 
                        type="month" 
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                        className="h-14 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button onClick={handleExportCSV} className="h-14 rounded-3xl bg-slate-900 text-white px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all">
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Audit
                    </Button>
                </div>
            </div>

            {/* Attendance Summary Grid (Reference UI Style) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Present', val: summary?.present || '0', color: 'text-emerald-600' },
                    { label: 'Absent', val: summary?.absent || '0', color: 'text-rose-600' },
                    { label: 'Half Day', val: summary?.half_day || '0', color: 'text-amber-600' },
                    { label: 'Leave', val: summary?.on_leave || '0', color: 'text-indigo-600' },
                    { label: 'Late', val: summary?.late || '0', color: 'text-orange-500' },
                    { label: 'Out Office', val: summary?.out_of_office || '0', color: 'text-slate-500' },
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                        <p className={cn("text-3xl font-black", stat.color)}>{stat.val}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter and Search */}
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="SEARCH BY EMPLOYEE NAME OR NSPL ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Biometric Logs Table */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                            <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-500">Personnel</th>
                            <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-500 text-center">Confidence</th>
                            <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-500 text-center">Date</th>
                            <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-500 text-center">Check-In</th>
                            <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right pr-12">Logs</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-slate-400">Loading Biometric Data...</td></tr>
                        ) : filteredLogs.map((log) => (
                            <tr key={log.log_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                            {log.profile_image ? <img src={log.profile_image} className="object-cover h-full w-full" /> : <Users className="text-slate-300" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase">{log.employee_name}</p>
                                            <p className="text-[10px] font-bold text-slate-400">UID: {log.nspl_id || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-center">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black",
                                        log.match_score >= 0.8 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    )}>
                                        {(Number(log.match_score) * 100).toFixed(1)}% Match
                                    </span>
                                </td>
                                <td className="p-6 text-center font-black text-xs text-slate-500">{log.login_date}</td>
                                <td className="p-6 text-center font-black text-sm text-indigo-600">{log.checkin_time}</td>
                                <td className="p-6 text-right pr-12">
                                    <Button onClick={() => setSelectedLog(log)} variant="ghost" className="h-10 rounded-xl font-black uppercase text-[10px] gap-2">
                                        <Eye className="h-4 w-4" /> Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Audit Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLog(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            
                            <div className="p-10 md:p-12 overflow-y-auto">
                                <div className="flex justify-between items-start mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex gap-8">
                                        <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center overflow-hidden ring-4 ring-white">
                                            {selectedLog.profile_image ? <img src={selectedLog.profile_image} className="w-full h-full object-cover" /> : <Users size={40} className="text-indigo-200" />}
                                        </div>
                                        <div>
                                            <h2 className="text-4xl font-black uppercase tracking-tighter">{selectedLog.employee_name}</h2>
                                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{selectedLog.designation || 'Staff member'}</p>
                                            <div className="flex flex-wrap gap-6 mt-4">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Globe className="h-4 w-4" /> IP: {selectedLog.ip_address}</div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><MapPin className="h-4 w-4" /> {selectedLog.latitude}, {selectedLog.longitude}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" onClick={() => setSelectedLog(null)} className="rounded-full h-12 w-12"><X /></Button>
                                </div>

                                <div className="grid lg:grid-cols-12 gap-10">
                                    {/* Modal Left: Method Difference */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] space-y-6">
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Login Verification</h4>
                                            
                                            <div className="space-y-4">
                                                <div className="relative p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/20 shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[12px] font-black uppercase text-emerald-600 flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Face Auth</span>
                                                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status: Match {(selectedLog.match_score * 100).toFixed(2)}%</div>
                                                </div>

                                                <div className="relative p-5 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 opacity-60">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[12px] font-black uppercase text-slate-500 flex items-center gap-2"><Key className="h-4 w-4" /> Password</span>
                                                        <div className="text-[8px] font-black px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md">BYPASSED</div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">Biometric priority enabled</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2"><Smartphone size={16}/> Device Metadata</h4>
                                            <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight">
                                                {selectedLog.device_info}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Modal Right: Map */}
                                    <div className="lg:col-span-8 flex flex-col gap-6">
                                        <div className="flex-1 min-h-[450px] w-full rounded-[3rem] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-2xl relative z-0">
                                            <FaceAuditMap 
                                                lat={Number(selectedLog.latitude)} 
                                                lng={Number(selectedLog.longitude)} 
                                                label={`${selectedLog.employee_name} Verification Point`} 
                                            />
                                        </div>
                                        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] border border-amber-200 dark:border-amber-900/40 flex items-center gap-4">
                                            <Info className="h-6 w-6 text-amber-500 shrink-0" />
                                            <p className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase leading-relaxed tracking-widest">
                                                Biometric session recorded at {selectedLog.checkin_time}. Coordinates verify access within the authorized geographic perimeter.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}