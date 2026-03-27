"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Search, Filter, ShieldCheck, UserCheck,
    ArrowRight, Loader2, Sparkles, AlertCircle,
    ChevronDown, LayoutGrid, List, RefreshCcw,
    ChevronUp, UserPlus, Info, CheckCheck,
    Clock, Briefcase, UserMinus, Trash2
} from 'lucide-react';
import { callGetAPIWithToken, callAPIWithToken } from '@/components/apis/commonAPIs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Governance Motion Variants ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 120
        }
    }
};

// --- Sub-Component: Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, leadName, projectName, type = 'assign' }: any) => {
    if (!isOpen) return null;
    const isAssign = type === 'assign';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md rounded-[2.5rem] bg-white dark:bg-slate-900 p-10 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
                <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl mb-6",
                    isAssign ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600"
                )}>
                    {isAssign ? <Info size={28} /> : <AlertCircle size={28} />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                    {isAssign ? "Assign Project Lead?" : "Revoke Access?"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {isAssign ? (
                        <>You are about to authorize <span className="font-black text-indigo-600 dark:text-indigo-400">"{leadName}"</span> as a core Project Lead for <span className="font-black text-indigo-600 dark:text-indigo-400">"{projectName}"</span>. This action will be logged in the governance audit trail.</>
                    ) : (
                        <>Caution: Revoking <span className="font-black text-rose-600">"{leadName}"</span> from <span className="font-black text-slate-900 dark:text-white">"{projectName}"</span> will also terminate all dependencies and tasks currently assigned by this lead. This action is irreversible.</>
                    )}
                </p>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 h-12 rounded-xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg",
                            isAssign ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                        )}
                    >
                        {isAssign ? "Confirm Allocation" : "Confirm Revoke"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Sub-Component: Project Row ---
const ProjectRow = ({ project, onAssign, onDeassign, assigning }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <motion.tr
                variants={itemVariants}
                className={cn(
                    "group transition-all duration-300",
                    isExpanded ? "bg-indigo-50/20 dark:bg-indigo-950/20" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                )}
            >
                <td className="px-10 py-7">
                    <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {project.ProjectName}
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                {project.ProjectTypeName}
                            </span>
                            <span className={cn(
                                "text-[10px] font-black uppercase italic tracking-wider ml-1",
                                project.ProjectPriorityName === 'High' ? "text-rose-500" : "text-amber-500"
                            )}>
                                {project.ProjectPriorityName} Priority
                            </span>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-7">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{project.CreatedByName}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{project.CreatedByRoleName || "Founding Authority"}</span>
                    </div>
                </td>
                <td className="px-8 py-7">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between w-32">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Velocity</span>
                            <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 tracking-tighter">{project.ProgressPercentage}%</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${project.ProgressPercentage}%` }} />
                        </div>
                    </div>
                </td>
                <td className="px-8 py-7">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                        {project.ProjectStatusName}
                    </div>
                </td>
                <td className="px-10 py-7 text-right">
                    <Button
                        variant="ghost"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] px-6 transition-all",
                            isExpanded ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900"
                        )}
                    >
                        Manage Leads {isExpanded ? <ChevronUp size={14} className="ml-2" /> : <ChevronDown size={14} className="ml-2" />}
                    </Button>
                </td>
            </motion.tr>

            <AnimatePresence>
                {isExpanded && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <td colSpan={5} className="px-10 pb-10 border-none">
                            <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/30 p-8 border border-slate-100 dark:border-slate-800/50"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Resource Matrix for {project.ProjectName}</h4>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assigned</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Eligible</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {project.LeadArray && project.LeadArray.map((lead: any) => {
                                        const isCreator = project.CreatedByID === lead.LeadID;
                                        return (
                                            <div
                                                key={lead.LeadID}
                                                className={cn(
                                                    "relative flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-300",
                                                    lead.IsAssigned
                                                        ? "bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                                                        : "bg-white dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-xl hover:shadow-indigo-500/5"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-xl flex items-center justify-center text-sm font-black shadow-inner",
                                                        lead.IsAssigned ? "bg-emerald-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                                    )}>
                                                        {lead.LeadFullName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{lead.LeadFullName}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                                                            {lead.IsAssigned ? "Authorized Lead" : "Lead Candidate"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {lead.IsAssigned ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                                                            <CheckCheck size={16} strokeWidth={3} />
                                                        </div>
                                                        {/* User Request: Remove button for all assigned except creator */}
                                                        {!isCreator && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => onDeassign(project, lead)}
                                                                disabled={assigning === `${project.ProjectID}-${lead.LeadID}`}
                                                                className="h-8 w-8 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all"
                                                            >
                                                                {assigning === `${project.ProjectID}-${lead.LeadID}` ? (
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                ) : (
                                                                    <Trash2 size={14} />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => onAssign(project, lead)}
                                                        disabled={assigning === `${project.ProjectID}-${lead.LeadID}`}
                                                        className="h-9 w-9 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-90"
                                                    >
                                                        {assigning === `${project.ProjectID}-${lead.LeadID}` ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <UserPlus size={16} />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </>
    );
};

export default function AssignProjectLead() {
    const [projectsByUser, setProjectsByUser] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | string>('all');
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Unified Confirmation Modal States
    const [confirmation, setConfirmation] = useState<any>({
        isOpen: false,
        type: 'assign', // 'assign' | 'deassign'
        project: null,
        lead: null
    });

    const fetchProjectsByUser = async () => {
        try {
            const response = await callGetAPIWithToken('projects/projects-by-user-id');
            if (response.success) {
                setProjectsByUser(response.data);
            }
        } catch (error) {
            console.error("Governance data fetch failed:", error);
        }
    };

    const initialize = async () => {
        setLoading(true);
        // Reset filter to 'all' to ensure table is re-populated correctly
        setSelectedProjectId('all');
        await fetchProjectsByUser();
        setLoading(false);
    };

    useEffect(() => {
        initialize();
    }, []);

    // Derived unique project options for the filter dropdown
    const uniqueProjectOptions = useMemo(() => {
        const unique = new Map();
        projectsByUser.forEach(p => {
            if (!unique.has(p.ProjectID)) {
                unique.set(p.ProjectID, { id: p.ProjectID, name: p.ProjectName });
            }
        });
        return Array.from(unique.values());
    }, [projectsByUser]);

    const openConfirmation = (project: any, lead: any, type: 'assign' | 'deassign') => {
        setConfirmation({
            isOpen: true,
            type,
            project,
            lead
        });
    };

    const handleExecution = async () => {
        const { project, lead, type } = confirmation;
        if (!project || !lead) return;

        const assignKey = `${project.ProjectID}-${lead.LeadID}`;
        setAssigning(assignKey);
        setConfirmation((prev: any) => ({ ...prev, isOpen: false }));

        try {
            const endpoint = type === 'assign'
                ? 'projects/assign-project-lead-by-admin'
                : 'projects/deassign-team-lead-for-admin';

            const response = await callAPIWithToken(endpoint, {
                projectId: project.ProjectID,
                leadId: lead.LeadID
            });

            if (response.success) {
                toast.success(type === 'assign' ? "Lead authorized successfully" : "Lead revoked successfully");
                await fetchProjectsByUser();
            } else {
                toast.error(response.message || (type === 'assign' ? "Allocation failed" : "Deassignment failed"));
            }
        } catch (error) {
            toast.error("Critical server synchronization failure");
        } finally {
            setAssigning(null);
            setConfirmation({ isOpen: false, project: null, lead: null, type: 'assign' });
        }
    };

    const filteredProjects = useMemo(() => {
        // Strict check for 'all' selection
        const isAll = !selectedProjectId ||
            selectedProjectId === 'all' ||
            String(selectedProjectId).trim().toLowerCase() === 'all';

        if (isAll) {
            return projectsByUser;
        }

        // Return only the matched project
        return projectsByUser.filter(p =>
            String(p.ProjectID) === String(selectedProjectId)
        );
    }, [projectsByUser, selectedProjectId]);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <ShieldCheck className="absolute inset-0 m-auto h-5 w-5 text-indigo-400 opacity-50" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security Handshake in Progress...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1600px] mx-auto space-y-10"
        >
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #6366f1; }
            `}</style>

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                type={confirmation.type}
                leadName={confirmation.lead?.LeadFullName}
                projectName={confirmation.project?.ProjectName}
                onClose={() => setConfirmation({ isOpen: false, project: null, lead: null, type: 'assign' })}
                onConfirm={handleExecution}
            />

            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-500 font-mono">NexIntel Admin Node</span>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Governance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600">Lead Matrix</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 max-w-xl">
                        Full administrative control over lead-to-project authorization. Audit and revoke access within the project resource matrix.
                    </motion.p>
                </div>

                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-3 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-500/5">
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-500" />
                        <select
                            value={selectedProjectId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedProjectId(val);
                                if (val === 'all') {
                                    initialize();
                                }
                            }}
                            className="pl-11 pr-10 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer hover:bg-white dark:hover:bg-slate-900 min-w-[260px]"
                        >
                            <option value="all">All Projects</option>
                            {uniqueProjectOptions.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('table')}
                            className={cn(
                                "p-2.5 rounded-lg transition-all",
                                viewMode === 'table' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={cn(
                                "p-2.5 rounded-lg transition-all",
                                viewMode === 'cards' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => initialize()}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCcw size={16} className="text-indigo-500" />
                    </Button>
                </motion.div>
            </div>

            {/* Governance Workspace */}
            <AnimatePresence mode="wait">
                {filteredProjects.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-32 rounded-[5rem] bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 shadow-inner"
                    >
                        <AlertCircle className="h-20 w-20 text-slate-200 dark:text-slate-800 mb-6" />
                        <h3 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Node Empty</h3>
                        <p className="text-[11px] font-bold text-slate-300 dark:text-slate-700 uppercase mt-2 tracking-widest text-center max-w-xs">No active sectors found in current network parameters.</p>
                    </motion.div>
                ) : viewMode === 'table' ? (
                    <motion.div
                        key="table-view"
                        variants={itemVariants}
                        className="rounded-[3.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 shadow-2xl shadow-indigo-500/5 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Project</th>
                                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Created By</th>
                                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Progress</th>
                                        <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Status</th>
                                        <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {filteredProjects.map((project) => (
                                        <ProjectRow
                                            key={project.ProjectID}
                                            project={project}
                                            onAssign={(p: any, l: any) => openConfirmation(p, l, 'assign')}
                                            onDeassign={(p: any, l: any) => openConfirmation(p, l, 'deassign')}
                                            assigning={assigning}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="card-view"
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredProjects.map((project, idx) => (
                            <motion.div
                                key={project.ProjectID}
                                variants={itemVariants}
                                className="rounded-[4rem] p-10 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 hover:border-indigo-500/30 transition-all relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck size={140} className="text-indigo-600" />
                                </div>

                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl border border-indigo-100/50 dark:border-indigo-900/50">
                                        {project.ProjectName.substring(0, 1)}
                                    </div>
                                    <span className="text-[10px] font-black px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                                        {project.ProgressPercentage}% Velocity
                                    </span>
                                </div>

                                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 group-hover:text-indigo-600 transition-colors relative z-10">{project.ProjectName}</h3>

                                <div className="flex gap-8 mb-10 relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Sector Type</span>
                                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase">{project.ProjectTypeName}</span>
                                    </div>
                                    <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Risk Vector</span>
                                        <span className={cn(
                                            "text-[11px] font-black uppercase italic tracking-wider",
                                            project.ProjectPriorityName === 'High' ? "text-rose-500" : "text-amber-500"
                                        )}>{project.ProjectPriorityName}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Resource Workspace</span>
                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{project.LeadArray?.length || 0} Entities</span>
                                    </div>
                                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                        {project.LeadArray?.map((lead: any) => {
                                            const isCreator = project.CreatedByID === lead.LeadID;
                                            return (
                                                <div
                                                    key={lead.LeadID}
                                                    className={cn(
                                                        "p-4 rounded-[1.7rem] border transition-all flex items-center justify-between",
                                                        lead.IsAssigned
                                                            ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-60 font-black"
                                                            : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-indigo-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-9 w-9 rounded-xl flex items-center justify-center text-[10px] font-black",
                                                            lead.IsAssigned ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                        )}>
                                                            {lead.LeadFullName.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{lead.LeadFullName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {lead.IsAssigned ? (
                                                            <>
                                                                <CheckCheck size={16} className="text-emerald-500" strokeWidth={3} />
                                                                {!isCreator && (
                                                                    <button
                                                                        onClick={() => openConfirmation(project, lead, 'deassign')}
                                                                        className="h-7 w-7 flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        <UserMinus size={14} />
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => openConfirmation(project, lead, 'assign')}
                                                                className="h-8 w-8 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-90"
                                                            >
                                                                <UserPlus size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
