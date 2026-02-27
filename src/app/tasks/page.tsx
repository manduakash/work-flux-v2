"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Calendar, CheckCircle2, Clock,
    Trash2, Edit, LayoutGrid, List, ChevronLeft, ChevronRight,
    Activity, MessageSquare, X, ArrowUpDown, MoreHorizontal,
    Inbox, User as UserIcon, AlertCircle, Ban, Send, Pencil, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import { TaskStatus, UserRole, Task } from '@/types';
import { callGetAPIWithToken, callAPIWithToken } from '@/components/apis/commonAPIs';

// --- Sub-Component: Grid Card for Board View ---
const TaskGridCard = ({ task, project, assignee, nextStatus, prevStatus, onStatusChange, onDelete, onEdit }: any) => (
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
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100" onClick={() => onEdit(task)}>
                    <Pencil size={14} className="text-indigo-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50" onClick={() => onDelete(task.id)}>
                    <Trash2 size={14} className="text-rose-500" />
                </Button>
            </div>
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
                <div className="flex gap-2">
                    {prevStatus && (
                        <Button variant="outline" size="sm" onClick={() => onStatusChange(task.id, prevStatus.id)} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                            Back
                        </Button>
                    )}
                    {nextStatus && (
                        <Button variant="outline" size="sm" onClick={() => onStatusChange(task.id, nextStatus.id)} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">
                            {nextStatus.title}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
);

// --- Main Page Component ---
export default function TasksPage() {
    const { tasks, projects, currentUser, users, addTask, updateTask, deleteTask } = useStore();

    // Local UI State
    const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
    const [activeStatusId, setActiveStatusId] = useState<number | null>(null);
    const [apiTasks, setApiTasks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
    const [rollbackTask, setRollbackTask] = useState<any>(null);
    const [rollbackTargetStatusId, setRollbackTargetStatusId] = useState<number | null>(null);
    const [rollbackProgress, setRollbackProgress] = useState(90);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [statusData, setStatusData] = useState<any[]>([]);
    const [priorityData, setPriorityData] = useState<any[]>([]);
    const [typeData, setTypeData] = useState<any[]>([]);
    const [apiProjects, setApiProjects] = useState<any[]>([]);
    const [availableDevs, setAvailableDevs] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        projectId: '',
        title: '',
        subTitle: '',
        description: '',
        assignedToUsers: [] as number[],
        deadline: '',
        statusId: '',
        priorityId: '',
        typeId: '',
        status: TaskStatus.PENDING,
        progressPercentage: 0,
    });

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [statuses, priorities, types, projectsResp] = await Promise.all([
                callGetAPIWithToken("master/task-status"),
                callGetAPIWithToken("master/priority"),
                callGetAPIWithToken("master/task-type"),
                callGetAPIWithToken("projects")
            ]);
            if (statuses.success) {
                setStatusData(statuses.data);
                if (statuses.data.length > 0 && activeStatusId === null) {
                    setActiveStatusId(statuses.data[0].TaskStatusID);
                }
            }
            if (priorities.success) setPriorityData(priorities.data);
            if (types.success) setTypeData(types.data);
            if (projectsResp.success) setApiProjects(projectsResp.data);
        } catch (error) {
            console.error("Failed to fetch task master data", error);
        }
    };

    const fetchTasksByStatus = async (statusId: number) => {
        try {
            const userId = currentUser?.id?.toString().replace(/\D/g, '') || '0';
            const queryParams = `taskId=0&assignedByUserId=${userId}&assignedToUserId=0&projectId=0&taskStatus=${statusId}&taskTypeId=0&taskPriority=0`;
            const res = await callGetAPIWithToken(`tasks?${queryParams}`);
            if (res.success) setApiTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks by status", error);
        }
    };

    useEffect(() => {
        if (activeStatusId !== null) {
            fetchTasksByStatus(activeStatusId);
        }
    }, [activeStatusId, currentUser]);

    useEffect(() => {
        if (formData.projectId) {
            const fetchDevs = async () => {
                const numericProjectId = formData.projectId.toString().replace(/\D/g, '');
                const res = await callGetAPIWithToken(`tasks/available-developers?projectId=${numericProjectId}`);
                if (res.success) setAvailableDevs(res.data);
            };
            fetchDevs();
        }
    }, [formData.projectId]);

    useEffect(() => {
        if (!formData.projectId && apiProjects.length > 0) {
            setFormData(prev => ({ ...prev, projectId: apiProjects[0].ProjectID.toString() }));
        }
    }, [apiProjects]);

    // Strategic Sync: Status <-> Progress
    useEffect(() => {
        const completedStatus = statusData.find(s => s.TaskStatusName === "Completed");
        if (!completedStatus) return;

        // If progress is 100%, set status to Completed
        if (formData.progressPercentage === 100 && formData.statusId !== completedStatus.TaskStatusID.toString()) {
            setFormData(prev => ({ ...prev, statusId: completedStatus.TaskStatusID.toString() }));
        }

        // If status is Changed to Completed, lock progress at 100%
        if (formData.statusId === completedStatus.TaskStatusID.toString() && formData.progressPercentage !== 100) {
            setFormData(prev => ({ ...prev, progressPercentage: 100 }));
        }
    }, [formData.progressPercentage, formData.statusId, statusData]);


    // Logic: Search and Filter
    const filteredTasks = useMemo(() => {
        return apiTasks.filter(t => {
            const searchStr = `${t.Title} ${t.Description} ${t.ProjectName}`.toLowerCase();
            return searchStr.includes(searchQuery.toLowerCase());
        });
    }, [apiTasks, searchQuery]);

    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTasks.slice(start, start + itemsPerPage);
    }, [filteredTasks, currentPage]);

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);


    const handleOpenCreateModal = () => {
        setEditingTask(null);
        setFormData({
            projectId: apiProjects[0]?.ProjectID?.toString() || '',
            title: '',
            subTitle: '',
            description: '',
            assignedToUsers: [],
            deadline: '',
            status: TaskStatus.PENDING,
            statusId: statusData[0]?.TaskStatusID?.toString() || '',
            priorityId: priorityData[0]?.PriorityID?.toString() || '',
            typeId: typeData[0]?.TaskTypeID?.toString() || '',
            progressPercentage: 0,
        });
        setIsModalOpen(true);
    };

    const toggleDeveloper = (userId: number) => {
        setFormData(prev => {
            const isSelected = prev.assignedToUsers.includes(userId);
            if (isSelected) {
                return { ...prev, assignedToUsers: prev.assignedToUsers.filter(id => id !== userId) };
            } else {
                return { ...prev, assignedToUsers: [...prev.assignedToUsers, userId] };
            }
        });
    };

    const handleOpenEditModal = (task: any) => {
        setEditingTask(task);
        setFormData({
            projectId: task.projectId || task.ProjectID?.toString() || '',
            title: task.title || task.Title || '',
            subTitle: task.subTitle || task.SubTitle || '',
            description: task.description || task.Description || '',
            assignedToUsers: task.assignedToUsers || task.AssignedToUsers?.map((u: any) => u.AssignedToUserID) || [],
            deadline: (task.deadline || task.Deadline || '').split('T')[0],
            status: task.status || task.StatusName as any,
            statusId: task.statusId || task.StatusID?.toString() || statusData.find(s => s.TaskStatusName === (task.status || task.StatusName))?.TaskStatusID?.toString() || '',
            priorityId: task.priorityId || task.PriorityID?.toString() || priorityData[0]?.PriorityID?.toString() || '',
            typeId: task.typeId || task.TypeID?.toString() || typeData[0]?.TaskTypeID?.toString() || '',
            progressPercentage: task.progressPercentage ?? task.ProgressPercentage ?? 0,
        });
        setIsModalOpen(true);
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation logic
        if (!formData.projectId || !formData.statusId || !formData.typeId || !formData.priorityId || !formData.deadline || formData.assignedToUsers.length === 0) {
            toast.error('Deployment Halted', {
                description: 'Please ensure all governance parameters (Project, Status, Type, Priority, Deadline) and at least one Resource are selected.'
            });
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(editingTask ? 'Updating task alignment...' : 'Operationalizing new task...');

        try {
            const payload = {
                taskId: editingTask ? parseInt((editingTask.TaskID || editingTask.id || '0').toString().replace(/\D/g, '')) || 0 : 0,
                statusId: Number(formData.statusId),
                typeId: Number(formData.typeId),
                projectId: Number((formData.projectId || '0').toString().replace(/\D/g, '')),
                priorityId: Number(formData.priorityId),
                assignedByUserId: Number(currentUser?.id?.toString().replace(/\D/g, '') || 1),
                assignedToUsers: formData.assignedToUsers,
                title: formData.title,
                subTitle: formData.subTitle,
                description: formData.description,
                progressPercentage: Number(formData.progressPercentage),
                deadline: formData.deadline,
            };

            console.log('Finalizing Task Payload:', payload);
            const result = await callAPIWithToken('tasks', payload);
            console.log('Task Deployment Sync Response:', result);

            if (result.success) {
                toast.success(editingTask ? 'Task Refined' : 'Task Operationalized', { id: toastId });

                if (editingTask) {
                    updateTask(editingTask.id, {
                        ...formData,
                        updatedAt: new Date().toISOString(),
                    } as any);
                } else {
                    addTask(formData as any);
                }

                // Mission-Critical: Refresh the board state from the API
                if (activeStatusId !== null) {
                    fetchTasksByStatus(activeStatusId);
                }

                setIsModalOpen(false);
            } else {
                throw new Error(result.error?.message || 'Failed to sync task');
            }
        } catch (error: any) {
            console.error("Task submission error:", error);
            toast.error("Submission Failed", {
                id: toastId,
                description: "Falling back to local update. Connectivity might be intermittent."
            });

            // Fallback to local store if API fails
            if (editingTask) {
                updateTask(editingTask.id, formData as any);
            } else {
                addTask(formData as any);
            }
            setIsModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleRollbackStatus = async (task: any, prevStatusId: number, explicitProgress?: number) => {
        // Find if we are reverting FROM "Completed"
        const isFromCompleted = task.StatusName === "Completed";

        if (isFromCompleted && explicitProgress === undefined) {
            setRollbackTask(task);
            setRollbackTargetStatusId(prevStatusId);
            setRollbackProgress(90); // Default to 90%
            setIsRollbackModalOpen(true);
            return;
        }

        const toastId = toast.loading(`Rolling back to ${statusData.find(s => s.TaskStatusID === prevStatusId)?.TaskStatusName}...`);

        try {
            const payload = {
                taskId: task.TaskID,
                statusId: prevStatusId,
                typeId: task.TypeID,
                projectId: task.ProjectID,
                priorityId: task.PriorityID,
                assignedByUserId: Number(currentUser?.id?.toString().replace(/\D/g, '') || 1),
                assignedToUsers: task.AssignedToUsers?.map((u: any) => u.AssignedToUserID) || [],
                title: task.Title,
                subTitle: task.SubTitle || '',
                description: task.Description,
                progressPercentage: explicitProgress !== undefined ? explicitProgress : task.ProgressPercentage,
                deadline: task.Deadline?.split('T')[0],
            };

            const result = await callAPIWithToken('tasks', payload);

            if (result.success) {
                toast.success('Workstream Rollback Successful', { id: toastId });
                setIsRollbackModalOpen(false); // Close modal on success
                if (activeStatusId !== null) fetchTasksByStatus(activeStatusId);
            } else {
                throw new Error(result.error?.message || 'Rollback failed');
            }
        } catch (error: any) {
            console.error("Status rollback error:", error);
            toast.error("Transition Halted", { id: toastId });
        }
    };

    const handleAdvanceStatus = async (task: any, nextStatusId: number) => {
        const toastId = toast.loading(`Advancing to ${statusData.find(s => s.TaskStatusID === nextStatusId)?.TaskStatusName}...`);

        try {
            // Intelligence: If advancing to "Completed", auto-lock progress at 100%
            const completedStatus = statusData.find(s => s.TaskStatusName === "Completed");
            const finalProgress = (completedStatus && nextStatusId === completedStatus.TaskStatusID) ? 100 : task.ProgressPercentage;

            const payload = {
                taskId: task.TaskID,
                statusId: nextStatusId,
                typeId: task.TypeID,
                projectId: task.ProjectID,
                priorityId: task.PriorityID,
                assignedByUserId: Number(currentUser?.id?.toString().replace(/\D/g, '') || 1),
                assignedToUsers: task.AssignedToUsers?.map((u: any) => u.AssignedToUserID) || [],
                title: task.Title,
                subTitle: task.SubTitle || '',
                description: task.Description,
                progressPercentage: finalProgress,
                deadline: task.Deadline?.split('T')[0],
            };

            const result = await callAPIWithToken('tasks', payload);

            if (result.success) {
                toast.success('Strategic Alignment Successful', { id: toastId });
                if (activeStatusId !== null) {
                    fetchTasksByStatus(activeStatusId);
                }
            } else {
                throw new Error(result.error?.message || 'Re-alignment failed');
            }
        } catch (error: any) {
            console.error("Status advancement error:", error);
            toast.error("Transition Halted", {
                id: toastId,
                description: "Manual governance check required. Check console for payload diagnostics."
            });
        }
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
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Task Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Track granular execution and team performance metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 shadow-inner">
                        <button onClick={() => setViewMode('table')} className={cn("flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-all", viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700")}>
                            <List size={16} /> List
                        </button>
                        <button onClick={() => setViewMode('board')} className={cn("flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-all", viewMode === 'board' ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700")}>
                            <LayoutGrid size={16} /> Board
                        </button>
                    </div>
                    <Button onClick={handleOpenCreateModal} className="h-11 rounded-xl bg-slate-900 text-white px-6 font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> New Task
                    </Button>
                </div>
            </div>

            {/* Toolbar & Status Tabs */}
            <div className="space-y-6">
                <div className="relative group max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input placeholder="Search tasks..." className="pl-12 h-12 bg-white dark:bg-slate-900 shadow-sm border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>

                {viewMode === 'board' && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-100 dark:border-slate-800">
                        {statusData.map((status) => {
                            const isActive = activeStatusId === status.TaskStatusID;
                            return (
                                <button
                                    key={status.TaskStatusID}
                                    onClick={() => setActiveStatusId(status.TaskStatusID)}
                                    className={cn(
                                        "relative flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all",
                                        isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {status.TaskStatusName}
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
                    <motion.div key={activeStatusId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                // Find next/prev status for strategic realignment
                                const currentIndex = statusData.findIndex(s => s.TaskStatusID === activeStatusId);
                                const nextStatus = statusData[currentIndex + 1];
                                const prevStatus = statusData[currentIndex - 1];

                                return (
                                    <TaskGridCard
                                        key={task.TaskID}
                                        task={{
                                            ...task,
                                            id: task.TaskID.toString(),
                                            title: task.Title,
                                            description: task.Description,
                                            progressPercentage: task.StatusName === "Completed" ? 100 : task.ProgressPercentage,
                                            deadline: task.Deadline
                                        }}
                                        project={{ name: task.ProjectName }}
                                        assignee={{ name: task.AssignedToUsers?.[0]?.AssignedToUserFullName || task.AssignedByUserFullName || 'Unassigned' }}
                                        nextStatus={nextStatus ? { id: nextStatus.TaskStatusID, title: nextStatus.TaskStatusName } : null}
                                        prevStatus={prevStatus ? { id: prevStatus.TaskStatusID, title: prevStatus.TaskStatusName } : null}
                                        onStatusChange={(id: string, sId: number) => {
                                            if (activeStatusId !== null && sId < activeStatusId) {
                                                handleRollbackStatus(task, sId);
                                            } else {
                                                handleAdvanceStatus(task, sId);
                                            }
                                        }}
                                        onDelete={handleDelete}
                                        onEdit={() => handleOpenEditModal(task)}
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
                                        <tr key={task.TaskID} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{task.Title}</td>
                                            <td className="px-6 py-4"><span className="text-indigo-600 font-semibold">{task.ProjectName}</span></td>
                                            <td className="px-6 py-4"><span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", getStatusColor(task.StatusName as any))}>{task.StatusName}</span></td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-600">{task.AssignedToUsers?.[0]?.AssignedToUserFullName || task.AssignedByUserFullName || 'Unassigned'}</td>
                                            <td className="px-6 py-4 text-xs text-slate-400">
                                                <div className="flex flex-col gap-1">
                                                    <span>{formatDate(task.Deadline)}</span>
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{task.StatusName === "Completed" ? 100 : task.ProgressPercentage}% Progress</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal({
                                                        ...task,
                                                        id: task.TaskID.toString(),
                                                        projectId: task.ProjectID.toString(),
                                                        title: task.Title,
                                                        description: task.Description,
                                                        progressPercentage: task.ProgressPercentage,
                                                        deadline: task.Deadline,
                                                        status: task.StatusName as any
                                                    })}><Pencil size={14} className="text-slate-400 hover:text-indigo-600" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(task.TaskID.toString())}><Trash2 size={14} className="text-slate-400 group-hover:text-rose-500" /></Button>
                                                </div>
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
                                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-xl"><ChevronLeft size={16} /></Button>
                                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rounded-xl"><ChevronRight size={16} /></Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Professional Modal for Task Creation/Update */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] bg-white flex flex-col shadow-2xl dark:bg-slate-900"
                        >
                            {/* Modal Header */}
                            <div className="p-8 pb-4 flex items-center justify-between shrink-0">
                                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                                    {editingTask ? 'Refine Execution Unit' : 'Initialize Execution Unit'}
                                </h2>
                                <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* Scrollable Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 pt-2 scrollbar-hide">
                                <form onSubmit={handleSubmitTask} className="space-y-8 pb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Governance - Target Project</label>
                                        <select
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800"
                                            value={formData.projectId}
                                            onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                        >
                                            <option value="">Select Target Project...</option>
                                            {apiProjects.map(p => <option key={p.ProjectID} value={p.ProjectID}>{p.ProjectName}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Core Identity - Task Title</label>
                                            <Input placeholder="Define delivery outcome..." required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-white dark:bg-slate-950 px-4 font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phase / Workstream</label>
                                            <Input placeholder="e.g. Phase 1 - Scoping" value={formData.subTitle} onChange={e => setFormData({ ...formData, subTitle: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-white dark:bg-slate-950 px-4 font-bold" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Operational Type</label>
                                            <select className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800" value={formData.typeId} onChange={e => setFormData({ ...formData, typeId: e.target.value })}>
                                                <option value="">Select Type</option>
                                                {typeData.map(t => <option key={t.TaskTypeID} value={t.TaskTypeID}>{t.TaskTypeName}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Live Status</label>
                                            <select className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800" value={formData.statusId} onChange={e => setFormData({ ...formData, statusId: e.target.value })}>
                                                <option value="">Select Status</option>
                                                {statusData.map(s => <option key={s.TaskStatusID} value={s.TaskStatusID}>{s.TaskStatusName}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Risk Priority</label>
                                            <select className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950 dark:border-slate-800" value={formData.priorityId} onChange={e => setFormData({ ...formData, priorityId: e.target.value })}>
                                                <option value="">Select Priority</option>
                                                {priorityData.map(p => <option key={p.PriorityID} value={p.PriorityID}>{p.PriorityName}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Deployment Deadline</label>
                                            <Input type="date" required value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-white dark:bg-slate-950 px-4 font-bold" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Task progress</label>
                                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{formData.progressPercentage}%</span>
                                        </div>
                                        <div className={cn("relative h-2 w-full group", formData.progressPercentage === 100 && statusData.find(s => s.TaskStatusID.toString() === formData.statusId)?.TaskStatusName === "Completed" && "opacity-60 cursor-not-allowed")}>
                                            <div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(79,70,229,0.2)]"
                                                style={{ width: `${formData.progressPercentage}%` }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                disabled={statusData.find(s => s.TaskStatusID.toString() === formData.statusId)?.TaskStatusName === "Completed"}
                                                className="absolute inset-0 w-full h-full appearance-none bg-slate-100 rounded-full cursor-pointer accent-transparent focus:outline-none bg-transparent"
                                                value={formData.progressPercentage}
                                                onChange={e => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                                                style={{ WebkitAppearance: 'none', background: 'rgba(241, 245, 249, 0.5)' }}
                                            />
                                        </div>
                                        {statusData.find(s => s.TaskStatusID.toString() === formData.statusId)?.TaskStatusName === "Completed" && (
                                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Progress locked at 100% for completed tasks</p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Resources</label>
                                        <div className="flex flex-wrap gap-2 p-5 rounded-3xl bg-slate-50 border border-slate-100 dark:bg-slate-950/50 dark:border-slate-800">
                                            {availableDevs.length > 0 ? (
                                                availableDevs.map(dev => (
                                                    <button
                                                        key={dev.UserID}
                                                        type="button"
                                                        onClick={() => toggleDeveloper(dev.UserID)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",
                                                            formData.assignedToUsers.includes(dev.UserID)
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105"
                                                                : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400 dark:bg-slate-900 dark:border-slate-800"
                                                        )}
                                                    >
                                                        {formData.assignedToUsers.includes(dev.UserID) ? <CheckCircle2 size={12} /> : <UserIcon size={12} />}
                                                        {dev.UserFullName}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest py-2 text-center w-full italic">Awaiting project selection for resource mapping...</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Technical Requirements & Context</label>
                                        <textarea
                                            className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-950 dark:border-slate-800"
                                            placeholder="Provide detailed implementation requirements..."
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                                <Button variant="ghost" type="button" className="rounded-2xl h-12 px-8 font-bold text-slate-500 hover:bg-slate-50" onClick={() => setIsModalOpen(false)}>Discard</Button>
                                <Button
                                    onClick={handleSubmitTask}
                                    disabled={isSubmitting}
                                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...</>
                                    ) : (
                                        <>{editingTask ? 'Update Task' : 'Deploy Task'}</>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Premium Strategic Rollback Modal */}
            <AnimatePresence>
                {isRollbackModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRollbackModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600">
                                    <AlertCircle size={24} />
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsRollbackModalOpen(false)}><X /></Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Rollback Confirmation</h2>
                                    <p className="text-sm text-slate-500 mt-2">Reverting <b>{rollbackTask?.Title}</b> from Completed state. You must explicitly define the new workstream progress.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Revised Progress</label>
                                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{rollbackProgress}%</span>
                                    </div>
                                    <div className="relative h-2 w-full group">
                                        <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${rollbackProgress}%` }} />
                                        <input
                                            type="range"
                                            min="0"
                                            max="99"
                                            className="absolute inset-0 w-full h-full appearance-none bg-slate-100 rounded-full cursor-pointer accent-transparent focus:outline-none"
                                            value={rollbackProgress}
                                            onChange={e => setRollbackProgress(Number(e.target.value))}
                                            style={{ WebkitAppearance: 'none', background: 'rgba(241, 245, 249, 0.5)' }}
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Note: Progress cannot be 100% when reverting from completed.</p>
                                </div>

                                <div className="flex flex-col gap-2 pt-4">
                                    <Button
                                        onClick={() => handleRollbackStatus(rollbackTask, rollbackTargetStatusId!, rollbackProgress)}
                                        className="h-12 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-[0.98] transition-all"
                                    >
                                        Execute Rollback
                                    </Button>
                                    <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-500" onClick={() => setIsRollbackModalOpen(false)}>Abondon Reversion</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
