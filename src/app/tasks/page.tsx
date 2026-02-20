"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Calendar, CheckCircle2, Clock,
    Trash2, Edit, LayoutGrid, List, ChevronLeft, ChevronRight,
    Activity, MessageSquare, X, ArrowUpDown, MoreHorizontal,
    Inbox, User as UserIcon, AlertCircle, Ban, Send
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import { TaskStatus, UserRole, Task } from '@/types';

// --- Sub-Component: Grid Card for Board View ---
const TaskGridCard = ({ task, project, assignee, nextStatus, onStatusChange, onDelete }: any) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900"
    >
        <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                    {project?.name}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{task.title}</h4>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(task.id)}>
                <Trash2 size={14} className="text-rose-500" />
            </Button>
        </div>

        <p className="mb-6 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {task.description}
        </p>

        <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                <div className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(task.deadline)}</div>
                <span className="text-slate-900 dark:text-white">{task.progressPercentage}% Complete</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div initial={{ width: 0 }} animate={{ width: `${task.progressPercentage}%` }} className="h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)] rounded-full" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">{assignee?.name.charAt(0)}</div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{assignee?.name.split(' ')[0]}</span>
                </div>
                {nextStatus && (
                    <Button variant="outline" size="sm" onClick={() => onStatusChange(task.id, nextStatus.id)} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">
                        Next: {nextStatus.title}
                    </Button>
                )}
            </div>
        </div>
    </motion.div>
);

// --- Main Page Component ---
export default function TasksPage() {
    const { tasks, projects, currentUser, users, addTask, updateTask, deleteTask } = useStore();

    // Local UI State
    const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
    const [activeStatus, setActiveStatus] = useState<TaskStatus>(TaskStatus.PENDING);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const columns = [
        { id: TaskStatus.PENDING, title: 'Pending', icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-50' },
        { id: TaskStatus.IN_PROGRESS, title: 'Active', icon: Activity, color: 'text-amber-500', bgColor: 'bg-amber-50' },
        { id: TaskStatus.REVIEW, title: 'Review', icon: MessageSquare, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
        { id: TaskStatus.COMPLETED, title: 'Done', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    ];

    // Logic: Search and Filter
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = viewMode === 'table' ? true : t.status === activeStatus;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchQuery, activeStatus, viewMode]);

    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTasks.slice(start, start + itemsPerPage);
    }, [filteredTasks, currentPage]);

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

    // Form State
    const [formData, setFormData] = useState({
        projectId: projects[0]?.id || '',
        title: '',
        description: '',
        assignedDeveloperId: currentUser?.id || '',
        deadline: '',
        status: TaskStatus.PENDING,
        progressPercentage: 0,
    });

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        addTask(formData);
        setIsModalOpen(false);
        toast.success('Task operationalized');
        setFormData({ ...formData, title: '', description: '', deadline: '' });
    };

    const handleDelete = (id: string) => {
        if (confirm('Archive this task?')) {
            deleteTask(id);
            toast.error('Task archived');
        }
    };

    return (
        <div className="max-w-[1500px] mx-auto space-y-8 p-2">

            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Task Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track granular execution and team performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                        <button onClick={() => setViewMode('table')} className={cn("flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-all", viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400" : "text-slate-500")}>
                            <List size={16} /> List
                        </button>
                        <button onClick={() => setViewMode('board')} className={cn("flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-all", viewMode === 'board' ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400" : "text-slate-500")}>
                            <LayoutGrid size={16} /> Board
                        </button>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="h-11 rounded-xl bg-indigo-600 px-6 font-bold shadow-lg shadow-indigo-600/20">
                        <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> New Task
                    </Button>
                </div>
            </div>

            {/* Toolbar & Status Tabs */}
            <div className="space-y-6">
                <div className="relative group max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input placeholder="Search tasks..." className="pl-12 h-12 bg-white dark:bg-slate-900 shadow-sm border-slate-200 rounded-2xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>

                {viewMode === 'board' && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-100 dark:border-slate-800">
                        {columns.map((col) => {
                            const isActive = activeStatus === col.id;
                            const count = tasks.filter(t => t.status === col.id).length;
                            return (
                                <button key={col.id} onClick={() => setActiveStatus(col.id)} className={cn("relative flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all", isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600")}>
                                    <col.icon size={14} className={isActive ? "text-indigo-600" : "text-slate-300"} />
                                    {col.title}
                                    <span className={cn("ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px]", isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500")}>
                                        {count}
                                    </span>
                                    {isActive && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Main View Area */}
            <AnimatePresence mode="wait">
                {viewMode === 'board' ? (
                    <motion.div key={activeStatus} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const colIdx = columns.findIndex(c => c.id === task.status);
                                const nextStatus = columns[colIdx + 1];
                                return (
                                    <TaskGridCard
                                        key={task.id}
                                        task={task}
                                        project={projects.find(p => p.id === task.projectId)}
                                        assignee={users.find(u => u.id === task.assignedDeveloperId)}
                                        nextStatus={nextStatus}
                                        onStatusChange={(id: string, s: TaskStatus) => { updateTask(id, { status: s }); toast.info(`Moved to ${s}`); }}
                                        onDelete={handleDelete}
                                    />
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center flex flex-col items-center">
                                <Inbox size={48} className="text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-400 italic">No tasks in this stage</h3>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Information</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Project</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Assignee</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Deadline</th>
                                        <th className="px-6 py-4 text-right font-bold text-[10px] uppercase tracking-widest text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedTasks.map((task) => (
                                        <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{task.title}</td>
                                            <td className="px-6 py-4"><span className="text-indigo-600 font-semibold">{projects.find(p => p.id === task.projectId)?.name}</span></td>
                                            <td className="px-6 py-4"><span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", getStatusColor(task.status))}>{task.status}</span></td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-600">{users.find(u => u.id === task.assignedDeveloperId)?.name}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">{formatDate(task.deadline)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}><Trash2 size={14} className="text-slate-400 group-hover:text-rose-500" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-100 p-6 dark:border-slate-800">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Showing {paginatedTasks.length} of {filteredTasks.length} units</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></Button>
                                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Professional Modal for New Task */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Initialize Task</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}><X /></Button>
                            </div>

                            <form onSubmit={handleCreateTask} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Project</label>
                                    <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-indigo-600 outline-none dark:bg-slate-950 dark:border-slate-800" value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Title</label>
                                    <Input placeholder="Define task outcome..." required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assign To</label>
                                        <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-indigo-600 outline-none dark:bg-slate-950 dark:border-slate-800" value={formData.assignedDeveloperId} onChange={e => setFormData({ ...formData, assignedDeveloperId: e.target.value })}>
                                            {users.filter(u => u.role === UserRole.DEVELOPER).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline</label>
                                        <Input type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Description</label>
                                    <textarea className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-600 dark:bg-slate-950 dark:border-slate-800" placeholder="Break down the technical requirements..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl font-bold">Deploy Task</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}