"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, CalendarDays, Loader2, X, Eye, 
    Fingerprint, Globe, Smartphone, ShieldCheck, 
    MapPin, Clock, Info, UserCheck, Key, AlertCircle,
    ShieldAlert, Database
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { callGetAPIWithToken } from '@/components/apis/commonAPIs';

// Dynamically import map to avoid "window is not defined" error
const FaceAuditMap = dynamic(() => import('@/components/AuditMap'), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Locating...</span>
        </div>
    )
});

// --- Interfaces ---
interface FaceLog {
    log_id: number;
    user_id: number;
    employee_name: string;
    username: string;
    email: string;
    contact_no: string;
    profile_image: string;
    role: string;
    designation: string;
    nspl_id: string;
    latitude: number;
    longitude: number;
    match_score: number;
    ip_address: string;
    device_info: string;
    status: 'success' | 'failed' | string;
    failed_reason: string | null;
    checkin_at: string;
    checkout_at: string;
    login_date: string;
    checkin_time: string;
    checkout_time: string;
    duration: string;
}

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function FaceLoginAudit() {
    const [logs, setLogs] = useState<FaceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLog, setSelectedLog] = useState<FaceLog | null>(null);

    // Filters
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let query = `accountant/face-login-logs`;
            const params = new URLSearchParams();
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            
            const response = await callGetAPIWithToken(params.toString() ? `${query}?${params.toString()}` : query);
            if (response?.success) {
                setLogs(response.data);
            }
        } catch (error) {
            console.error("Audit fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    const filteredLogs = logs.filter(log => 
        log.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.nspl_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10 relative"
        >
            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-rose-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600">Security & Biometrics</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Face Login <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500 animate-gradient-x">Audit</span>
                    </h1>
                </div>

                <div className="flex flex-wrap gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
                    <div className="flex items-center gap-2 px-4 border-r border-slate-200 dark:border-slate-800">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none" />
                        <span className="text-slate-300">/</span>
                        <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none" />
                    </div>
                    <Button onClick={fetchLogs} className="h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] px-8">
                        Fetch Logs
                    </Button>
                </div>
            </div>

            {/* Search */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" placeholder="SEARCH EMPLOYEE OR NSPL ID..." 
                        value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                </div>
            </motion.div>

            {/* Main Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto p-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                <th className="pb-4 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Personnel</th>
                                <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Confidence</th>
                                <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Date</th>
                                <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Check-In</th>
                                <th className="pb-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center font-black uppercase tracking-widest text-slate-400">Decrypting Audit Logs...</td></tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.log_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm">
                                                <img src={log.profile_image} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">{log.employee_name}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.nspl_id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-[10px] font-black",
                                                log.match_score >= 0.8 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {(log.match_score * 100).toFixed(1)}% Match
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-5 text-center font-black text-xs uppercase text-slate-600 dark:text-slate-400">{log.login_date}</td>
                                    <td className="py-5 text-center">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{log.checkin_time}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration: {log.duration}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 text-right pr-4">
                                        <Button onClick={() => setSelectedLog(log)} size="sm" variant="outline" className="h-10 rounded-xl font-black uppercase text-[9px] gap-2 border-slate-200 dark:border-slate-800">
                                            <Eye className="h-3.5 w-3.5" /> View Audit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Audit Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLog(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 md:p-12 overflow-y-auto">
                                {/* Modal Header */}
                                <div className="flex justify-between items-start mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex gap-8">
                                        <div className="h-24 w-24 rounded-[2.5rem] bg-slate-100 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800">
                                            <img src={selectedLog.profile_image} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">{selectedLog.employee_name}</h2>
                                            <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mt-1">{selectedLog.designation}</p>
                                            <div className="flex flex-wrap gap-6 mt-4">
                                                <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Globe className="h-4 w-4 text-indigo-500" /> {selectedLog.ip_address}</span>
                                                <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><MapPin className="h-4 w-4 text-rose-500" /> {selectedLog.latitude}, {selectedLog.longitude}</span>
                                                <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Database className="h-4 w-4 text-amber-500" /> NSPL ID: {selectedLog.nspl_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="rounded-full h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X /></Button>
                                </div>

                                <div className="grid lg:grid-cols-12 gap-10">
                                    {/* Panel: Security Analytics */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] space-y-6">
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Comparison</h4>
                                            
                                            {/* Auth Type Difference */}
                                            <div className="space-y-4">
                                                <div className="relative p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/20 shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[12px] font-black uppercase text-emerald-600 flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Face Biometric</span>
                                                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Match Confidence: {(selectedLog.match_score * 100).toFixed(2)}%</div>
                                                </div>

                                                
                                            </div>

                                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In-Time</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedLog.checkin_time}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Out-Time</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedLog.checkout_time || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                                                <Smartphone className="h-4 w-4" /> Source Device
                                            </h4>
                                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight">
                                                {selectedLog.device_info}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Panel: Geographic Audit */}
                                    <div className="lg:col-span-8 flex flex-col gap-6">
                                        <div className="flex-1 min-h-[450px] w-full rounded-[3rem] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-2xl relative z-0">
                                            <FaceAuditMap 
                                                lat={selectedLog.latitude} 
                                                lng={selectedLog.longitude} 
                                                label={`${selectedLog.employee_name} Verification Point`}
                                            />
                                        </div>
                                        
                                        <div className={cn(
                                            "p-6 rounded-[2rem] border flex items-center gap-4 transition-colors",
                                            selectedLog.status === 'success' 
                                                ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                                                : "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400"
                                        )}>
                                            {selectedLog.status === 'success' ? <UserCheck className="h-6 w-6 shrink-0" /> : <ShieldAlert className="h-6 w-6 shrink-0" />}
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black uppercase tracking-widest">Audit Status: {selectedLog.status}</p>
                                                <p className="text-[10px] font-bold opacity-80 uppercase leading-relaxed tracking-widest">
                                                    {selectedLog.status === 'success' 
                                                        ? "The system successfully matched the user's face with the stored profile. Geolocational data indicates a valid access zone."
                                                        : `Verification failed. Reason: ${selectedLog.failed_reason || "Unknown biometric discrepancy"}.`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}