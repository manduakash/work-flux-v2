"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader2, X, Eye, IndianRupee, 
    ArrowUpRight, ArrowDownRight, Edit3, Save, 
    Wallet, CreditCard, Landmark, FileSpreadsheet, Download
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { callGetAPIWithToken, callPutAPIWithToken } from '@/components/apis/commonAPIs';
import { toast } from 'sonner';

// --- Interfaces ---
interface SalaryStructure {
    salary_id: number;
    user_id: number;
    employee_name: string;
    nspl_id: string;
    designation: string;
    monthly_salary: string | number;
    basic: string | number;
    hra: string | number;
    conv_allowance: string | number;
    special_allowance: string | number;
    gross_salary: string | number;
    pf_employee: string | number;
    esi_employee: string | number;
    professional_tax: string | number;
    total_deduction: string | number;
    net_salary: string | number;
    bank_account_no: string;
    ifsc_code: string;
    effective_from: string;
    is_active: number;
}

// --- Animations ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export default function SalaryStructurePage() {
    const [salaries, setSalaries] = useState<SalaryStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal State
    const [selectedSalary, setSelectedSalary] = useState<SalaryStructure | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchSalaries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await callGetAPIWithToken('accountant/salary');
            if (response?.success && response?.data) {
                setSalaries(response.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load salary structures");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSalaries();
    }, [fetchSalaries]);

    // --- Export CSV Logic ---
    const handleExportCSV = () => {
        if (filteredData.length === 0) {
            toast.error("No data available to export");
            return;
        }

        const headers = [
            "Employee Name", "NSPL ID", "Designation", "Gross Salary", "Basic", 
            "HRA", "Conveyance", "Special Allowance", "PF Employee", "ESI Employee", 
            "Prof. Tax", "Total Deduction", "Net Salary", "Bank Account", "IFSC Code", "Effective From"
        ];

        const csvRows = [
            headers.join(','), // Header row
            ...filteredData.map(s => [
                `"${s.employee_name}"`,
                `"${s.nspl_id}"`,
                `"${s.designation}"`,
                s.gross_salary,
                s.basic,
                s.hra,
                s.conv_allowance,
                s.special_allowance,
                s.pf_employee,
                s.esi_employee,
                s.professional_tax,
                s.total_deduction,
                s.net_salary,
                `'${s.bank_account_no}`, // Prefix with ' to prevent Excel from scientific notation
                `"${s.ifsc_code}"`,
                new Date(s.effective_from).toLocaleDateString()
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `Salary_Structures_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("CSV Downloaded Successfully");
    };

    // Live Math Logic
    const syncCalculations = (data: SalaryStructure) => {
        const basic = Number(data.basic) || 0;
        const hra = Number(data.hra) || 0;
        const conv = Number(data.conv_allowance) || 0;
        const special = Number(data.special_allowance) || 0;
        
        const pf = Number(data.pf_employee) || 0;
        const esi = Number(data.esi_employee) || 0;
        const ptax = Number(data.professional_tax) || 0;

        const gross = basic + hra + conv + special;
        const deductions = pf + esi + ptax;

        return {
            ...data,
            gross_salary: gross.toFixed(2),
            monthly_salary: gross.toFixed(2),
            total_deduction: deductions.toFixed(2),
            net_salary: (gross - deductions).toFixed(2)
        };
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSalary) return;
        
        setIsUpdating(true);
        try {
            const payload = {
                es_designation: selectedSalary.designation,
                es_monthly_salary: Number(selectedSalary.gross_salary),
                es_basic: Number(selectedSalary.basic),
                es_hra: Number(selectedSalary.hra),
                es_conv_allow: Number(selectedSalary.conv_allowance),
                es_special_allow: Number(selectedSalary.special_allowance),
                es_pf_employee: Number(selectedSalary.pf_employee),
                es_esi_employee: Number(selectedSalary.esi_employee),
                es_ptax: Number(selectedSalary.professional_tax),
                es_bank_ac_no: selectedSalary.bank_account_no,
                es_ifsc_code: selectedSalary.ifsc_code,
                es_effective_from: selectedSalary.effective_from.split('T')[0]
            };

            const response = await callPutAPIWithToken(`accountant/salary/${selectedSalary.salary_id}`, payload);
            if (response?.success) {
                toast.success("Structure Updated Successfully");
                setSelectedSalary(null);
                fetchSalaries();
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredData = salaries.filter(s => 
        s.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.nspl_id.includes(searchTerm)
    );

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-10">
            
            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Personnel Finance</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Salary <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Master</span>
                    </h1>
                </div>
                <Button 
                    onClick={handleExportCSV}
                    disabled={loading || salaries.length === 0}
                    className="h-14 rounded-3xl bg-indigo-600 px-10 font-black uppercase tracking-widest text-[11px] text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Download className="mr-3 h-5 w-5" /> Export Data Structure
                </Button>
            </div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="SEARCH EMPLOYEE NAME OR NSPL ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-16 pr-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="rounded-[3.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 opacity-50">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Syncing Records...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-400">Personnel</th>
                                    <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-400">Gross Monthly</th>
                                    <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-400">Deductions</th>
                                    <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-400">Net Salary</th>
                                    <th className="p-8 font-black text-[10px] uppercase tracking-widest text-slate-400">Bank Info</th>
                                    <th className="p-8 text-right font-black text-[10px] uppercase tracking-widest text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-slate-400 uppercase font-black text-xs">No records matching your search</td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr key={item.salary_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                                                        {item.employee_name.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{item.employee_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.nspl_id} • {item.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8 font-black text-sm">₹{Number(item.gross_salary).toLocaleString()}</td>
                                            <td className="p-8 font-black text-sm text-rose-500">₹{Number(item.total_deduction).toLocaleString()}</td>
                                            <td className="p-8 font-black text-base text-emerald-600">₹{Number(item.net_salary).toLocaleString()}</td>
                                            <td className="p-8">
                                                <div className="flex flex-col text-[10px] font-bold text-slate-400 uppercase">
                                                    <span className="flex items-center gap-1.5"><CreditCard className="h-3 w-3" /> {item.bank_account_no}</span>
                                                    <span className="flex items-center gap-1.5"><Landmark className="h-3 w-3" /> {item.ifsc_code}</span>
                                                </div>
                                            </td>
                                            <td className="p-8 text-right">
                                                <Button onClick={() => setSelectedSalary(item)} variant="outline" className="rounded-xl h-10 border-slate-200 dark:border-slate-800 font-black uppercase text-[9px] gap-2">
                                                    <Edit3 className="h-3.5 w-3.5" /> Configure
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Configuration Modal */}
            <AnimatePresence>
                {selectedSalary && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSalary(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-10 overflow-y-auto max-h-[90vh]"
                        >
                            <button onClick={() => setSelectedSalary(null)} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"><X /></button>

                            <div className="mb-10">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Structure Configuration</h2>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{selectedSalary.employee_name} • {selectedSalary.nspl_id}</p>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <ArrowUpRight className="text-emerald-500 h-5 w-5" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Earnings</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <SalaryInput label="Basic Pay" value={selectedSalary.basic} onChange={(v) => setSelectedSalary(syncCalculations({...selectedSalary, basic: v}))} />
                                            <SalaryInput label="HRA" value={selectedSalary.hra} onChange={(v) => setSelectedSalary(syncCalculations({...selectedSalary, hra: v}))} />
                                            <SalaryInput label="Conveyance" value={selectedSalary.conv_allowance} onChange={(v) => setSelectedSalary(syncCalculations({...selectedSalary, conv_allowance: v}))} />
                                            <SalaryInput label="Special Allow" value={selectedSalary.special_allowance} onChange={(v) => setSelectedSalary(syncCalculations({...selectedSalary, special_allowance: v}))} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <ArrowDownRight className="text-rose-500 h-5 w-5" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Statutory Deductions</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <SalaryInput label="PF Employee" value={selectedSalary.pf_employee} onChange={(v) => setSelectedSalary(syncCalculations({...selectedSalary, pf_employee: v}))} />
                                            <SalaryInput label="ESI Employee" value={selectedSalary.esi_employee} onChange={(v) => setSelectedSalary(syncCalculations({...selectedSalary, esi_employee: v}))} />
                                            <SalaryInput label="Prof. Tax" value={selectedSalary.professional_tax} onChange={(v) => setSelectedSalary(syncCalculations({...selectedSalary, professional_tax: v}))} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem]">
                                    <SalaryInput label="Account Number" type="text" value={selectedSalary.bank_account_no} onChange={(v) => setSelectedSalary({...selectedSalary, bank_account_no: v})} />
                                    <SalaryInput label="IFSC Code" type="text" value={selectedSalary.ifsc_code} onChange={(v) => setSelectedSalary({...selectedSalary, ifsc_code: v})} />
                                    <SalaryInput label="Effective Date" type="date" value={selectedSalary.effective_from.split('T')[0]} onChange={(v) => setSelectedSalary({...selectedSalary, effective_from: v})} />
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-8">
                                    <div className="flex gap-10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400">Gross Monthly</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(selectedSalary.gross_salary).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-rose-500">Total Deductions</p>
                                            <p className="text-2xl font-black text-rose-500">₹{Number(selectedSalary.total_deduction).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-indigo-600">Net Monthly</p>
                                            <p className="text-2xl font-black text-emerald-600">₹{Number(selectedSalary.net_salary).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button type="button" variant="ghost" onClick={() => setSelectedSalary(null)} className="h-14 px-8 rounded-3xl font-black uppercase text-xs hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</Button>
                                        <Button disabled={isUpdating} type="submit" className="h-14 px-12 rounded-3xl bg-indigo-600 text-white font-black uppercase text-xs shadow-xl shadow-indigo-600/30 hover:bg-indigo-700">
                                            {isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                            Commit Structure
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SalaryInput({ label, value, onChange, type = "number" }: { label: string, value: any, onChange: (v: any) => void, type?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-12 px-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
        </div>
    );
}