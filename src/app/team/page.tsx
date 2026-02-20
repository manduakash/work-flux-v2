"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Mail, Phone, Shield, MoreHorizontal, Plus,
    X, Trash2, PenSquare, UserPlus, ShieldCheck,
    Briefcase, ExternalLink, Search,
    AtSign
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from '@/store/useStore';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Helper to get professional role styles
const getRoleStyle = (role: UserRole) => {
    switch (role) {
        case UserRole.MANAGEMENT:
            return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";
        case UserRole.TEAM_LEAD:
            return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
        default:
            return "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50";
    }
};

export default function TeamPage() {
    const { users, currentUser, addUser, deleteUser } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        role: UserRole.DEVELOPER,
    });

    const canManage = currentUser?.role === UserRole.MANAGEMENT;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addUser(formData);
        setIsModalOpen(false);
        toast.success('Resource successfully onboarded');
        setFormData({ name: '', username: '', role: UserRole.DEVELOPER });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">

            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Team Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage organizational structure and access control permissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Filter by name or role..."
                            className="pl-10 h-11 w-64 bg-white dark:bg-slate-900 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {canManage && (
                        <Button onClick={() => setIsModalOpen(true)} className="h-11 rounded-xl bg-indigo-600 px-6 font-bold shadow-lg shadow-indigo-600/20">
                            <UserPlus className="mr-2 h-4 w-4 stroke-[3px]" />
                            Add Member
                        </Button>
                    )}
                </div>
            </div>

            {/* Team Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user) => (
                        <motion.div
                            key={user.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900"
                        >
                            {/* Card Header */}
                            <div className="flex flex-col gap-2 items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{user.name}</h3>
                                        <div className={cn(
                                            "w-auto rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
                                            getRoleStyle(user.role)
                                        )}>
                                            {user.role.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Contact Details */}
                            <div className="mt-8 space-y-3.5">
                                <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400">
                                        <Mail size={14} />
                                    </div>
                                    {user.username}@nexintel.com
                                </div>
                                <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400">
                                        <Phone size={14} />
                                    </div>
                                    +1 (555) 000-0000
                                </div>
                                <div className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400">
                                        <AtSign size={14} />
                                    </div>
                                    {user.username}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-8 flex gap-3 border-t border-slate-50 pt-6 dark:border-slate-800">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-10 rounded-xl text-[11px] font-bold uppercase tracking-widest gap-2"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <PenSquare size={14} /> Edit
                                </Button>
                                {canManage && user.id !== currentUser?.id && (
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-10 rounded-xl text-[11px] font-bold uppercase tracking-widest gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                                        onClick={() => {
                                            if (window.confirm('Revoke access for this user?')) {
                                                deleteUser(user.id);
                                                toast.error('User access revoked');
                                            }
                                        }}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Professional Add User Modal */}
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
                            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-2xl dark:bg-slate-900"
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Add Resource</h2>
                                    <p className="text-xs font-semibold text-slate-400 mt-1">Populate organizational directory.</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                                    <X />
                                </Button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Full Name</label>
                                    <Input
                                        required
                                        className="h-12 rounded-2xl"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Johnathan Doe"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Identifier (Username)</label>
                                    <Input
                                        required
                                        className="h-12 rounded-2xl"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="jdoe_admin"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Functional Role</label>
                                    <select
                                        className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    >
                                        {Object.values(UserRole).map(role => (
                                            <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="font-bold text-xs uppercase tracking-widest">Cancel</Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-2xl font-black text-xs uppercase tracking-widest h-12">
                                        Deploy Resource
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