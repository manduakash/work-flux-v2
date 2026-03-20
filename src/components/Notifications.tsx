"use client";

import React, { useState } from "react";
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Clock,
    Folder,
    Calendar,
    XCircle,
    User,
    BellRing
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
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- MOCK DATA ---
const initialNotifications = [
    {
        id: 1,
        title: "New Task Assigned",
        description: "You have been assigned to develop the checkout payment gateway integration.",
        time: "10 mins ago",
        seen: false,
        notificationBy: "Sarah Jenkins (Team Lead)",
        priority: "High",
        projectName: "E-Commerce App",
        taskDeadline: "Oct 25, 2023",
        type: "assigned"
    },
    {
        id: 2,
        title: "Task Rejected",
        description: "Your team lead rejected your task. 'Please fix the failing unit tests on the user auth module.'",
        time: "1 hour ago",
        seen: false,
        notificationBy: "Sarah Jenkins (Team Lead)",
        priority: "High",
        projectName: "Auth Portal",
        taskDeadline: "Oct 20, 2023",
        type: "rejected"
    },
    {
        id: 3,
        title: "Task Completed",
        description: "Akash completed the task 'UI fixes for Dashboard'. Ready for code review.",
        time: "3 hours ago",
        seen: true,
        notificationBy: "Akash Kumar (Developer)",
        priority: "Low",
        projectName: "Admin Dashboard",
        taskDeadline: "Oct 22, 2023",
        type: "completed"
    },
    {
        id: 4,
        title: "Deadline Approaching",
        description: "Reminder: The deadline for 'Database Migration' is tomorrow.",
        time: "1 day ago",
        seen: true,
        notificationBy: "System",
        priority: "Medium",
        projectName: "Backend Overhaul",
        taskDeadline: "Oct 19, 2023",
        type: "warning"
    }
];

// Helper to get priority badge color
const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
        case "high": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
        case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "low": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
};

// Helper to get icon based on notification type
const getIcon = (type: string) => {
    switch (type) {
        case "assigned": return <Clock className="h-4 w-4 text-blue-500" />;
        case "rejected": return <XCircle className="h-4 w-4 text-rose-500" />;
        case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        case "warning": return <AlertCircle className="h-4 w-4 text-amber-500" />;
        default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
};


const Notifications = () => {

    const [notifications, setNotifications] = useState(initialNotifications);

    const unreadCount = notifications.filter((n) => !n.seen).length;

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, seen: true })));
    };
    return (
        <>
            <style>
                {`
                    @keyframes bell-ring {
                        0%, 100% { transform: rotate(0deg); }
                        10% { transform: rotate(5deg); }
                        20% { transform: rotate(-10deg); }
                        30% { transform: rotate(5deg); }
                        40% { transform: rotate(-0deg); }
                        50% { transform: rotate(10deg); }
                    }
                    .animate-bell-ring {
                        animation: bell-ring 1s infinite ease-in-out;
                        transform-origin: top center;
                    }
                `}
            </style>

            <Drawer direction="right">
                <DrawerTrigger asChild>
                    <Button variant="ghost" size="icon" className={`relative ${unreadCount && "animate-bell-ring"}`}>
                        {unreadCount ? <BellRing size={20} className="z-10" /> : <Bell size={20} />}
                        {unreadCount && (
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 z-9 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
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
                        {notifications.map((notification) => (
                            <button
                                key={notification.id}
                                className={`relative text-left p-4 rounded-xl border transition-colors ${notification.seen
                                    ? "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                                    : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50"
                                    }`}
                            >
                                {/* Unread Indicator */}
                                {!notification.seen && (
                                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500" />
                                )}

                                {/* Header: Title & Time */}
                                <div className="flex items-start gap-3 mb-2 pr-4">
                                    <div className="mt-0.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{notification.time}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 ml-10 leading-relaxed">
                                    {notification.description}
                                </p>

                                {/* Meta Info (Project, Deadline, Priority, By) */}
                                <div className="ml-10 flex flex-col gap-2">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <Badge variant="secondary" className={`border-transparent ${getPriorityColor(notification.priority)}`}>
                                            {notification.priority} Priority
                                        </Badge>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                            <Folder className="h-3 w-3" />
                                            <span className="truncate max-w-[120px]">{notification.projectName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                            <Calendar className="h-3 w-3" />
                                            <span>{notification.taskDeadline}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                        <User className="h-3.5 w-3.5" />
                                        <span>By: <span className="font-medium text-slate-700 dark:text-slate-300">{notification.notificationBy}</span></span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <DrawerFooter className="border-t pt-4 bg-white dark:bg-slate-950">
                        <div className="flex gap-4 justify-center items-center">
                            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0} className="cursor-pointer bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white">
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
    )
}

export default Notifications