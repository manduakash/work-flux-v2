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
    CircleX,
    AlertTriangle,
    ShieldAlert,
    PenBoxIcon,
    CalendarDays,
    Check,
    Circle,
    ArrowRight,
    FolderOpen,
    Tag,
    Flag,
    BookA,
    Eye,
    CheckCheck
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
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"

import { useStore } from "@/store/useStore";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import { TaskStatus, UserRole, Task } from '@/types';
import { callGetAPIWithToken, callAPIWithToken, callPatchAPIWithToken, callDeleteAPIWithToken } from '@/components/apis/commonAPIs';
import { getCookie } from '@/utils/cookies';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSearchParams } from 'next/navigation';

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
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50" onClick={() => onDelete(task)}>
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
            {task?.isRejected ? (
                <div className='flex flex-col gap-1.5'>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                        <AlertCircle size={12} /> Rejection Remarks
                    </div>
                    <div className='border bg-rose-50/50 rounded-xl text-[11px] p-3 border-rose-100 text-rose-700 min-h-[40px] max-h-[80px] overflow-y-auto modal-scrollbar leading-relaxed font-medium dark:bg-rose-900/10 dark:border-rose-900/20 dark:text-rose-400'>
                        {task?.remarks}
                    </div>
                </div>
            ) : ""}

            <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(task.deadline)}</div>
                    <span className="text-slate-900 dark:text-white font-black">{task.progressPercentage}% Complete</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progressPercentage}%` }}
                        className={cn(
                            "h-full shadow-[0_0_8px_rgba(79,70,229,0.4)] rounded-full transition-all duration-500",
                            task?.isRejected ? "bg-rose-500 shadow-rose-500/20" : "bg-indigo-600 shadow-indigo-600/20"
                        )}
                    />
                </div>
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
                            <Button variant="outline" size="sm" title="Mark as Complete" onClick={() => onStatusChange(task.id, nextStatus.id, "COMPLETE")} className="text-[10px] p-0 font-black uppercase tracking-widest cursor-pointer border-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-full transition-all">
                                <CircleCheckBig className='m-0 p-0' />
                            </Button>
                            <Button variant="outline" size="sm" title="Mark as Incomplete" onClick={() => onStatusChange(task.id, nextStatus.id, "REJECTED")} className="text-[10px] p-0 font-black uppercase tracking-widest cursor-pointer border-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-full transition-all">
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
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState<boolean>(false);
    const [isTaskCompleteModalOpen, setIsTaskCompleteModalOpen] = useState<boolean>(false);
    const [remarks, setRemarks] = useState("");
    const [editingTask, setEditingTask] = useState<any | null>(null);
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
    const [currentTask, setCurrentTask] = useState<any>(null);
    const [filter, setFilter] = useState<any>({
        type: "", status: "", priority: "", isRejected: -1
    });
    const [isLoading, setIsLoading] = useState({
        REJECTED: false,
        COMPLETE: false,
        TASKS: false
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<any>(null);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [isCompletingTask, setIsCompletingTask] = useState(false);

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

    const searchParams = useSearchParams();

    useEffect(() => {
        const user = getCookie("user");
        console.log("user", user);
        setCurrentUser(user);
        if (user) {
            console.log("viewMode", viewMode);
            fetchTasks(user);
        }
    }, [viewMode, searchParams]);

    const fetchTasks = async (userOverride?: any) => {
        const user = userOverride || currentUser;
        if (!user) return;
        try {
            setIsLoading((prev: any) => ({ ...prev, TASKS: true }));
            const taskId = atob(searchParams.get("__task") || "");
            const userId = user?.id?.toString().replace(/\D/g, '') || user?.UserID?.toString().replace(/\D/g, '') || '0';
            const isDeveloper = user?.role_id == 3;
            const endpoint = isDeveloper
                ? `tasks?taskId=${taskId || 0}&projectId=0&taskStatus=${filter?.status || 0}&taskTypeId=${filter?.type || 0}&taskPriority=${filter?.priority || 0}`
                : `tasks?taskId=${taskId || 0}&projectId=0&taskStatus=${filter?.status || 0}&taskTypeId=${filter?.type || 0}&taskPriority=${filter?.priority || 0}`;
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
        } finally {
            setIsLoading((prev: any) => ({ ...prev, TASKS: false }));

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

    // Set initial filters from searchParams
    useEffect(() => {
        const type = searchParams.get("__ty") ? atob(searchParams.get("__ty")!) : "";
        const status = searchParams.get("__st") ? atob(searchParams.get("__st")!) : "";
        const priority = searchParams.get("__pr") ? atob(searchParams.get("__pr")!) : "";
        const isRejected = searchParams.get("__x") === "1" ? 1 : -1;

        setFilter({
            type,
            status,
            priority,
            isRejected
        });

        const role_id = getCookie("role_id");
        setViewMode(role_id == "2" ? "board" : "table");
    }, [searchParams]);

    // Compute filteredTasks whenever dependencies change
    const filteredTasks = useMemo(() => {
        const source = isDeveloper ? myTasks : apiTasks;

        const statusFiltered = (!isDeveloper && activeStatusId !== null && viewMode === "board")
            ? source.filter(t => t.StatusID === activeStatusId)
            : source;

        return statusFiltered.filter(t => {
            const searchStr = `${t.Title} ${t.Description} ${t.ProjectName}`.toLowerCase();
            const matchesSearch = searchStr.includes(searchQuery.toLowerCase());

            if (viewMode !== "table") return matchesSearch;

            const matchesType = !filter.type || String(t.TypeID) === String(filter.type);
            const matchesStatus = !filter.status || String(t.StatusID) === String(filter.status);
            const matchesPriority = !filter.priority || String(t.PriorityID) === String(filter.priority);
            const matchesCompleted = filter.isRejected === -1 || t.IsRejected === filter.isRejected;

            return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesCompleted;
        });
    }, [apiTasks, myTasks, searchQuery, isDeveloper, activeStatusId, viewMode, filter]);

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
                AssignedToUserID: Number(formData.assignedToUserId)
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
                TaskStatus: progress == 100 ? 3 : 2,
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

    const handleUpdateTaskStatus = async (type: string) => {
        if (!currentTask) return;

        const isRejected = type === "REJECTED";
        const targetStatusId = isRejected ? 2 : 4; // 2: In Progress/Revise, 4: Completed
        const statusName = statusData.find(s => s.TaskStatusID === targetStatusId)?.TaskStatusName || (isRejected ? 'Revision' : 'Completion');

        const toastId = toast.loading(`Updating task status to ${statusName}...`);

        try {
            const payload = {
                TaskID: currentTask.TaskID || currentTask.id,
                TaskStatus: targetStatusId,
                IsRejected: isRejected ? 1 : 0,
                Remarks: remarks,
                TaskPriority: currentTask.PriorityID || currentTask.priorityId,
                TaskDeadline: (currentTask.Deadline || currentTask.deadline)?.split('T')[0]
            };

            const result = await callPatchAPIWithToken('tasks/status', payload);

            if (result.success) {
                toast.success(`Task ${isRejected ? 'Sent for Revision' : 'Marked as Complete'}`, { id: toastId });
                setIsRejectionModalOpen(false);
                setIsTaskCompleteModalOpen(false);
                setRemarks("");
                fetchTasks();
            } else {
                throw new Error(result.error?.message || result.message || 'Status update failed');
            }
        } catch (error: any) {
            console.error("Status update error:", error);
            toast.error(error.message || "Action Failed", { id: toastId });
        }
    };

    const handleCompleteTask = async (task: any) => {
        console.log("task", task)
        if (!task) return;

        try {
            setIsCompletingTask(task?.TaskID);
            const payload = {
                TaskID: task?.TaskID || task?.id,
                TaskStatus: 3,
                IsRejected: 0,
                Remarks: "Task Completed",
                TaskPriority: task?.PriorityID,
                TaskDeadline: (task?.Deadline)?.split('T')[0]
            };

            const result = await callPatchAPIWithToken('tasks/status', payload);

            if (result.success) {
                toast.success(`Task has been completed!`);
                setIsRejectionModalOpen(false);
                setIsTaskCompleteModalOpen(false);
                setRemarks("");
                fetchTasks();
            } else {
                throw new Error(result.error?.message || result.message || 'Status update failed');
            }
        } catch (error: any) {
            console.error("Status update error:", error);
            toast.error(error.message || "Action Failed",);
        } finally {
            setIsCompletingTask(false);
        }
    };

    const handleUndoCompleteTask = async (task: any) => {
        console.log("task", task)
        if (!task) return;

        try {
            setIsCompletingTask(task?.TaskID);
            const payload = {
                TaskID: task?.TaskID || task?.id,
                TaskStatus: 3,
                IsRejected: 0,
                Remarks: "Task Completed",
                TaskPriority: task?.PriorityID,
                TaskDeadline: (task?.Deadline)?.split('T')[0]
            };

            const result = await callPatchAPIWithToken('tasks/status', payload);

            if (result.success) {
                toast.success(`Task has been completed!`);
                setIsRejectionModalOpen(false);
                setIsTaskCompleteModalOpen(false);
                setRemarks("");
                fetchTasks();
            } else {
                throw new Error(result.error?.message || result.message || 'Status update failed');
            }
        } catch (error: any) {
            console.error("Status update error:", error);
            toast.error(error.message || "Action Failed",);
        } finally {
            setIsCompletingTask(false);
        }
    };


    const handleDelete = (task: any) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;

        setIsDeletingTask(true);
        const toastId = toast.loading('Purging task from system...');
        try {
            const taskId = taskToDelete.TaskID || taskToDelete.id;
            const result = await callDeleteAPIWithToken('tasks', { taskId: Number(taskId) });
            if (result.success) {
                toast.success('Task Purged Successfully', { id: toastId });
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
                fetchTasks();
            } else {
                toast.error(result.message || 'Purge failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred during deletion', { id: toastId });
        } finally {
            setIsDeletingTask(false);
        }
    };

    const handleTaskCompleteOrRejection = async (type: string) => {
        try {

            setIsLoading({ ...isLoading, [type]: true });
            await handleUpdateTaskStatus(type);
            setRemarks("");
            setIsRejectionModalOpen(false);
            setIsTaskCompleteModalOpen(false);
        } catch (error: any) {
            console.error("Error updating task status:", error);
            toast.error("Action Failed", {
                description: "Please check your network and try again."
            });
        } finally {
            setIsLoading({ ...isLoading, [type]: false });
        }
    }

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.split(' ').filter(Boolean);
        return parts.map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="max-w-[1500px] mx-auto space-y-8 p-2">

            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                        {currentUser?.role_id === 3 ? 'Task Management' : 'Task Management'}
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
                {currentUser?.role_id == 3 &&
                    <div className='flex justify-between items-center gap-4'>
                        <div className="relative group flex-1">
                            <Input placeholder="Search tasks..." className="pl-12 h-12 bg-white dark:bg-indigo-950 shadow-sm border-slate-200 dark:border-slate-200/20 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>

                        {/* Task Status Dropdown */}
                        <div>
                            <Select value={filter?.status?.toString()}
                                onValueChange={(value) =>
                                    setFilter((prev: any) => ({ ...prev, status: value.toString() }))
                                }
                            >
                                <SelectTrigger className="dark:bg-indigo-950/80 dark:hover:bg-indigo-950/80 w-full min-w-44 max-w-44 py-6 px-4 rounded-2xl shadow bg-white">
                                    <SelectValue placeholder="Select Task Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Task Status</SelectLabel>
                                        <SelectItem value="0">All Status</SelectItem>
                                        {statusData?.map((status: any, key: number) =>
                                            <SelectItem key={key} value={status?.TaskStatusID?.toString()}>{status?.TaskStatusName}</SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Task Priority Dropdown */}
                        <div>
                            <Select
                                value={filter?.priority?.toString()}
                                onValueChange={(value) =>
                                    setFilter((prev: any) => ({
                                        ...prev,
                                        priority: value?.toString()
                                    }))
                                }>
                                <SelectTrigger className="dark:bg-indigo-950/80 dark:hover:bg-indigo-950/80 w-full min-w-44 max-w-44 py-6 px-4 rounded-2xl shadow bg-white">
                                    <SelectValue placeholder="Select Task Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Task Priority</SelectLabel>
                                        <SelectItem value="0">All Priorities</SelectItem>
                                        {priorityData?.map((priority: any, key: number) =>
                                            <SelectItem key={key} value={priority?.PriorityID?.toString()}>{priority?.PriorityName}</SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Task Type Dropdown */}
                        <div>
                            <Select
                                value={filter?.type?.toString()}
                                onValueChange={(value) =>
                                    setFilter((prev: any) => ({
                                        ...prev,
                                        type: value?.toString()
                                    }))
                                }>
                                <SelectTrigger className="dark:bg-indigo-950/80 dark:hover:bg-indigo-950/80 w-full min-w-44 max-w-44 py-6 px-4 rounded-2xl shadow bg-white">
                                    <SelectValue placeholder="Select Task Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Task Type</SelectLabel>
                                        <SelectItem value="0">All Types</SelectItem>
                                        {typeData?.map((type: any, key: number) =>
                                            <SelectItem key={key} value={type?.TaskTypeID?.toString()}>{type?.TaskTypeName}</SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rejected/Completed Dropdown */}
                        <div>
                            <Select
                                value={filter?.isRejected?.toString()}
                                onValueChange={(value) =>
                                    setFilter((prev: any) => ({
                                        ...filter,
                                        isRejected: value.toString(),
                                        status: value == "1" ? "2" : value == "0" ? "4" : "",
                                    }))
                                }>
                                <SelectTrigger className="dark:bg-indigo-950/80 dark:hover:bg-indigo-950/80 w-full min-w-44 max-w-44 py-6 px-4 rounded-2xl shadow bg-white">
                                    <SelectValue placeholder="Select Review Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Completed/Incomplete Task</SelectLabel>
                                        <SelectItem value="-1">All Tasks</SelectItem>
                                        <SelectItem value="1">Incompleted Marked Tasks</SelectItem>
                                        <SelectItem value="0">Approved Tasks</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                }

                {/* Status tabs only for team leads/admins */}
                {viewMode === 'board' && !isDeveloper && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-100 dark:border-slate-800">
                        {statusData.map((status) => {
                            const isActive = activeStatusId === status.TaskStatusID;
                            return (
                                <button
                                    key={status?.TaskStatusID}
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


                                return (
                                    <TaskGridCard
                                        key={task.TaskID}
                                        task={{
                                            ...task,
                                            id: task.TaskID.toString(),
                                            title: task.Title,
                                            description: task.Description,
                                            progressPercentage: task.StatusName === "Completed" ? 100 : task.ProgressPercentage,
                                            deadline: task.Deadline,
                                            isRejected: task.IsRejected,
                                            remarks: task.Remarks
                                        }}
                                        project={{ name: task.ProjectName }}
                                        assignee={{ name: task.AssignedToUsers?.[0]?.AssignedToUserFullName || task.AssignedByUserFullName || 'Unassigned' }}
                                        nextStatus={nextStatus ? { id: nextStatus.TaskStatusID, title: nextStatus.TaskStatusName } : null}
                                        statusId={activeStatusId || null}
                                        onStatusChange={(id: string, sId: number, status: string) => {
                                            setCurrentTask(task);
                                            if (status === "COMPLETE") {
                                                setIsTaskCompleteModalOpen(true);
                                            } else {
                                                setIsRejectionModalOpen(true);
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
                    <motion.div key="dev-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                        <div className="overflow-y-auto pb-6">
                            {isLoading?.TASKS ? (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <Loader2 size={40} className="text-indigo-600 mb-4 animate-spin" />
                                    <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Tasks Loading...</p>
                                </div>
                            ) : paginatedTasks?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                    {paginatedTasks.map((task) => {
                                        const isCompleted = task.StatusID > 2;
                                        const isRejected = task?.IsRejected && task?.StatusID == 2;
                                        const assignerName = task.AssignedByUserFullName || 'Unassigned';
                                        const initials = getInitials(assignerName);

                                        // Progress SVG logic
                                        const radius = 6;
                                        const circumference = 2 * Math.PI * radius;
                                        const strokeDashoffset = isCompleted ? 0 : circumference - ((task.ProgressPercentage || 0) / 100) * circumference;

                                        return (
                                            <div className="bg-white h-fit dark:bg-slate-800 border rounded-md shadow-sm" key={task?.TaskID}>
                                                <div
                                                    className={cn(
                                                        "group relative flex flex-col bg-white dark:bg-slate-950/50 border rounded-md shadow-sm px-4 py-8 min-h-[140px] transition-all",
                                                        isRejected
                                                            ? "border-rose-300 dark:border-rose-900/50 bg-rose-50/30 dark:bg-[#3f2a2e]/40 hover:border-rose-400 dark:hover:border-rose-700/80"
                                                            : "border-slate-200 dark:border-indigo-800/10 hover:border-indigo-500/50"
                                                    )}
                                                >
                                                    {/* Actions overlay (appears on hover) */}
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-[#292929]/90 backdrop-blur-sm px-1 py-0.5 rounded-md shadow-sm z-10 border border-slate-100 dark:border-slate-700">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTask(task);
                                                                setFormData(prev => ({ ...prev, progressPercentage: task.ProgressPercentage ?? 0 }));
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-indigo-500 cursor-pointer rounded flex items-center gap-1.5"
                                                            title="View Task"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Header: Project Name & More Icon */}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-[#8378f4] uppercase tracking-wide truncate pr-4">
                                                            {task.ProjectName}
                                                        </span>
                                                        <MoreHorizontal size={16} className="text-slate-400 dark:text-[#a19f9d] opacity-100 group-hover:opacity-0 transition-opacity shrink-0" />
                                                    </div>

                                                    {/* Main Body: Checkbox & Title */}
                                                    <div className="flex items-start gap-3 mb-2 flex-grow">
                                                        <div className="mt-0.5 shrink-0">
                                                            {isCompleted ? (
                                                                <div className="bg-emerald-600 dark:bg-[#7b83eb] rounded-full w-[22px] h-[22px] flex items-center justify-center">
                                                                    <CheckCheck size={14} className="text-white dark:text-[#292929] stroke-[3]" />
                                                                </div>
                                                            ) : (
                                                                <button className="m-0 p-0 bg-transparent" onClick={() => handleCompleteTask(task)}>{isCompletingTask == task?.TaskID ? <Loader2 className="text-slate-400 w-6 h-6 animate-spin cursor-progress" /> : task?.StatusID == 3 ? <CheckCircle2 className='h-6 w-6 text-emerald-500 m-0' /> : <Circle className='h-6 w-6 text-slate-500 m-0 cursor-pointer' />}</button>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span title="Task Title" className={cn(
                                                                "text-[15px] leading-snug break-words font-medium",
                                                                isCompleted
                                                                    ? "line-through text-slate-500 dark:text-[#a19f9d]"
                                                                    : "text-slate-900 dark:text-[#f5f5f5]"
                                                            )}>
                                                                {task.Title}
                                                            </span>
                                                            {task.SubTitle && (
                                                                <span title="Task Module" className="text-[10px] text-slate-400 dark:text-[#a19f9d] font-medium mt-1 uppercase tracking-wider">
                                                                    {task.SubTitle}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Tags: Priority & Status */}
                                                    <div className="flex flex-wrap gap-2 ml-8 mb-4">
                                                        <span title="Current Stage of Task" className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest", getStatusColor(task.StatusName as any))}>
                                                            {task?.StatusID == 1 ? "New Task" : task?.StatusID == 2 ? "In Progress" : task?.StatusID == 3 ? "Review Pending" : task?.StatusID == 4 ? "Approved by Lead" : task?.StatusName}
                                                        </span>
                                                        <span title="Task Urgency" className={cn(
                                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                                            task.PriorityName === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-400' :
                                                                task.PriorityName === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400' :
                                                                    'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                                        )}>
                                                            {task.PriorityName} Priority
                                                        </span>
                                                    </div>

                                                    {/* Rejection Remarks Box */}
                                                    {(isRejected && task?.Remarks) ? (
                                                        <div className="ml-8 mb-4 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg p-2.5 flex items-start gap-2">
                                                            <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                                            <div className="max-h-16 overflow-y-auto text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-widest leading-relaxed [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-rose-200 dark:[&::-webkit-scrollbar-thumb]:bg-rose-800 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
                                                                {task.Remarks}
                                                            </div>
                                                        </div>
                                                    ) : <div title="Task Description" className="ml-8 mb-4 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-2.5 flex items-start gap-2">
                                                        <BookA size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                                        <div className="max-h-16 overflow-y-auto text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest leading-relaxed [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-indigo-200 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-800 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
                                                            {task?.Description || "Not Given!"}
                                                        </div>
                                                    </div>}

                                                    {/* Progress Icon */}
                                                    {!isCompleted && task.ProgressPercentage > 0 && (
                                                        <div className="ml-8 mb-3 flex items-center gap-2">
                                                            <svg width="16" height="16" viewBox="0 0 16 16" className="transform -rotate-90">
                                                                <circle cx="8" cy="8" r="6" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-[#424242]" />
                                                                <circle cx="8" cy="8" r="6" fill="transparent" stroke="#3b82f6" strokeWidth="2" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" />
                                                            </svg>
                                                            <span className="text-[10px] font-bold text-blue-500 dark:text-[#7b83eb]">{task.ProgressPercentage}%</span>
                                                        </div>
                                                    )}

                                                    {/* Footer: Date & Assigner */}
                                                    <div className="flex justify-between items-end mt-auto pt-2 ml-8 border-t border-slate-100 dark:border-[#3b3b3b] min-h-[32px]">
                                                        {/* Date Badge */}
                                                        <div className={cn(
                                                            "text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5 shadow-sm",
                                                            isCompleted ? "bg-slate-100 text-slate-500 dark:bg-[#3b3b3b] dark:text-[#a19f9d]" : "bg-rose-600 dark:bg-[#c93b51] text-white"
                                                        )}>
                                                            <CalendarDays size={13} strokeWidth={2.5} />
                                                            <span className="font-medium pt-px">{formatDate(task.Deadline)}</span>
                                                        </div>

                                                        {/* Assigner */}
                                                        <div className="flex items-center gap-1.5" title={`Assigned by: ${assignerName}`}>
                                                            <span className="text-[9px] font-bold text-slate-400 dark:text-[#a19f9d] uppercase tracking-widest">By</span>
                                                            <div className="w-[24px] h-[24px] rounded-full bg-indigo-600 dark:bg-[#5850c4] flex items-center justify-center shadow-sm">
                                                                <span className="text-[10px] font-bold text-white">{initials}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <Inbox size={50} className="text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-slate-400 dark:text-slate-500 font-bold italic uppercase tracking-widest text-xs">No tasks found.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#3b3b3b] pt-4 mt-auto">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Showing {paginatedTasks?.length || 0} of {filteredTasks?.length || 0} tasks
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-xl border-slate-200 dark:border-[#3b3b3b] cursor-pointer dark:bg-indigo-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="rounded-xl border-slate-200 dark:bg-indigo-800 cursor-pointer dark:border-[#3b3b3b] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <ChevronRight size={16} />
                                </Button>
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
                                    {isLoading?.TASKS ?
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <Loader2 size={40} className="mx-auto text-indigo-600 mb-3 animate-spin" />
                                                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Tasks Loading...</p>
                                            </td>
                                        </tr>
                                        : paginatedTasks?.length > 0 ?
                                            paginatedTasks?.map((task) => (
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
                                                        <div className="flex justify-end gap-1 items-center">
                                                            {task.StatusID === 3 && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        title="Approve & Complete"
                                                                        onClick={() => {
                                                                            setCurrentTask(task);
                                                                            setIsTaskCompleteModalOpen(true);
                                                                        }}
                                                                        className="h-8 w-8 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                                                    >
                                                                        <CircleCheckBig size={16} />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        title="Reject / Needs Revision"
                                                                        onClick={() => {
                                                                            setCurrentTask(task);
                                                                            setIsRejectionModalOpen(true);
                                                                        }}
                                                                        className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                                    >
                                                                        <CircleX size={16} />
                                                                    </Button>
                                                                    <div className="w-px h-4 bg-slate-100 mx-1" />
                                                                </>
                                                            )}
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleOpenEditModal({
                                                                ...task,
                                                                id: task.TaskID.toString(),
                                                                projectId: task.ProjectID.toString(),
                                                                title: task.Title,
                                                                description: task.Description,
                                                                progressPercentage: task.ProgressPercentage,
                                                                deadline: task.Deadline,
                                                                status: task.StatusName as any
                                                            })}><Pencil size={14} className="text-slate-400 hover:text-indigo-600" /></Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDelete(task)}><Trash2 size={14} className="text-slate-400 hover:text-rose-500" /></Button>
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
                            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[2rem] bg-white flex flex-col shadow-2xl dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800"
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 pb-4 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1e1e1e]">
                                <div className="flex flex-col">
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                                        {currentUser?.role_id === 3 ? 'Task Details & Progress' : (editingTask ? 'Edit Task' : 'Add New Task')}
                                    </h2>
                                    {currentUser?.role_id === 3 && editingTask?.SubTitle && (
                                        <span className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-widest">{editingTask.SubTitle}</span>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-200 dark:hover:bg-slate-800 bg-slate-100 dark:bg-slate-800/50 transition-colors" onClick={() => setIsModalOpen(false)}>
                                    <X size={18} className="text-slate-600 dark:text-slate-400" />
                                </Button>
                            </div>

                            {/* Scrollable Modal Content */}
                            <div ref={modalContentRef} className="flex-1 overflow-y-auto p-6 md:p-8 pt-6 scrollbar-hide bg-white dark:bg-[#1e1e1e]">
                                {currentUser?.role_id === 3 ? (
                                    /* Developer-only: Detailed Task View & Progress Update */
                                    <div className="space-y-6 pb-4">

                                        {/* Rejection Alert Banner */}
                                        {editingTask?.IsRejected === 1 && (
                                            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                                                <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-xl shrink-0 mt-0.5">
                                                    <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-[13px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400 mb-1">Task Needs Revision</h4>
                                                    <p className="text-sm font-medium text-rose-600 dark:text-rose-300 leading-relaxed">
                                                        <span className="font-bold">Remarks:</span> {editingTask?.Remarks || "No remarks provided."}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Description Section */}
                                        <div className="rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-slate-800/80 p-5 md:p-6 shadow-sm">
                                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight mb-3">
                                                {editingTask?.Title || editingTask?.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                                {editingTask?.Description || editingTask?.description || "No description provided."}
                                            </p>
                                        </div>

                                        {/* Metadata Bento Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {/* Project */}
                                            <div className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-slate-800/80">
                                                <FolderOpen size={16} className="text-indigo-500 mb-2" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{editingTask?.ProjectName || '-'}</span>
                                            </div>

                                            {/* Task Type */}
                                            <div className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-slate-800/80">
                                                <Tag size={16} className="text-blue-500 mb-2" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Task Type</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{editingTask?.TypeName || '-'}</span>
                                            </div>

                                            {/* Priority */}
                                            <div className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-slate-800/80">
                                                <Flag size={16} className={cn("mb-2",
                                                    editingTask?.PriorityName === 'Critical' ? 'text-rose-500' :
                                                        editingTask?.PriorityName === 'High' ? 'text-amber-500' : 'text-emerald-500')}
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</span>
                                                <span className={cn("text-sm font-bold truncate",
                                                    editingTask?.PriorityName === 'Critical' ? 'text-rose-600 dark:text-rose-400' :
                                                        editingTask?.PriorityName === 'High' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                                )}>{editingTask?.PriorityName || '-'}</span>
                                            </div>

                                            {/* Status */}
                                            <div className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-slate-800/80">
                                                <Activity size={16} className="text-indigo-500 mb-2" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</span>
                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">{editingTask?.StatusName || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Assignments Block */}
                                            <div className="flex flex-col justify-center p-5 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-slate-800/80">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Assignment Flow</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Assigned By</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-black">
                                                                {editingTask?.AssignedByUserFullName?.charAt(0) || 'U'}
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{editingTask?.AssignedByUserFullName}</span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 mt-3" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Assigned To</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-black">
                                                                {editingTask?.AssignedToUserFullName?.charAt(0) || 'U'}
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{editingTask?.AssignedToUserFullName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timeline Block */}
                                            <div className="flex flex-col justify-center p-5 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-100 dark:border-slate-800/80">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Timeline</span>
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-xl shrink-0">
                                                        <Clock size={18} className="text-rose-600 dark:text-rose-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Deadline Date</span>
                                                        <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">{formatDate(editingTask?.Deadline)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Update Progress Section */}
                                        {editingTask?.StatusID == 2 ? <div className="mt-4 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">Update Progress</label>
                                                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                                                    {formData.progressPercentage}%
                                                </span>
                                            </div>
                                            <div className="relative h-4 w-full px-2">
                                                <div className="absolute inset-y-0 left-2 right-2 bg-slate-100 dark:bg-[#2a2a2a] rounded-full" />
                                                <div className="absolute inset-y-0 left-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ width: `calc(${formData.progressPercentage}% - ${formData.progressPercentage === 100 ? 0 : 4}px)` }} />
                                                <input
                                                    type="range" min="0" max="100"
                                                    className="absolute inset-0 w-full h-full appearance-none bg-transparent rounded-full cursor-pointer focus:outline-none z-10"
                                                    value={formData.progressPercentage}
                                                    onChange={e => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                                                    style={{ WebkitAppearance: 'none' }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">
                                                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span className="text-indigo-500">100%</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-4 flex justify-end gap-3">
                                                <Button variant="ghost" className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setIsModalOpen(false); setFormData({ ...formData, progressPercentage: 0 }) }}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={() => handlePatchProgress(editingTask?.TaskID || editingTask?.id, formData.progressPercentage)}
                                                    disabled={isSubmitting}
                                                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                                                >
                                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Save Progress</>}
                                                </Button>
                                            </div>
                                        </div> : null}
                                    </div>
                                ) : (
                                    /* ADMIN / LEAD FORM SECTION REMAINS EXACTLY THE SAME */
                                    <form onSubmit={handleSubmitTask} className="space-y-8 pb-4">
                                        {/* ... Your Existing Form Code here ... */}
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
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Sub title</label>
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
                                                "flex flex-wrap gap-2 p-5 rounded-3xl bg-slate-50 border transition-all dark:bg-slate-950/50 max-h-[200px] overflow-y-auto modal-scrollbar",
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
                                <div className="p-6 md:p-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1e1e1e] flex justify-end gap-3 shrink-0">
                                    <Button variant="ghost" type="button" className="rounded-2xl h-12 px-8 font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleSubmitTask}
                                        disabled={isSubmitting}
                                        className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
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


            {/* rejection modal */}
            <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center text-center gap-3">

                        {/* Warning Icon */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>

                        <DialogTitle className="text-lg font-semibold">
                            Do you really want to reject this?
                        </DialogTitle>

                        <p className="text-sm text-muted-foreground">
                            Please provide a reason for rejection.
                        </p>
                    </DialogHeader>

                    {/* Remarks */}
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="remarks">Rejection Remarks</Label>
                        <Textarea
                            id="remarks"
                            placeholder="Write the reason for rejection..."
                            className="min-h-[100px]"
                            value={remarks}
                            onChange={(e: any) => setRemarks(e.target.value)}
                        />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectionModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            disabled={!remarks?.trim() || isLoading?.REJECTED}
                            onClick={() => handleTaskCompleteOrRejection("REJECTED")}
                        >
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* complete task modal */}
            <Dialog open={isTaskCompleteModalOpen} onOpenChange={setIsTaskCompleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center text-center gap-3">

                        {/* Warning Icon */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <CircleCheckBig className="h-6 w-6 text-emerald-600" />
                        </div>

                        <DialogTitle className="text-lg font-semibold">
                            Do you want to complete this?
                        </DialogTitle>

                    </DialogHeader>

                    {/* Remarks */}
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="remarks">Remarks <span className='text-slate-400 text-sm'>(optional)</span></Label>
                        <Textarea
                            id="remarks"
                            placeholder="Write the remarks for any improvement..."
                            className="min-h-[100px]"
                            value={remarks}
                            onChange={(e: any) => setRemarks(e.target.value)}
                        />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsTaskCompleteModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="outline"
                            className='bg-emerald-100 text-emerald-700 hover:bg-emerald-300'
                            onClick={() => handleTaskCompleteOrRejection("COMPLETE")}
                            disabled={!!isLoading?.COMPLETE}
                        >
                            Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Premium Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeletingTask && setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 30, opacity: 0 }}
                            className="relative w-full max-w-lg flex flex-col overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-white dark:bg-slate-900 dark:border-slate-800"
                        >
                            <div className="p-10 pb-6 text-center">
                                <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30">
                                    <ShieldAlert size={40} />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight dark:text-white">Confirm Task Deletion?</h2>
                                <p className="text-sm font-medium text-slate-500 mt-2 italic px-8 dark:text-slate-400">
                                    You are about to permanently delete <span className="text-rose-600 font-bold dark:text-rose-400">{taskToDelete?.Title || taskToDelete?.title}</span>. This action cannot be undone.
                                </p>
                            </div>

                            <div className="px-10 pb-10">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-8 dark:bg-slate-800/50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="text-amber-500" size={18} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Warning</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 mt-2 dark:text-slate-300 leading-relaxed">
                                        Deleting this task will remove its history, progress tracking, and association with the project permanently.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        variant="ghost"
                                        disabled={isDeletingTask}
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 rounded-2xl h-14 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={isDeletingTask}
                                        onClick={confirmDeleteTask}
                                        className="flex-[2] rounded-2xl h-14 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-rose-600/20 active:scale-95 transition-all"
                                    >
                                        {isDeletingTask ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-3" size={18} />}
                                        Yes, Purge Task
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
