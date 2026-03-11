"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Github, Globe,
    Camera, Plus, X, Save, Briefcase,
    Code2, ShieldCheck, MapPin, Link as LinkIcon,
    BadgeCheckIcon, Check, ChevronDown, Search
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getCookie, setCookie } from '@/utils/cookies';
import { callPutAPIWithToken, callGetAPIWithToken } from "@/components/apis/commonAPIs";
import { useStore } from '@/store/useStore';

export default function ProfileSettings() {
    const { currentUser, setCurrentUser } = useStore();

    // Local state for profile data
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        gitUsername: '',
        gitPublicKey: '',
        bio: 'Senior Software Architect specializing in distributed systems and cloud infrastructure.',
        location: 'San Francisco, CA',
    });

    const [designations, setDesignations] = useState<{ id: number; name: string }[]>([]);
    const [allDesignations, setAllDesignations] = useState<{ id: number; name: string }[]>([]);
    const [isDesignationDropdownOpen, setIsDesignationDropdownOpen] = useState(false);
    const designationDropdownRef = useRef<HTMLDivElement>(null);

    const [techStack, setTechStack] = useState<string[]>(['Next.js', 'Go', 'Rust', 'Kubernetes']);
    const [profileImg, setProfileImg] = useState<string | null>(null);

    const [newTag, setNewTag] = useState({ designation: '', tech: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial load handled by useStore hydration, but we sync local form
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                fullName: currentUser.name || currentUser.FullName || '',
                email: currentUser.email || currentUser.username || '',
                contactNumber: currentUser.contact_no || '',
                gitUsername: currentUser.git_username || '',
                gitPublicKey: currentUser.git_public_key || '',
            }));
            if (currentUser.profile_image) {
                setProfileImg(currentUser.profile_image);
            }
        }
    }, [currentUser]);

    // Fetch designations
    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                const response = await callGetAPIWithToken('designations');
                if (response?.success) {
                    setAllDesignations(response.data.map((d: any) => ({
                        id: d.DesignationID,
                        name: d.DesignationName.trim()
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch designations:", error);
            }
        };

        fetchDesignations();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (designationDropdownRef.current && !designationDropdownRef.current.contains(event.target as Node)) {
                setIsDesignationDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Handlers ---
    const handleSave = async () => {
        try {
            const payload = {
                email: formData.email,
                fullName: formData.fullName,
                contactNumber: formData.contactNumber,
                profilePicture: profileImg, // base64 string
                gitUsername: formData.gitUsername,
                gitPublicKey: formData.gitPublicKey,
                designations: designations.map(d => d.id),
            };

            const response = await callPutAPIWithToken('users/profile', payload);

            if (response?.success) {
                toast.success("Profile updated successfully");
                // Update store and cookie with new info
                if (currentUser) {
                    const updatedUser = {
                        ...currentUser,
                        name: formData.fullName,
                        contact_no: formData.contactNumber,
                        profile_image: profileImg || currentUser.profile_image,
                        git_username: formData.gitUsername,
                        git_public_key: formData.gitPublicKey
                    };
                    setCurrentUser(updatedUser);
                    setCookie("user", updatedUser);
                }
            } else {
                toast.error(response?.message || "Update failed");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred while saving");
        }
    };

    const toggleDesignation = (designation: { id: number; name: string }) => {
        if (designations.some(d => d.id === designation.id)) {
            setDesignations(designations.filter(d => d.id !== designation.id));
        } else {
            setDesignations([...designations, designation]);
        }
    };

    const addTech = () => {
        if (newTag.tech && !techStack.includes(newTag.tech)) {
            setTechStack([...techStack, newTag.tech]);
            setNewTag({ ...newTag, tech: '' });
        }
    };

    const removeTag = (list: any[], setList: Function, tag: any) => {
        if (typeof tag === 'string') {
            setList(list.filter(t => t !== tag));
        } else {
            setList(list.filter(t => t.id !== tag.id));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImg(reader.result as string);
            reader.readAsDataURL(file);
            toast.info("Profile picture updated");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">

            {/* 1. Profile Header / Hero */}
            <div className="relative h-64 rounded-[3rem] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-violet-700 opacity-50" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

                {/* Avatar Upload */}
                <div className="absolute bottom-10 left-12 flex items-end gap-6 group">

                    {/* Profile Image */}
                    <div className="relative h-40 w-40 rounded-[2.5rem] border-[6px] border-white bg-slate-100 dark:bg-slate-800 dark:border-slate-950 overflow-hidden shadow-xl transition-transform group-hover:scale-[1.02]">
                        {profileImg ? (
                            <img src={profileImg} className="h-full w-full object-cover" alt="Profile" />
                        ) :
                            currentUser?.avatar || currentUser?.profile_image ? (
                                <img src={currentUser?.avatar || currentUser?.profile_image} className="h-full w-full object-cover" alt="Profile" />
                            ) :
                                (
                                    <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-black text-4xl">
                                        {currentUser?.name?.charAt(0) || currentUser?.username?.charAt(0) || "U"}
                                    </div>
                                )}

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="text-white" size={28} />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                            accept="image/*"
                        />
                    </div>

                    {/* Name + Role Section */}
                    <div className="pb-6">
                        <h2 className="text-5xl font-bold text-indigo-100 dark:text-white">
                            {formData.fullName || currentUser?.name || "User Name"}
                        </h2>
                        <p className="text-slate-400 text-2xl dark:text-slate-400">
                            {currentUser?.role || "Developer"}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                            <BadgeCheckIcon className="animate-pulse text-emerald-600 rounded-full bg-emerald-50 font-bold" size={18} />
                            <span className="text-sm font-medium text-slate-400 dark:text-slate-400">
                                Verified Member
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Basic Info */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <User className="text-indigo-600" size={20} /> Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                <Input value={formData.fullName} className="h-12 rounded-2xl" onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</Label>
                                <Input value={formData.contactNumber} className="h-12 rounded-2xl" onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                                <Input value={formData.email} className="h-12 rounded-2xl" type="email" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">About Me (Bio)</Label>
                                <textarea
                                    className="w-full min-h-[120px] rounded-3xl border border-slate-200 bg-white p-4 text-sm focus:border-indigo-600 outline-none dark:bg-slate-950 dark:border-slate-800"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* GitHub & Social */}
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Globe className="text-indigo-600" size={20} /> GitHub & Location
                        </h3>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600" />
                                <Input
                                    placeholder="GitHub Username"
                                    value={formData.gitUsername}
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800"
                                    onChange={e => setFormData({ ...formData, gitUsername: e.target.value })}
                                />
                            </div>
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600" />
                                <Input
                                    placeholder="Git Public Key (SSH)"
                                    value={formData.gitPublicKey}
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800"
                                    onChange={e => setFormData({ ...formData, gitPublicKey: e.target.value })}
                                />
                            </div>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600" />
                                <Input
                                    placeholder="Location"
                                    value={formData.location}
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none dark:bg-slate-800"
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Skills & Roles */}
                <div className="lg:col-span-5 space-y-8">

                    {/* Designations Section */}
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                            <Briefcase className="text-indigo-600" size={20} /> Designations
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <AnimatePresence>
                                {designations.map(tag => (
                                    <motion.span
                                        key={tag.id}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    >
                                        {tag.name}
                                        <X size={14} className="cursor-pointer hover:text-rose-500" onClick={() => setDesignations(designations.filter(t => t.id !== tag.id))} />
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="relative" ref={designationDropdownRef}>
                            <div
                                onClick={() => setIsDesignationDropdownOpen(!isDesignationDropdownOpen)}
                                className={cn(
                                    "flex items-center justify-between w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white cursor-pointer hover:border-indigo-400 transition-all dark:bg-slate-950 dark:border-slate-800",
                                    isDesignationDropdownOpen && "border-indigo-600 ring-4 ring-indigo-500/10"
                                )}
                            >
                                <span className="text-sm text-slate-500 font-medium">
                                    {designations.length > 0 ? `${designations.length} Selected` : "Select Designations..."}
                                </span>
                                <ChevronDown size={18} className={cn("text-slate-400 transition-transform", isDesignationDropdownOpen && "rotate-180")} />
                            </div>

                            <AnimatePresence>
                                {isDesignationDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute z-[100] w-full mt-2 rounded-[2rem] border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl p-4 dark:border-slate-800 dark:bg-slate-900/90 overflow-hidden"
                                    >
                                        <div className="max-h-60 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-indigo-500">
                                            {allDesignations.map((d) => {
                                                const isSelected = designations.some(selected => selected.id === d.id);
                                                return (
                                                    <div
                                                        key={d.id}
                                                        onClick={() => toggleDesignation(d)}
                                                        className={cn(
                                                            "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors group",
                                                            isSelected ? "bg-indigo-600 text-white" : "hover:bg-indigo-50 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300"
                                                        )}
                                                    >
                                                        <span className="text-xs font-black uppercase tracking-wider">{d.name}</span>
                                                        {isSelected && <Check size={16} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* Verification Status */}
                    <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Account Status</p>
                                <h4 className="text-xl font-black mt-1">Lead Verified</h4>
                            </div>
                            <ShieldCheck size={40} className="text-indigo-500 opacity-50" />
                        </div>
                        <p className="relative z-10 mt-6 text-xs text-slate-400 leading-relaxed font-medium">
                            Your profile is verified within the Work-Flux network. You have <span className="text-emerald-400 font-bold uppercase">Authorized</span> access.
                        </p>
                        <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-indigo-600/20 rounded-full blur-3xl" />
                    </div>

                    <Button onClick={handleSave} className="w-full h-14 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20">
                        <Save className="mr-3" size={18} /> Save Profile
                    </Button>

                </div>
            </div>
        </div>
    );
}