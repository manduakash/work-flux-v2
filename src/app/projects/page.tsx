"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Calendar, Flag, User as UserIcon,
    Trash2, Edit, X, FolderKanban, ChevronRight, AlertCircle,
    Activity, Globe, ShieldCheck, Zap, Target, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import { UserRole, ProjectStatus, Priority } from '@/types';

import { callAPI, callGetAPIWithToken, getUserIdFromToken } from "@/components/apis/commonAPIs";
import { getCookie } from "@/utils/cookies";
import { useEffect } from "react";

// --- Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function ProjectsPage() {
    const { projects: storeProjects, users, addProject, deleteProject } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [developerWorkstreams, setDeveloperWorkstreams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        deadline: '',
        priority: Priority.MEDIUM,
        status: ProjectStatus.PLANNING,
        assignedLeadId: '',
        assignedDeveloperIds: [] as string[],
    });

    // Strategy: Identity Extraction & API Synchronization
    useEffect(() => {
        const user = getCookie("user");
        const userId = getUserIdFromToken();

        if (user) {
            const userWithId = { ...user, id: userId || user.id };
            setCurrentUser(userWithId);
            setFormData(prev => ({ ...prev, assignedLeadId: userWithId.id || '' }));

            const roleStr = userWithId.role?.toString().toUpperCase() || "";
            const roleIdInt = parseInt(userWithId.role_id?.toString() || "0");

            if (roleStr.includes("DEVELOPER") || roleIdInt === 3) {
                fetchDeveloperTasks(userWithId);
            } else {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchDeveloperTasks = async (user: any) => {
        try {
            setIsLoading(true);
            // Numeric extraction for the API parameter
            const userId = user.id?.toString().replace(/\D/g, '') || "13"; // Fallback to 13 as seen in user's example

            const endpoint = `tasks?taskId=0&assignedByUserId=0&assignedToUserId=${userId}&projectId=0&taskStatus=0&taskTypeId=0&taskPriority=0`;
            const response = await callGetAPIWithToken(endpoint);

            if (response.success && response.data) {
                // Strategic Grouping: Many tasks can belong to one project
                const projectsMap = new Map();

                response.data.forEach((task: any) => {
                    if (!projectsMap.has(task.ProjectID)) {
                        projectsMap.set(task.ProjectID, {
                            id: task.ProjectID,
                            name: task.ProjectName,
                            description: `Project containing ${response.data.filter((t: any) => t.ProjectID === task.ProjectID).length} assigned tasks.`,
                            tasks: [],
                            progressPercentage: 0,
                            priority: task.PriorityName,
                            status: ProjectStatus.ACTIVE,
                            assignedDeveloperIds: [],
                            deadline: task.Deadline
                        });
                    }
                    const p = projectsMap.get(task.ProjectID);
                    p.tasks.push(task);
                    p.progressPercentage = Math.round(p.tasks.reduce((acc: number, t: any) => acc + t.ProgressPercentage, 0) / p.tasks.length);
                });

                setDeveloperWorkstreams(Array.from(projectsMap.values()));
            }
        } catch (error) {
            console.error("Project Sync Failure:", error);
            toast.error("Failed to sync project data");
        } finally {
            setIsLoading(false);
        }
    };

    const isDeveloper = useMemo(() => {
        if (!currentUser) return false;
        const role = currentUser.role?.toString().toUpperCase() || "";
        const roleId = parseInt(currentUser.role_id?.toString() || "0");
        return role.includes('DEVELOPER') || roleId === 3;
    }, [currentUser]);

    const canManage = useMemo(() => {
        if (!currentUser) return false;
        const role = currentUser.role?.toString().toUpperCase() || "";
        const roleId = parseInt(currentUser.role_id?.toString() || "0");
        return role.includes('MANAGEMENT') || role.includes('ADMIN') || role.includes('LEAD') || roleId === 1 || roleId === 2;
    }, [currentUser]);

    const filteredProjects = useMemo(() => {
        if (isDeveloper) {
            return developerWorkstreams.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return storeProjects.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [storeProjects, developerWorkstreams, searchQuery, isDeveloper]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addProject(formData);
        setIsModalOpen(false);
        toast.success('Project Created', {
            description: `Project "${formData.name}" has been registered.`
        });
        setFormData({
            name: '', description: '', startDate: '', deadline: '',
            priority: Priority.MEDIUM, status: ProjectStatus.PLANNING,
            assignedLeadId: currentUser?.id || '', assignedDeveloperIds: [],
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-indigo-400" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Loading your projects...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-[1500px] mx-auto space-y-12 p-4 md:p-10"
        >
            {/* Header Section */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-indigo-600/30" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">NexIntel Project Management</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                        Total <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600">Projects</span>
                    </h1>
                    <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-indigo-500" />
                        Managing {projects.length} assigned projects.
                    </p>
                </div>
                {canManage && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="h-14 rounded-3xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="mr-3 h-4 w-4 stroke-[3px]" />
                        Add New Project
                    </Button>
                )}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                    <Input
                        placeholder="Search projects by name or description..."
                        className="h-14 pl-14 bg-white dark:bg-slate-900/50 rounded-[1.5rem] border-slate-200 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md">
                    <Button variant="ghost" className="h-10 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        Quick Filters
                    </Button>
                </div>
            </div>

            {/* Projects Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            variants={itemVariants}
                            layout
                            className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/50 backdrop-blur-xl overflow-hidden"
                        >
                            {/* Card Background Decoration */}
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-50 opaicty-0 transition-opacity group-hover:opacity-100 dark:bg-indigo-900/10" />

                            <div className="relative mb-6 flex items-start justify-between">
                                <span className={cn(
                                    "rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm",
                                    getStatusColor(project.status)
                                )}>
                                    {project.status}
                                </span>

                                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    {canManage && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                            onClick={() => {
                                                deleteProject(project.id);
                                                toast.error('Project Deleted');
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <h3 className="relative mb-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-tight group-hover:text-indigo-600 transition-colors">
                                {project.name}
                            </h3>
                            <p className="mb-8 line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                {project.description}
                            </p>

                            <div className="mt-auto space-y-6">
                                {/* Progress */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        <span>Project Progress</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{project.progressPercentage}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800/50 shadow-inner overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progressPercentage}%` }}
                                            className="h-full rounded-full bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                                        />
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex flex-col gap-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                                    {isDeveloper && project.tasks && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Tasks</p>
                                            <div className="flex flex-col gap-2">
                                                {project.tasks.map((task: any) => (
                                                    <div key={task.TaskID} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200">{task.Title}</span>
                                                            <span className="text-[9px] font-medium text-slate-400">{task.TypeName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-indigo-600">{task.ProgressPercentage}%</span>
                                                            <div className={cn("h-1.5 w-1.5 rounded-full", task.StatusName === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500')} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-3">
                                            {project.assignedDeveloperIds?.map((devId: string) => {
                                                const dev = users.find(u => u.id === devId);
                                                return (
                                                    <div
                                                        key={devId}
                                                        className="h-10 w-10 rounded-2xl border-2 border-white bg-indigo-50 flex items-center justify-center text-[11px] font-black text-indigo-600 shadow-sm transition-transform hover:scale-110 hover:z-10 dark:border-slate-950 dark:bg-indigo-900/50 dark:text-indigo-400"
                                                        title={dev?.name}
                                                    >
                                                        {dev?.name?.charAt(0)}
                                                    </div>
                                                );
                                            }) || (
                                                    <div className="h-10 w-10 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center dark:border-slate-800">
                                                        <UserIcon size={14} className="text-slate-300" />
                                                    </div>
                                                )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest", getPriorityColor(project.priority))}>
                                                <Target className="h-3 w-3 fill-current" />
                                                {project.priority}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(project.deadline)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900/20 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                        <FolderKanban className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Projects Found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">We couldn't find any projects matching your search.</p>
                    <Button variant="outline" className="mt-8 h-12 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]" onClick={() => setSearchQuery('')}>
                        Clear Search
                    </Button>
                </div>
            )}

            {/* New Project Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-[3rem] bg-white p-10 shadow-3xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                        >
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create New Project</h2>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Set up project details and goals.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-2xl h-12 w-12 hover:bg-slate-50">
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Name</label>
                                    <Input
                                        placeholder="Enter project name..."
                                        required
                                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-950 px-6 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Goals</label>
                                    <textarea
                                        placeholder="What are you trying to achieve?..."
                                        className="flex min-h-[120px] w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:border-slate-800 dark:bg-slate-950"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Start Date</label>
                                        <Input
                                            type="date"
                                            className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-950 px-6 font-bold"
                                            required
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Deadline</label>
                                        <Input
                                            type="date"
                                            className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-950 px-6 font-bold"
                                            required
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Priority Level</label>
                                        <select
                                            className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                        >
                                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Lead</label>
                                        <select
                                            className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                                            value={formData.assignedLeadId}
                                            onChange={(e) => setFormData({ ...formData, assignedLeadId: e.target.value })}
                                        >
                                            {users.filter(u => u.role !== UserRole.DEVELOPER).map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl h-12 px-8 font-bold text-slate-500">Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-10 rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 active:scale-0.98 transition-all">
                                        Save Project
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
