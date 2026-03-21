"use client";

import React, { useEffect, useState } from "react";
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Clock,
    Folder,
    Calendar,
    XCircle,
    User,
    Loader2
} from "lucide-react";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Assuming you have this implemented locally
import { callAPIWithToken, callGetAPIWithToken } from "./apis/commonAPIs";
import { useRouter } from "next/navigation";

// --- DATE UTILITY FUNCTIONS ---

// 1. Utility for NotificationCreatedOn (Relative time e.g., "5 mins ago")
const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    let diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates
    if (diff < 0) diff = 0;

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);

    if (diff < 60) return "Just now";

    if (minutes < 60) {
        return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    }

    if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    if (days === 1) return "Yesterday";

    if (days < 7) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

// 2. Utility for EntityDeadline (Formatted date e.g., "Oct 25, 2023")
const formatDeadline = (dateString: string | null | undefined): string => {
    if (!dateString) return "No Deadline";

    const date = new Date(dateString);
    // Optional: Check if deadline is overdue
    // const isOverdue = date.getTime() < new Date().getTime();

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// --- INTERFACES & HELPERS ---

interface Notification {
    NotificationID: string;
    ActionTypeName: string;
    EntityTypeName: string;
    EntityID: number;
    EntityDesc: string;
    IsRead: number; // Assuming 0 is unread, 1 is read
    ReadOn: string;
    NotificationCreatedOn: string;
    Priority: string;
    EntityDeadline: string;
    InitiatedBy: string;
    ProjectName: string;
}

const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case "critical":
        case "high": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
        case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "low": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
};

const getIcon = (type: string) => {
    switch (type) {
        case "added": return <Clock className="h-4 w-4 text-blue-500" />;
        case "modified": return <AlertCircle className="h-4 w-4 text-amber-500" />;
        case "completed":
        case "review": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        case "rejected":
        case "removed": return <XCircle className="h-4 w-4 text-rose-500" />;
        default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
};

const getNotificationTitle = (type: string) => {
    switch (type) {
        case "added": return "New Task Assigned";
        case "modified": return "Task Has Been Updated";
        case "completed": return "Task Has Been Approved";
        case "review": return "Task Completed";
        case "rejected": return "Task Has Been Marked as Incomplete";
        case "removed": return "Task/Project Has Been Removed";
        default: return "New Notification"; // Fixed: Returing a string instead of JSX to prevent render errors inside <h4>
    }
};

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState("0");
    const navigate = useRouter();

    const fetchNotifications = async () => {
        try {
            const response = await callGetAPIWithToken("notifications");
            const data = response?.data || [];
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => n?.IsRead === 0).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const openNotification = async (taskId: any, notificationId: any) => {
        try {
            await callAPIWithToken(`update-seen-status`, { NotificationID: notificationId });
            await fetchNotifications();
            navigate.push(`/create-manage-task?__task=${btoa(taskId)}`);
        } finally {
            setIsLoading("0");
            setOpen(false);
        }
    }

    const markAllAsRead = async () => {
        const unreadNotifications = notifications?.filter((n: Notification) => !n?.IsRead);

        for await (const notification of unreadNotifications) {
            await callAPIWithToken(`update-seen-status`, { NotificationID: notification?.NotificationID })
        }
    };

    return (
        <>
            <style>
                {`
                    @keyframes bell-ring {
                        0%, 100% { transform: rotate(0deg); }
                        10% { transform: rotate(2deg); }
                        20% { transform: rotate(-5deg); }
                        30% { transform: rotate(2deg); }
                        40% { transform: rotate(-5deg); }
                        50% { transform: rotate(0deg); }
                    }
                    .animate-bell-ring {
                        animation: bell-ring 0.7s infinite ease-in-out;
                        animation-delay: 2s;
                        transform-origin: top center;
                    }
                `}
            </style>

            <Drawer open={open} onOpenChange={setOpen} direction="right">
                <DrawerTrigger asChild>
                    <Button variant="ghost" size="icon" className={`relative ${unreadCount > 0 ? "animate-bell-ring" : ""}`}>
                        <Bell size={20} className={unreadCount > 0 ? "z-10" : ""} />
                        {unreadCount > 0 && (
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 z-[9] rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                        )}
                    </Button>
                </DrawerTrigger>

                <DrawerContent className="sm:max-w-md h-screen w-full flex flex-col rounded-t-[10px] sm:rounded-none">
                    <DrawerHeader className="text-left border-b pb-4">
                        <DrawerTitle className="text-xl">Notifications</DrawerTitle>
                        <DrawerDescription>
                            You have {unreadCount} unread message{unreadCount !== 1 && 's'}.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                        {notifications?.length === 0 ? (
                            <div className="text-center text-slate-500 mt-10 text-sm">No notifications available.</div>
                        ) : (
                            notifications.map((notification) =>
                                isLoading == notification?.NotificationID ?
                                    (<div
                                        key={notification?.NotificationID}
                                        className={`relative min-h-[200px] flex justify-center items-center cursor-progress text-left p-4 rounded-xl border transition-colors w-full bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800`}
                                    ><Loader2 size={26} className="text-indigo-600 animate-spin" /></div>) :
                                    (<button
                                        onClick={() => openNotification(notification?.EntityID, notification?.NotificationID)}
                                        key={notification?.NotificationID}
                                        className={`relative cursor-pointer text-left p-4 rounded-xl border transition-colors w-full ${notification?.IsRead !== 0
                                            ? "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                            : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50"
                                            }`}
                                    >
                                        {/* Unread Indicator */}
                                        {notification?.IsRead === 0 && (
                                            <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500" />
                                        )}

                                        {/* Header: Title & Time */}
                                        <div className="flex items-start gap-3 mb-2 pr-4">
                                            <div className="mt-0.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                                {getIcon(notification?.ActionTypeName?.toLocaleLowerCase())}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {getNotificationTitle(notification?.ActionTypeName?.toLocaleLowerCase())}
                                                </h4>
                                                {/* UTILITY APPLIED HERE */}
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {formatTimeAgo(notification?.NotificationCreatedOn)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 ml-10 leading-relaxed">
                                            {notification?.EntityDesc}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="ml-10 flex flex-col gap-2">
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Badge variant="secondary" className={`border-transparent ${getPriorityColor(notification?.Priority)}`}>
                                                    {notification?.Priority || "Normal"} Priority
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    <Folder className="h-3 w-3" />
                                                    <span className="truncate max-w-[120px]">{notification?.ProjectName || "Not Mentioned"}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    <Calendar className="h-3 w-3" />
                                                    {/* UTILITY APPLIED HERE */}
                                                    <span>{formatDeadline(notification?.EntityDeadline)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                <User className="h-3.5 w-3.5" />
                                                <span>By: <span className="font-medium text-slate-700 dark:text-slate-300">{notification?.InitiatedBy}</span></span>
                                            </div>
                                        </div>
                                    </button>)
                            )
                        )}
                    </div>

                    <DrawerFooter className="border-t pt-4 bg-white dark:bg-slate-950">
                        <div className="flex gap-4 justify-center items-center">
                            <Button
                                variant="outline"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="cursor-pointer bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                            >
                                Mark all as read
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="secondary" className="cursor-pointer">Close</Button>
                            </DrawerClose>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default Notifications;