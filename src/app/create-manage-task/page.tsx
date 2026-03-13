"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Calendar, CheckCircle2, Clock,
    Trash2, Edit, LayoutGrid, List, ChevronLeft, ChevronRight,
    Activity, MessageSquare, X, ArrowUpDown, MoreHorizontal,
    Inbox, User as UserIcon, AlertCircle, Ban, Send, Pencil, Loader2,
    CheckCircle2Icon,
    CircleCheckBig,
    CircleX
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import { TaskStatus, UserRole, Task } from '@/types';
import { callGetAPIWithToken, callAPIWithToken, callPatchAPIWithToken } from '@/components/apis/commonAPIs';
import { getCookie } from '@/utils/cookies';

// --- Sub-Component: Grid Card for Board View ---
const TaskGridCard = ({ task, project, assignee, nextStatus, statusId, onStatusChange, onDelete, onEdit, currentUser }: any) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900"
    >
        <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
                <div className="flex w-fit items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                    {project?.name}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{task.title}</h4>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {currentUser?.role_id !== 3 ? (
                    <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100" onClick={() => onEdit(task)}>
                            <Pencil size={14} className="text-indigo-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50" onClick={() => onDelete(task.id)}>
                            <Trash2 size={14} className="text-rose-500" />
                        </Button>
                    </>
                ) : (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-indigo-50" onClick={() => onEdit(task)}>
                        <Activity size={14} className="text-indigo-600" />
                    </Button>
                )}
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

            <div className="flex gap-2 items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white uppercase" title={`${assignee?.name}`}>{assignee?.name.charAt(0)}{assignee?.name[1].charAt(0)}</div>
                    <span>{assignee?.name?.split(" ")[0]}</span>
                </div>

                {/* {(currentUser?.role_id == 3 && (nextStatus?.title?.toLowerCase() === "pending" || nextStatus?.title?.toLowerCase() === "in progress")) || (currentUser?.role_id == 2 && (nextStatus?.title?.toLowerCase() === "review" || nextStatus?.title?.toLowerCase() === "completed")) ? */}
                <div className="flex gap-2">
                    {statusId == 3 && (
                        <>
                            <Button variant="outline" size="sm" title="Mark as Complete" onClick={() => onStatusChange(task.id, nextStatus.id)} className="text-[10px] p-0 font-black uppercase tracking-widest cursor-pointer border-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-full transition-all">
                                <CircleCheckBig className='m-0 p-0' />
                            </Button>
                            <Button variant="outline" size="sm" title="Mark as Incomplete" onClick={() => onStatusChange(task.id, nextStatus.id)} className="text-[10px] p-0 font-black uppercase tracking-widest cursor-pointer border-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-full transition-all">
                                <CircleX className='m-0 p-0' />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
);

// --- Main Page Component ---
export default function TaskManagementPage() {
    const { tasks, projects, users, addTask, updateTask, deleteTask } = useStore();

    // Local UI State
    const [viewMode, setViewMode] = useState<'board' | 'table'>('table');
    const [activeStatusId, setActiveStatusId] = useState<number | null>(null);
    const [apiTasks, setApiTasks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
    const [rollbackTask, setRollbackTask] = useState<any>(null);
    const [rollbackTargetStatusId, setRollbackTargetStatusId] = useState<number | null>(null);
    const [rollbackProgress, setRollbackProgress] = useState(90);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const itemsPerPage = 8;

    const [statusData, setStatusData] = useState<any[]>([]);
    const [priorityData, setPriorityData] = useState<any[]>([]);
    const [typeData, setTypeData] = useState<any[]>([]);
    const [apiProjects, setApiProjects] = useState<any[]>([]);
    const [availableDevs, setAvailableDevs] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationTrigger, setValidationTrigger] = useState<number>(0);
    const [myTasks, setMyTasks] = useState<any[]>([]);  // Developer-specific: all assigned tasks
    const modalContentRef = React.useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        projectId: '',
        title: '',
        subTitle: '',
        description: '',
        assignedToUserId: '',
        deadline: '',
        statusId: '',
        priorityId: '',
        typeId: '',
        status: TaskStatus.PENDING,
        progressPercentage: 0,
    });

    useEffect(() => {
        const role_id = getCookie("role_id");
        if (role_id) {
            role_id == 2 ? setViewMode("board") : setViewMode("table");
        }
    }, []);

    useEffect(() => {
        const user = getCookie("user");
        console.log("user", user);
        setCurrentUser(user);
        if (user) {
            console.log("viewMode", viewMode);
            fetchTasks(user);
        }
    }, [viewMode]);

    const fetchTasks = async (userOverride?: any) => {
        const user = userOverride || currentUser;
        if (!user) return;
        try {
            console.log("user", user);
            const userId = user?.id?.toString().replace(/\D/g, '') || user?.UserID?.toString().replace(/\D/g, '') || '0';
            const isDeveloper = user?.role_id == 3;
            const endpoint = isDeveloper
                ? `tasks?taskId=0&projectId=0&taskStatus=0&taskTypeId=0&taskPriority=0`
                : `tasks?taskId=0&projectId=0&taskStatus=0&taskTypeId=0&taskPriority=0`;
            const res = await callGetAPIWithToken(endpoint);
            if (res.success) {
                if (isDeveloper) {
                    setMyTasks(res.data || []);
                } else {
                    setApiTasks(res.data || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

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
                    const pendingStatus = statuses.data.find((s: any) => s.TaskStatusName === "Pending");
                    setActiveStatusId(pendingStatus ? pendingStatus.TaskStatusID : statuses.data[0].TaskStatusID);
                }
            }
            if (priorities.success) setPriorityData(priorities.data);
            if (types.success) setTypeData(types.data);
            if (projectsResp.success) setApiProjects(projectsResp.data);
        } catch (error) {
            console.error("Failed to fetch task master data", error);
        }
    };

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

    // Auto Sync: Status <-> Progress
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
    const isDeveloper = currentUser?.role_id === 3 || currentUser?.RoleID === 3;

    const filteredTasks = useMemo(() => {
        const source = isDeveloper ? myTasks : apiTasks;

        // For Team Lead: if in board mode, filter by active tab. If in table mode, show all.
        const statusFiltered = (!isDeveloper && activeStatusId !== null && viewMode === 'board')
            ? source.filter(t => t.StatusID === activeStatusId)
            : source;

        return statusFiltered.filter(t => {
            const searchStr = `${t.Title} ${t.Description} ${t.ProjectName}`.toLowerCase();
            return searchStr.includes(searchQuery.toLowerCase());
        });
    }, [apiTasks, myTasks, searchQuery, isDeveloper, activeStatusId, viewMode]);

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
            assignedToUserId: '',
            deadline: '',
            status: TaskStatus.PENDING,
            statusId: statusData[0]?.TaskStatusID?.toString() || '',
            priorityId: priorityData[0]?.PriorityID?.toString() || '',
            typeId: typeData[0]?.TaskTypeID?.toString() || '',
            progressPercentage: 0,
        });
        setIsModalOpen(true);
    };

    const selectDeveloper = (userId: number) => {
        setFormData(prev => ({ ...prev, assignedToUserId: userId.toString() }));
    };

    const handleOpenEditModal = (task: any) => {
        setEditingTask(task);
        setFormData({
            projectId: task.projectId || task.ProjectID?.toString() || '',
            title: task.title || task.Title || '',
            subTitle: task.subTitle || task.SubTitle || '',
            description: task.description || task.Description || '',
            assignedToUserId: task.assignedToUserId || task.AssignedToUserID?.toString() || task.AssignedToUsers?.[0]?.AssignedToUserID?.toString() || '',
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
        const missingFields: string[] = [];
        if (!formData.title) missingFields.push('Task Title');
        if (!formData.projectId) missingFields.push('Project');
        if (!formData.statusId) missingFields.push('Current Status');
        if (!formData.typeId) missingFields.push('Task Type');
        if (!formData.priorityId) missingFields.push('Priority Level');
        if (!formData.deadline) missingFields.push('Due Date');
        if (!formData.assignedToUserId) missingFields.push('Team Member');

        if (missingFields.length > 0) {
            setValidationTrigger(prev => prev + 1);
            toast.error('Missing Required Fields', {
                description: `Please clarify: ${missingFields.join(', ')}`
            });

            // Scroll to the first missing field
            if (modalContentRef.current) {
                const firstError = modalContentRef.current.querySelector('.border-rose-500, select:invalid, input:invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Fallback: search by label matching missingFields[0]
                    const labels = modalContentRef.current.querySelectorAll('label');
                    for (const label of Array.from(labels)) {
                        if (label.textContent?.includes(missingFields[0])) {
                            label.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            break;
                        }
                    }
                }
            }
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(editingTask ? 'Saving changes...' : 'Adding task...');

        try {
            const payload = {
                TaskID: editingTask ? Number(editingTask.TaskID || editingTask.id) : 0,
                TaskStatus: Number(formData.statusId),
                TaskTypeID: Number(formData.typeId),
                ProjectID: Number((formData.projectId || '0').toString().replace(/\D/g, '')),
                Priority: Number(formData.priorityId),
                Title: formData.title,
                SubTitle: formData.subTitle,
                TaskDescription: formData.description,
                ProgressPercentage: Number(formData.progressPercentage),
                Deadline: formData.deadline,
                AssignedToUserID: Number(formData.assignedToUserId),
            };

            const result = await callAPIWithToken('tasks', payload);

            if (result.success) {
                toast.success(editingTask ? 'Task Updated' : 'Task Created', { id: toastId });

                if (editingTask) {
                    updateTask(editingTask.id, {
                        ...formData,
                        updatedAt: new Date().toISOString(),
                    } as any);
                } else {
                    addTask(formData as any);
                }

                // Mission-Critical: Refresh the board state from the API
                fetchTasks();

                setIsModalOpen(false);
            } else {
                throw new Error(result.message || result.error?.message || 'Failed to save task');
            }
        } catch (error: any) {
            console.error("Task submission error:", error);
            toast.error(error.message || "Save Failed", {
                id: toastId,
                description: "Failed to save the task on the server."
            });

            // We should NOT fallback to local store if API fails, otherwise the user thinks it succeeded
            setIsSubmitting(false);
            return;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePatchProgress = async (taskId: number, progress: number) => {
        setIsSubmitting(true);
        const toastId = toast.loading('Updating progress...');
        try {
            // Fetch the editing task details to send the full payload as required by the API
            const task = editingTask;
            if (!task) throw new Error('No task selected for update');
            const payload = {
                TaskID: taskId,
                TaskStatus: task.StatusID || task.statusId || 1,
                TaskTypeID: task.TypeID || task.typeId || 1,
                ProjectID: task.ProjectID || task.projectId || 1,
                Priority: task.PriorityID || task.priorityId || 1,
                Title: task.Title || task.title || '',
                SubTitle: task.SubTitle || task.subTitle || '',
                TaskDescription: task.Description || task.description || '',
                ProgressPercentage: progress,
                Deadline: (task.Deadline || task.deadline || '').split('T')[0],
                AssignedToUserID: (task.AssignedToUsers?.[0]?.AssignedToUserID || task.AssignedToUserID || task.assignedToUserId || 0)
            };
            const res = await callAPIWithToken('tasks', payload);
            if (res.success) {
                toast.success('Progress updated successfully', { id: toastId });
                fetchTasks();   // refresh developer table
                setIsModalOpen(false);
            } else {
                toast.error(res.message || 'Failed to update progress', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
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

        const toastId = toast.loading(`Changing status back to ${statusData.find(s => s.TaskStatusID === prevStatusId)?.TaskStatusName}...`);

        try {
            const payload = {
                TaskID: task.TaskID,
                TaskStatus: prevStatusId,
                TaskTypeID: task.TypeID,
                ProjectID: task.ProjectID,
                Priority: task.PriorityID,
                Title: task.Title,
                SubTitle: task.SubTitle || '',
                TaskDescription: task.Description,
                ProgressPercentage: explicitProgress !== undefined ? explicitProgress : task.ProgressPercentage,
                Deadline: task.Deadline?.split('T')[0],
                AssignedToUserID: task.AssignedToUsers?.[0]?.AssignedToUserID || task.AssignedToUserID || 0
            };

            const result = await callAPIWithToken('tasks', payload);

            if (result.success) {
                toast.success('Status Changed Successfully', { id: toastId });
                setIsRollbackModalOpen(false); // Close modal on success
                fetchTasks();
            } else {
                throw new Error(result.error?.message || 'Rollback failed');
            }
        } catch (error: any) {
            console.error("Status rollback error:", error);
            toast.error("Action Failed", { id: toastId });
        }
    };

    const handleAdvanceStatus = async (task: any, nextStatusId: number, isCompleted: number) => {
        const toastId = toast.loading(`Updating status to ${statusData.find(s => s.TaskStatusID === nextStatusId)?.TaskStatusName}...`);

        try {
            // Tip: If advancing to "Completed", auto-lock progress at 100%
            const completedStatus = statusData.find(s => s.TaskStatusName === "Completed");
            const finalProgress = (completedStatus && nextStatusId === completedStatus.TaskStatusID) ? 100 : task.ProgressPercentage;

            const payload = {
                TaskID: task.TaskID,
                TaskStatus: nextStatusId,
                TaskTypeID: task.TypeID,
                ProjectID: task.ProjectID,
                Priority: task.PriorityID,
                Title: task.Title,
                SubTitle: task.SubTitle || '',
                TaskDescription: task.Description,
                ProgressPercentage: finalProgress,
                Deadline: task.Deadline?.split('T')[0],
                AssignedToUserID: task.AssignedToUsers?.[0]?.AssignedToUserID || task.AssignedToUserID || 0,
                IsRejected: isCompleted ? 0 : 1,
                Remarks: isCompleted ? "Task Approved." : "Task is incomplete or requirement not fulfilled."
            };

            const result = await callAPIWithToken('tasks', payload);

            if (result.success) {
                toast.success('Status Updated Successfully', { id: toastId });
                fetchTasks();
            } else {
                throw new Error(result.error?.message || 'Update failed');
            }
        } catch (error: any) {
            console.error("Status advancement error:", error);
            toast.error("Action Failed", {
                id: toastId,
                description: "Please check your network and try again."
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this task?')) {
            deleteTask(id);
            toast.error('Task deleted');
        }
    };

    return (
        <div className="max-w-[1500px] mx-auto space-y-8 p-2">

            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                        {currentUser?.role_id === 3 ? 'My Assigned Tasks' : 'Create & Manage Task'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {currentUser?.role_id === 3 ? 'Update your progress and complete your deliverables.' : 'Monitor your tasks and track team progress.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {currentUser?.role_id !== 3 && (
                        <Button onClick={handleOpenCreateModal} className="h-11 rounded-xl bg-slate-900 text-white px-6 font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> New Task
                        </Button>
                    )}
                </div>
            </div>

            {/* Toolbar & Status Tabs */}
            <div className="space-y-6">
                <div className="relative group max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input placeholder="Search tasks..." className="pl-12 h-12 bg-white dark:bg-slate-900 shadow-sm border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>

                {/* Status tabs only for team leads/admins */}
                {viewMode === 'board' && !isDeveloper && (
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
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTaskTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}
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
                                // Find next/prev status for update
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
                                        statusId={activeStatusId || null}
                                        onStatusChange={(id: string, sId: number) => {
                                            if (activeStatusId !== null && sId < activeStatusId) {
                                                handleRollbackStatus(task, sId, 0);
                                            } else {
                                                handleAdvanceStatus(task, sId, 1);
                                            }
                                        }}
                                        onDelete={handleDelete}
                                        onEdit={handleOpenEditModal}
                                        currentUser={currentUser}
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
                ) : isDeveloper ? (
                    /* ── Developer: flat table from my-tasks API ── */
                    <motion.div key="dev-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Task</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Project</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Priority</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Assigned By</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Deadline & Progress</th>
                                        <th className="px-6 py-4 text-right font-bold text-[10px] uppercase tracking-widest text-slate-400">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedTasks.length > 0 ? paginatedTasks.map((task) => (
                                        <tr key={task.TaskID} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{task.Title}</p>
                                                {task.SubTitle && <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">{task.SubTitle}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">{task.ProjectName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", getStatusColor(task.StatusName as any))}>{task.StatusName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    task.PriorityName === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30' :
                                                        task.PriorityName === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30' :
                                                            'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                                                )}>{task.PriorityName}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                                        {task.AssignedByUserFullName?.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{task.AssignedByUserFullName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5 min-w-[140px]">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-400">{formatDate(task.Deadline)}</span>
                                                        <span className="text-[10px] font-black text-indigo-500">{task.ProgressPercentage}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${task.ProgressPercentage}%` }}
                                                            className="h-full bg-indigo-600 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => {
                                                        setEditingTask(task);
                                                        setFormData(prev => ({ ...prev, progressPercentage: task.ProgressPercentage ?? 0 }));
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 hover:bg-indigo-50 dark:border-indigo-900/30 dark:hover:bg-indigo-900/20"
                                                >
                                                    <Activity size={12} className="mr-1.5" /> Update
                                                </Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <Inbox size={40} className="mx-auto text-slate-200 mb-3" />
                                                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No tasks assigned to you</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-100 p-6 dark:border-slate-800">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Showing {paginatedTasks.length} of {filteredTasks.length} tasks</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-xl"><ChevronLeft size={16} /></Button>
                                <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="rounded-xl"><ChevronRight size={16} /></Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ── Team Lead: standard table ── */
                    <motion.div key="tl-table" initial={{ opacity: 1 }} animate={{ opacity: 1 }} className="rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Task Details</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Project</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Assignee</th>
                                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400">Deadline</th>
                                        <th className="px-6 py-4 text-right font-bold text-[10px] uppercase tracking-widest text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {paginatedTasks.length > 0 ? paginatedTasks.map((task) => (
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
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <Inbox size={40} className="mx-auto text-slate-200 mb-3" />
                                                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No tasks found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-100 p-6 dark:border-slate-800">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Showing {paginatedTasks.length} of {filteredTasks.length} items</p>
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
                                    {currentUser?.role_id === 3 ? 'Update Progress' : (editingTask ? 'Edit Task' : 'Add New Task')}
                                </h2>
                                <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 hover:bg-slate-100" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* Scrollable Modal Content */}
                            <div ref={modalContentRef} className="flex-1 overflow-y-auto p-8 pt-2 scrollbar-hide">
                                {currentUser?.role_id === 3 ? (
                                    /* Developer-only: Progress Update View */
                                    <div className="space-y-8 pb-4">
                                        {/* Task Info */}
                                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-5 space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Task</p>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{editingTask?.Title || editingTask?.title}</h3>
                                            <p className="text-xs text-slate-500">{editingTask?.Description || editingTask?.description}</p>
                                            <div className="flex flex-wrap gap-3 pt-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                                                    <Activity size={10} /> {editingTask?.StatusName || editingTask?.status}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">
                                                    <Calendar size={10} /> Due: {formatDate(editingTask?.Deadline || editingTask?.deadline)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">
                                                    {editingTask?.ProjectName}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Slider */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">My Progress</label>
                                                <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                                                    {formData.progressPercentage}%
                                                </span>
                                            </div>
                                            <div className="relative h-3 w-full">
                                                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${formData.progressPercentage}%` }} />
                                                <input
                                                    type="range" min="0" max="100"
                                                    className="absolute inset-0 w-full h-full appearance-none bg-slate-100 dark:bg-slate-700 rounded-full cursor-pointer focus:outline-none"
                                                    value={formData.progressPercentage}
                                                    onChange={e => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                                                    style={{ WebkitAppearance: 'none', background: 'transparent' }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                                            </div>
                                        </div>

                                        {/* Milestones */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {[25, 50, 75, 100].map(milestone => (
                                                <button
                                                    key={milestone}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, progressPercentage: milestone }))}
                                                    className={cn(
                                                        "py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
                                                        formData.progressPercentage >= milestone
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-300"
                                                    )}
                                                >
                                                    {milestone}%
                                                </button>
                                            ))}
                                        </div>

                                        <div className="pt-4 flex flex-col gap-3">
                                            <Button
                                                onClick={() => handlePatchProgress(editingTask?.TaskID || editingTask?.id, formData.progressPercentage)}
                                                disabled={isSubmitting}
                                                className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30"
                                            >
                                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Save Progress</>}
                                            </Button>
                                            <Button variant="ghost" className="h-11 rounded-2xl font-bold text-slate-500" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitTask} className="space-y-8 pb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", !formData.projectId && validationTrigger > 0 ? "text-rose-600" : "text-slate-400")}>Project</label>
                                                <select
                                                    className={cn(
                                                        "h-12 w-full rounded-2xl border bg-slate-50 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950",
                                                        !formData.projectId && validationTrigger > 0 ? "border-rose-500 animate-shake" : "border-slate-200 dark:border-slate-800"
                                                    )}
                                                    value={formData.projectId}
                                                    onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                                                >
                                                    <option value="">Select Project...</option>
                                                    {apiProjects.map(p => <option key={p.ProjectID} value={p.ProjectID}>{p.ProjectName}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Task Title</label>
                                                <Input placeholder="Enter task title..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-white dark:bg-slate-950 px-4 font-bold" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Module</label>
                                                <Input placeholder="e.g. Backend Development" value={formData.subTitle} onChange={e => setFormData({ ...formData, subTitle: e.target.value })} className="h-12 rounded-2xl border-slate-200 bg-white dark:bg-slate-950 px-4 font-bold" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", !formData.typeId && validationTrigger > 0 ? "text-rose-600" : "text-slate-400")}>Task Type</label>
                                                <select
                                                    className={cn(
                                                        "h-12 w-full rounded-2xl border bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950",
                                                        !formData.typeId && validationTrigger > 0 ? "border-rose-500 animate-shake" : "border-slate-200 dark:border-slate-800"
                                                    )}
                                                    value={formData.typeId}
                                                    onChange={e => setFormData({ ...formData, typeId: e.target.value })}
                                                >
                                                    <option value="">Select Type</option>
                                                    {typeData.map(t => <option key={t.TaskTypeID} value={t.TaskTypeID}>{t.TaskTypeName}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            <div className="space-y-1.5 hidden">
                                                <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", !formData.statusId && validationTrigger > 0 ? "text-rose-600" : "text-slate-400")}>Current Status</label>
                                                <select
                                                    className={cn(
                                                        "h-12 w-full rounded-2xl border bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950",
                                                        !formData.statusId && validationTrigger > 0 ? "border-rose-500 animate-shake" : "border-slate-200 dark:border-slate-800"
                                                    )}
                                                    value={formData.statusId}
                                                    onChange={e => setFormData({ ...formData, statusId: e.target.value })}
                                                >
                                                    <option value="">Select Status</option>
                                                    {statusData.map(s => <option key={s.TaskStatusID} value={s.TaskStatusID}>{s.TaskStatusName}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", !formData.priorityId && validationTrigger > 0 ? "text-rose-600" : "text-slate-400")}>Priority Level</label>
                                                <select
                                                    className={cn(
                                                        "h-12 w-full rounded-2xl border bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:bg-slate-950",
                                                        !formData.priorityId && validationTrigger > 0 ? "border-rose-500 animate-shake" : "border-slate-200 dark:border-slate-800"
                                                    )}
                                                    value={formData.priorityId}
                                                    onChange={e => setFormData({ ...formData, priorityId: e.target.value })}
                                                >
                                                    <option value="">Select Priority</option>
                                                    {priorityData.map(p => <option key={p.PriorityID} value={p.PriorityID}>{p.PriorityName}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", !formData.deadline && validationTrigger > 0 ? "text-rose-600" : "text-slate-400")}>Due Date</label>
                                                <Input
                                                    type="date"
                                                    required
                                                    value={formData.deadline}
                                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                                    className={cn("h-12 rounded-2xl border bg-white dark:bg-slate-950 px-4 font-bold", !formData.deadline && validationTrigger > 0 ? "border-rose-500 animate-shake" : "border-slate-200")}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 hidden">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Progress</label>
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
                                            <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", !formData.assignedToUserId && validationTrigger > 0 ? "text-rose-600" : "text-slate-400")}>Assign Team Member</label>
                                            <div className={cn(
                                                "flex flex-wrap gap-2 p-5 rounded-3xl bg-slate-50 border transition-all dark:bg-slate-950/50",
                                                !formData.assignedToUserId && validationTrigger > 0 ? "border-rose-500 animate-shake" : "border-slate-100 dark:border-slate-800"
                                            )}>
                                                {availableDevs.length > 0 ? (
                                                    availableDevs.map(dev => (
                                                        <button
                                                            key={dev.UserID}
                                                            type="button"
                                                            onClick={() => selectDeveloper(dev.UserID)}
                                                            className={cn(
                                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0",
                                                                formData.assignedToUserId === dev.UserID?.toString()
                                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105"
                                                                    : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400 dark:bg-slate-900 dark:border-slate-800"
                                                            )}
                                                        >
                                                            {formData.assignedToUserId === dev.UserID?.toString() ? <CheckCircle2 size={12} /> : <UserIcon size={12} />}
                                                            {dev.UserFullName}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest py-2 text-center w-full italic">Assign team members to the project first</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Task Description</label>
                                            <textarea
                                                className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-950 dark:border-slate-800"
                                                placeholder="Enter task details..."
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Modal Footer — only for team leads / admins */}
                            {currentUser?.role_id !== 3 && (
                                <div className="p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                                    <Button variant="ghost" type="button" className="rounded-2xl h-12 px-8 font-bold text-slate-500 hover:bg-slate-50" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleSubmitTask}
                                        disabled={isSubmitting}
                                        className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-600/30 active:scale-[0.98] transition-all"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <>{editingTask ? 'Save Changes' : 'Add Task'}</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Status Change Confirmation Modal */}
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
                                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Change Status</h2>
                                    <p className="text-sm text-slate-500 mt-2">Moving <b>{rollbackTask?.Title}</b> from Completed back to an active state. Update the progress below.</p>
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

            {/* rejection modal */}
             <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </Field>
            <Field>
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
        </div>
    );
}
