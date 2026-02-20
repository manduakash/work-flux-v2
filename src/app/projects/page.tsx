"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Calendar, Flag, User as UserIcon,
    Trash2, Edit, X, FolderKanban, ChevronRight, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import { UserRole, ProjectStatus, Priority } from '@/types';

export default function ProjectsPage() {
    const { projects, currentUser, users, addProject, deleteProject } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        deadline: '',
        priority: Priority.MEDIUM,
        status: ProjectStatus.PLANNING,
        assignedLeadId: currentUser?.id || '',
        assignedDeveloperIds: [] as string[],
    });

    const canManage = currentUser?.role === UserRole.MANAGEMENT || currentUser?.role === UserRole.TEAM_LEAD;

    const filteredProjects = useMemo(() => {
        return projects.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addProject(formData);
        setIsModalOpen(false);
        toast.success('Project created successfully');
        setFormData({
            name: '', description: '', startDate: '', deadline: '',
            priority: Priority.MEDIUM, status: ProjectStatus.PLANNING,
            assignedLeadId: currentUser?.id || '', assignedDeveloperIds: [],
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Projects</h1>
                    <p className="text-slate-500 dark:text-slate-400">Orchestrate your enterprise workstreams and delivery timelines.</p>
                </div>
                {canManage && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="h-11 rounded-xl bg-indigo-600 px-6 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
                    >
                        <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                        Create Project
                    </Button>
                )}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                    <Input
                        placeholder="Search by project name or description..."
                        className="pl-11 h-11 bg-white dark:bg-slate-900/50 rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-11 rounded-xl px-5 border-slate-200 dark:border-slate-800">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {/* Projects Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900/50"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <span className={cn(
                                    "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                                    getStatusColor(project.status)
                                )}>
                                    {project.status}
                                </span>

                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    {canManage && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                                            onClick={() => {
                                                if (window.confirm('Archive this project?')) {
                                                    deleteProject(project.id);
                                                    toast.error('Project archived');
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                                {project.name}
                            </h3>
                            <p className="mb-6 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                {project.description}
                            </p>

                            <div className="mt-auto space-y-5">
                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter text-slate-400">
                                        <span>Delivery Progress</span>
                                        <span className="text-slate-900 dark:text-white">{project.progressPercentage}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progressPercentage}%` }}
                                            className="h-full rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                                        />
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                                    <div className="flex -space-x-2.5">
                                        {project.assignedDeveloperIds.map((devId) => {
                                            const dev = users.find(u => u.id === devId);
                                            return (
                                                <div
                                                    key={devId}
                                                    className="h-9 w-9 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[11px] font-bold text-indigo-700 dark:border-slate-900 dark:bg-indigo-900"
                                                    title={dev?.name}
                                                >
                                                    {dev?.name?.charAt(0)}
                                                </div>
                                            );
                                        })}
                                        {project.assignedDeveloperIds.length === 0 && (
                                            <span className="text-[10px] text-slate-400 italic">No devs assigned</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <div className={cn("flex items-center text-[10px] font-bold uppercase mb-1", getPriorityColor(project.priority))}>
                                            <Flag className="mr-1 h-3 w-3 fill-current" />
                                            {project.priority}
                                        </div>
                                        <div className="flex items-center text-[11px] text-slate-500 font-medium">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {formatDate(project.deadline)}
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
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 dark:bg-slate-900/20 dark:border-slate-800">
                    <FolderKanban className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No projects found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
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
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Initialize Project</h2>
                                    <p className="text-sm text-slate-500">Define the core parameters for the new workstream.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Name</label>
                                    <Input
                                        placeholder="e.g. Cloud Infrastructure Migration"
                                        required
                                        className="h-12 rounded-xl"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                                    <textarea
                                        placeholder="Provide a high-level overview of objectives..."
                                        className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:border-slate-700 dark:bg-slate-950"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-xl"
                                            required
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Deadline</label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-xl"
                                            required
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority Level</label>
                                        <select
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                        >
                                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Lead</label>
                                        <select
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                                            value={formData.assignedLeadId}
                                            onChange={(e) => setFormData({ ...formData, assignedLeadId: e.target.value })}
                                        >
                                            {users.filter(u => u.role !== UserRole.DEVELOPER).map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl h-11">
                                        Initialize Project
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}