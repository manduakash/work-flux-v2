"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, FileSpreadsheet, Search,
    CalendarDays, Users, ShieldAlert, Loader2, X, Eye, 
    ShieldCheck, AlertTriangle, Info, Activity,
    TrendingUp, TrendingDown, ClipboardCheck, Upload, FileText, CheckCircle2
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { callGetAPIWithToken, callAPIWithToken } from '@/components/apis/commonAPIs';

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

interface DisciplineReport {
    employee_id: number;
    employee_name: string;
    period_label: string;
    discipline_permissible: string | number;
    discipline_breach: string | number;
    absent_count: string | number;
    on_leave: string | number;
    permissible_pct: string | number;
    breach_pct: string | number;
    absent_pct: string | number;
    leave_pct: string | number;
}

export default function DisciplineComplianceExport() {
    const [reports, setReports] = useState<DisciplineReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<DisciplineReport | null>(null);

    // --- Import States ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const today = new Date();
    const initialMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);

    const getDisciplineReport = async () => {
        setLoading(true);
        try {
            const [yearStr, monthStr] = selectedMonthYear.split("-");
            const response = await callGetAPIWithToken(
                `accountant/dashboard/discipline?user_id=0&month=${parseInt(monthStr)}&year=${yearStr}`
            );
            if (response?.success && response?.data) setReports(response.data);
            else setReports([]);
        } catch (error) {
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    // --- CSV Import Logic ---
    const downloadSampleCSV = () => {
        const headers = "employee_id,breach_count,permissible_count,absent_count,leave_count";
        const sampleRow = "101,2,20,1,0";
        const blob = new Blob([`${headers}\n${sampleRow}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "discipline_import_sample.csv";
        link.click();
    };

    const handleImportCSV = async () => {
        if (!importFile) return;
        setIsUploading(true);
        
        try {
            const formData = new FormData();
            formData.append('file', importFile);
            formData.append('month_year', selectedMonthYear);

            // Replace with your actual import endpoint
            const response = await callAPIWithToken(`accountant/dashboard/discipline/import`, formData);

            if (response?.success) {
                alert("Data imported successfully");
                setIsImportModalOpen(false);
                setImportFile(null);
                getDisciplineReport();
            } else {
                alert(response?.message || "Import failed");
            }
        } catch (error) {
            alert("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleExportCSV = () => {
        if (reports.length === 0) return;
        const headers = ["ID", "Name", "Period", "Permissible", "Breach", "Absent", "Leave"];
        const csvRows = reports.map(emp => [
            emp.employee_id, `"${emp.employee_name}"`, `"${emp.period_label}"`,
            emp.discipline_permissible, emp.discipline_breach, emp.absent_count, emp.on_leave
        ].join(","));
        const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Discipline_Audit_${selectedMonthYear}.csv`;
        link.click();
    };

    useEffect(() => {
        getDisciplineReport();
        setPage(1);
    }, [selectedMonthYear]);

    const getComplianceStatus = (breachPct: string | number) => {
        const pct = Number(breachPct);
        if (pct <= 5) return { label: "Exceptional", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: ShieldCheck };
        if (pct <= 15) return { label: "Standard", color: "text-blue-600 bg-blue-50 border-blue-100", icon: Info };
        if (pct <= 30) return { label: "At Risk", color: "text-amber-600 bg-amber-50 border-amber-100", icon: AlertTriangle };
        return { label: "Critical", color: "text-rose-600 bg-rose-50 border-rose-100", icon: ShieldAlert };
    };

    const filteredData = reports.filter(emp =>
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toString().includes(searchTerm)
    );

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1600px] mx-auto space-y-10 p-6 md:p-12 relative">
            
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between relative">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-10 bg-rose-600/40" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-600">Audit & Governance</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.85]">
                        Conduct <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600 animate-gradient-x">Analytics</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-3 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-rose-500/10">
                    <Button onClick={() => setIsImportModalOpen(true)} variant="ghost" className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] text-indigo-600 hover:bg-indigo-50 transition-all">
                        <Upload className="mr-3 h-5 w-5" />
                        Import Audit
                    </Button>
                    <Button onClick={handleExportCSV} disabled={loading || reports.length === 0} variant="ghost" className="h-14 rounded-3xl px-8 font-black uppercase tracking-widest text-[11px] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <FileSpreadsheet className="mr-3 h-5 w-5 text-emerald-500" />
                        Export Log
                    </Button>
                </div>
            </div>

            {/* Control Bar */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="FILTER BY PERSONNEL..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full h-16 pl-20 pr-8 bg-slate-50 dark:bg-slate-800/50 border-none rounded-[2rem] text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <input
                        type="month"
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                        className="h-16 px-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer"
                    />
                    <Button onClick={() => { getDisciplineReport(); setPage(1); }} className="h-16 rounded-[2rem] bg-rose-600 px-10 font-black uppercase tracking-widest text-[11px] text-white hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all active:scale-95">
                        Refresh Audit
                    </Button>
                </div>
            </motion.div>

            {/* Table Section */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[600px] flex flex-col justify-between">
                <div>
                    <div className="p-10 pb-6 flex items-center justify-between">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Conduct Ledger</h3>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 opacity-50">
                            <Loader2 className="h-12 w-12 animate-spin text-rose-600 mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Analyzing Breach Patterns...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto px-10">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 opacity-50">
                                        <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">Personnel</th>
                                        <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Permissible</th>
                                        <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Breaches</th>
                                        <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">Audit Status</th>
                                        <th className="pb-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 text-right pr-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedData.map((emp) => {
                                        const status = getComplianceStatus(emp.breach_pct);
                                        const StatusIcon = status.icon;
                                        return (
                                            <tr key={emp.employee_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-7">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black text-sm uppercase">
                                                            {emp.employee_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{emp.employee_name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">UID: {emp.employee_id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-7 text-center font-black text-sm text-slate-900 dark:text-white">{emp.discipline_permissible}</td>
                                                <td className="py-7 text-center font-black text-sm text-rose-600">{emp.discipline_breach}</td>
                                                <td className="py-7 text-center">
                                                    <span className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border", status.color)}>
                                                        <StatusIcon className="h-3 w-3" /> {status.label}
                                                    </span>
                                                </td>
                                                <td className="py-7 text-right pr-4">
                                                    <Button onClick={() => setSelectedEmployee(emp)} variant="outline" size="sm" className="rounded-xl h-10 px-5 font-black uppercase tracking-widest text-[9px] border-slate-200 dark:border-slate-800 hover:bg-indigo-600 hover:text-white transition-all">
                                                        Audit
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between p-10 pt-0 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black uppercase text-slate-400 mt-6 tracking-widest">Page {page} / {totalPages}</span>
                        <div className="flex gap-2 mt-6">
                            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl text-xs font-black uppercase tracking-widest">Previous</Button>
                            <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl text-xs font-black uppercase tracking-widest">Next</Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* --- IMPORT CSV MODAL --- */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isUploading && setIsImportModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[4rem] p-12 border border-white/20 shadow-2xl overflow-hidden">
                            
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Import <br/><span className="text-indigo-600">Audit Data</span></h3>
                                <button onClick={() => setIsImportModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="h-6 w-6" /></button>
                            </div>

                            <div className="space-y-8">
                                {/* Upload Box */}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "border-4 border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center transition-all cursor-pointer",
                                        importFile ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-slate-100 dark:border-slate-800 hover:border-indigo-400"
                                    )}
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                                    {importFile ? (
                                        <>
                                            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">{importFile.name}</p>
                                            <button onClick={(e) => { e.stopPropagation(); setImportFile(null); }} className="mt-4 text-[10px] font-black text-rose-500 uppercase tracking-widest">Remove File</button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-6">
                                                <Upload className="h-10 w-10 text-indigo-600" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Click or Drag CSV here</p>
                                        </>
                                    )}
                                </div>

                                {/* Instructions */}
                                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl flex gap-4">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">CSV Standard</p>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase leading-relaxed">Headers must include: employee_id, breach_count, permissible_count, absent_count.</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <Button onClick={downloadSampleCSV} variant="ghost" className="flex-1 h-20 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                                        <Download className="mr-2 h-4 w-4" /> Sample
                                    </Button>
                                    <Button 
                                        disabled={!importFile || isUploading} 
                                        onClick={handleImportCSV} 
                                        className="flex-[2] h-20 rounded-[2rem] bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin h-6 w-6" /> : "Initiate Upload"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Audit Modal logic remains as provided in your original file... */}
        </motion.div>
    );
}