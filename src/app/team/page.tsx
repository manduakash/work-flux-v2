"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { callAPIWithToken, callGetAPIWithToken, callDeleteAPIWithToken } from '@/components/apis/commonAPIs';
import { User, UserRole } from '@/types';
import {
    Users, Mail, Phone, Shield, MoreHorizontal, Plus,
    X, Trash2, PenSquare, UserPlus, ShieldCheck,
    Briefcase, ExternalLink, Search, AtSign,
    Lock, Github, Key, Camera, Loader2, Eye, EyeOff,
    User as UserIcon, AlertCircle, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { form } from 'framer-motion/client';

const getRoleStyle = (role: string) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('admin') || r.includes('management')) return "bg-rose-50 text-rose-600 border-rose-100";
    if (r.includes('lead')) return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-indigo-50 text-indigo-600 border-indigo-100";
};

export default function TeamPage() {
    const { users, currentUser, deleteUser } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [removalReason, setRemovalReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        roleId: 3,
        contactNumber: '',
        email: '',
        fullName: '',
        profileImage: '',
        gitUsername: '',
        gitPublicKey: ''
    });

    const [roles, setRoles] = useState<{ urm_id: number; urm_name: string }[]>([]);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);

    const fetchTeamProfiles = async () => {
        try {
            const response = await callGetAPIWithToken("users/profile-details");
            if (response.success && Array.isArray(response.data)) {
                const mappedUsers: User[] = response.data.map((u: any) => ({
                    id: u.UserID.toString(),
                    username: u.Username,
                    name: u.UserFullName || u.Username,
                    role: u.RoleName as UserRole,
                    role_id: u.RoleID,
                    email: u.UserEmail,
                    contact_no: u.ContactNumber,
                    profile_image: u.ProfilePicture,
                    git_username: u.GitUsername,
                    git_public_key: u.GitPublicKey
                }));
                setTeamMembers(mappedUsers);
            }
        } catch (error: any) {
            console.error("Error fetching team profiles:", error);
            toast.error("Failed to load team members");
        }
    };

    useEffect(() => {
        fetchTeamProfiles();
    }, []);


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, profileImage: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Provisioning new account...');

        try {
            const response = await callAPIWithToken("auth/register", formData);

            if (response.ok || response.success) {
                toast.success('Member registered successfully', { id: toastId });
                setIsModalOpen(false);
                setFormData({
                    username: '', password: '', roleId: 3, contactNumber: '',
                    email: '', fullName: '', profileImage: '', gitUsername: '', gitPublicKey: ''
                });
                fetchTeamProfiles();
            } else {
                toast.error(response.message || 'Registration failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            console.log("Registration Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveUser = async () => {
        if (!userToDelete || !removalReason) return;

        setIsDeleting(true);
        const toastId = toast.loading('Revoking system access...');

        try {
            const response = await callDeleteAPIWithToken("users/remove-user", {
                userId: parseInt(userToDelete.id),
                removalReason: removalReason
            });

            if (response.success) {
                toast.success('Member access revoked successfully', { id: toastId });
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
                setRemovalReason('');
                fetchTeamProfiles();
            } else {
                toast.error(response.message || 'Removal failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            console.log("Removal Error:", error);
        } finally {
            setIsDeleting(false);
        }
    };
    const filteredUsers = teamMembers.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-12">

            <style jsx global>{`
                .modal-scrollbar::-webkit-scrollbar { width: 6px; }
                .modal-scrollbar::-webkit-scrollbar-track { background: transparent; margin-block: 20px; }
                .modal-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .modal-scrollbar:hover::-webkit-scrollbar-thumb { background: #6366f1; }
            `}</style>

            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Team Members</h1>
                    <p className="text-slate-500 font-medium">Manage team members and developers</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Filter by name or role..."
                            className="pl-11 h-12 w-80 bg-white rounded-2xl border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="h-12 rounded-2xl bg-indigo-600 px-8 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-transform">
                        <UserPlus className="mr-2 h-4 w-4 stroke-[3px]" />
                        Add Member
                    </Button>
                </div>
            </div>

            {/* Team Grid */}
            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-20 w-20 rounded-[1.5rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shadow-inner">
                                        {user.profile_image ? (
                                            <img src={user.profile_image} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-black text-indigo-600">{user.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="text-xl font-bold text-slate-900 truncate">{user.name}</h3>
                                        <span className={cn("inline-block mt-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border", getRoleStyle(user.role))}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-10 space-y-4">
                                    <div className="flex items-center text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-indigo-50 transition-colors">
                                            <Mail size={14} />
                                        </div>
                                        {user.email || `${user.username}@work-flux.io`}
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-slate-500">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3">
                                            <Github size={14} />
                                        </div>
                                        {user.git_username || 'Not Synced'}
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4 border-t border-slate-50 pt-8">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedUser(user)}
                                        className="flex-1 h-12 rounded-2xl text-[10px] text-purple-500 font-extrabold uppercase tracking-widest border-purple-600/30 bg-purple-50 hover:bg-purple-600 hover:text-white cursor-pointer"
                                    >
                                        Profile Info
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-12 w-12 cursor-pointer p-0 rounded-2xl text-rose-500 border-slate-100 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all"
                                        onClick={() => {
                                            setUserToDelete(user);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                        <AlertCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black uppercase text-slate-400">No Members Found</h3>
                    <p className="text-slate-400 text-sm mt-1">Try refining your search parameters.</p>
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

                        <motion.div
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 30, opacity: 0 }}
                            className="relative w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-white"
                        >

                            <div className="p-10 pb-6 flex items-center justify-between border-b border-slate-50 bg-white/50 backdrop-blur-sm z-20">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Add Team Member</h2>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Provisioning Secure System Access</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-2xl h-12 w-12 hover:bg-slate-100"><X /></Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 pt-8 modal-scrollbar pr-6" style={{ scrollbarGutter: 'stable' }}>
                                <form id="registerForm" onSubmit={handleSubmit} className="space-y-10">

                                    <div className="flex items-center gap-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                        <div className="h-28 w-28 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-sm">
                                            {formData.profileImage ? (
                                                <img src={formData.profileImage} className="h-full w-full object-cover" />
                                            ) : (
                                                <Camera className="text-slate-300" size={32} />
                                            )}
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                                                <Plus className="text-white" size={32} />
                                            </button>
                                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Identify Profile</h4>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Recommended: 400x400px JPG/PNG</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username (Login ID) *</Label>
                                            <Input required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 px-5 font-bold focus:bg-white" placeholder="john_arch" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Password *</Label>
                                            <div className="relative">
                                                <Input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 px-5 font-bold pr-12" placeholder="••••••••" />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Full Name *</Label>
                                            <Input required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 px-5 font-bold" placeholder="Johnathan Doe" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2 col-span-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email *</Label>
                                                <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 px-5 font-bold" placeholder="john@work-flux.io" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                                            <Github size={14} /> Additional Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input value={formData.gitUsername} onChange={e => setFormData({ ...formData, gitUsername: e.target.value })} className="h-12 rounded-xl border-indigo-100/50 bg-white" placeholder="GitHub Handle" />
                                            <Input value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} className="h-12 rounded-xl border-indigo-100/50 bg-white" placeholder="Contact (+91...)" />
                                            <Input value={formData.gitPublicKey} onChange={e => setFormData({ ...formData, gitPublicKey: e.target.value })} className="col-span-2 h-12 rounded-xl border-indigo-100/50 bg-white" placeholder="Git SSH Public Key (RSA/ED25519)" />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-10 pt-6 border-t border-slate-50 flex gap-4 bg-white z-20">
                                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-[1.5rem] h-14 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50">Cancel</Button>
                                <Button form="registerForm" disabled={isLoading} type="submit" className="flex-[2] rounded-[1.5rem] h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all">
                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-3" size={18} />}
                                    Add Member
                                </Button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Profile Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

                        <motion.div
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 30, opacity: 0 }}
                            className="relative w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-white"
                        >
                            <div className="p-10 pb-6 flex items-center justify-between border-b border-slate-50">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Profile Intelligence</h2>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Verified System Identity</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} className="rounded-2xl h-12 w-12 hover:bg-slate-100"><X /></Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 pt-8 modal-scrollbar pr-6">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                        <div className="h-24 w-24 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shadow-inner">
                                            {selectedUser.profile_image ? (
                                                <img src={selectedUser.profile_image} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-black text-indigo-600">{selectedUser.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedUser.name}</h3>
                                            <span className={cn("inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", getRoleStyle(selectedUser.role))}>
                                                {selectedUser.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Username</p>
                                            <p className="font-bold text-slate-700">{selectedUser.username}</p>
                                        </div>
                                        <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Work Email</p>
                                            <p className="font-bold text-slate-700 flex items-center gap-2">
                                                <Mail size={14} className="text-indigo-500" />
                                                {selectedUser.email || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                                            <p className="font-bold text-slate-700 flex items-center gap-2">
                                                <Phone size={14} className="text-indigo-500" />
                                                {selectedUser.contact_no || 'Not Provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50/30 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                                            <Github size={14} /> Developer Environment
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">GitHub Handle</p>
                                                <p className="font-bold text-slate-700 uppercase">{selectedUser.git_username || 'unlinked'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">SSH Public Key</p>
                                                <div className="bg-white p-3 rounded-xl border border-indigo-50 overflow-hidden">
                                                    <p className="text-[10px] font-mono text-slate-500 break-all line-clamp-2">
                                                        {selectedUser.git_public_key || 'No key provisioned'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 pt-6 border-t border-slate-50 bg-white">
                                <Button
                                    onClick={() => setSelectedUser(null)}
                                    className="w-full rounded-[1.5rem] h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    Dismiss Profile
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* User Removal Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeleting && setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />

                        <motion.div
                            initial={{ scale: 0.95, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 30, opacity: 0 }}
                            className="relative w-full max-w-lg flex flex-col overflow-hidden rounded-[3rem] bg-white shadow-2xl border border-white"
                        >
                            <div className="p-10 pb-6 text-center">
                                <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
                                    <ShieldAlert size={40} />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">Remove User?</h2>
                                <p className="text-sm font-medium text-slate-500 mt-2 italic px-8">
                                    Are you absolutely sure you want to remove <span className="text-rose-600 font-bold">{userToDelete?.name}</span>? This action is permanent.
                                </p>
                            </div>

                            <div className="px-10 pb-10 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for removal *</Label>
                                    <textarea
                                        required
                                        value={removalReason}
                                        onChange={(e) => setRemovalReason(e.target.value)}
                                        className="w-full min-h-[120px] rounded-2xl bg-slate-50 border border-slate-100 p-5 font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all focus:outline-none resize-none"
                                        placeholder="e.g. Project completion, misaligned technical priorities, or contract termination..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <Button
                                        variant="ghost"
                                        disabled={isDeleting}
                                        onClick={() => {
                                            setIsDeleteModalOpen(false);
                                            setRemovalReason('');
                                        }}
                                        className="flex-1 rounded-2xl h-14 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={isDeleting || !removalReason.trim()}
                                        onClick={handleRemoveUser}
                                        className="flex-[2] rounded-2xl h-14 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-rose-600/20 active:scale-95 transition-all"
                                    >
                                        {isDeleting ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-3" size={18} />}
                                        Remove User
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