"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Mail, Phone, Github, Key,
    Camera, User, ShieldCheck, Link as LinkIcon,
    BadgeCheckIcon, Save, X, Eye, EyeOff, Loader2, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { callAPIWithToken, callGetAPIWithToken } from "@/components/apis/commonAPIs";

export default function UserCreationPage() {
    // Local state for form data
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        roleId: '',
        fullName: '',
        email: '',
        contactNumber: '',
        gitUsername: '',
        gitPublicKey: '',
    });

    const [profileImg, setProfileImg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [roles, setRoles] = useState<{ urm_id: number; urm_name: string }[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Roles from Master Table
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await callGetAPIWithToken('master/roles'); // Adjust endpoint as per your API
                if (response?.success) {
                    setRoles(response.data);
                } else {
                    // Fallback default roles if API fails
                    setRoles([
                        { urm_id: 1, urm_name: 'Admin' },
                        { urm_id: 2, urm_name: 'Team Lead' },
                        { urm_id: 3, urm_name: 'Developer' }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch roles");
            }
        };
        fetchRoles();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImg(reader.result as string);
            reader.readAsDataURL(file);
            toast.info("Avatar uploaded successfully");
        }
    };

    const validateForm = () => {
        if (!formData.username) return "Username is required";
        if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters";
        if (!formData.fullName) return "Full Name is required";
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) return "Valid email is required";
        if (!formData.roleId) return "Please select a user role";
        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                roleId: Number(formData.roleId),
                email: formData.email,
                fullName: formData.fullName,
                contactNumber: formData.contactNumber,
                profileImage: profileImg, // Base64 string
                gitUsername: formData.gitUsername,
                gitPublicKey: formData.gitPublicKey,
            };

            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok || result.success) {
                toast.success("User created successfully!");
                // Reset form
                setFormData({
                    username: '', password: '', roleId: '', fullName: '',
                    email: '', contactNumber: '', gitUsername: '', gitPublicKey: ''
                });
                setProfileImg(null);
            } else {
                toast.error(result.message || "Registration failed");
            }
        } catch (error) {
            toast.error("An error occurred connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">

            {/* 1. Header / Hero Section */}
            <div className="relative h-64 rounded-[3rem] bg-indigo-600 overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-violet-700 opacity-50" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

                <div className="absolute bottom-10 left-12 flex items-end gap-6 group">
                    {/* New User Avatar Placeholder */}
                    <div className="relative h-40 w-40 rounded-[2.5rem] border-[6px] border-white bg-slate-100 overflow-hidden shadow-xl transition-transform hover:scale-[1.02]">
                        {profileImg ? (
                            <img src={profileImg} className="h-full w-full object-cover" alt="Profile" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                <User size={48} strokeWidth={2.5} />
                            </div>
                        )}
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={28} />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </div>

                    <div className="pb-6">
                        <h2 className="text-5xl font-bold text-white tracking-tight">Add New Resource</h2>
                        <p className="text-indigo-200 text-xl font-medium">Create a fresh system profile</p>
                    </div>
                </div>
            </div>

            <div className="pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Credentials & Personal */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <UserPlus className="text-indigo-600" size={20} /> Access Credentials
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username *</Label>
                                <Input 
                                    placeholder="john_doe" 
                                    className="h-12 rounded-2xl" 
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2 relative">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password *</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        className="h-12 rounded-2xl pr-12" 
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                    >
                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Allocation *</Label>
                                <select 
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.roleId}
                                    onChange={e => setFormData({...formData, roleId: e.target.value})}
                                >
                                    <option value="">Select a System Role</option>
                                    {roles.map(role => (
                                        <option key={role.urm_id} value={role.urm_id}>{role.urm_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Mail className="text-indigo-600" size={20} /> Identity Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name *</Label>
                                <Input 
                                    placeholder="John Doe" 
                                    className="h-12 rounded-2xl" 
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email *</Label>
                                <Input 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    className="h-12 rounded-2xl" 
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        className="h-12 rounded-2xl pl-12" 
                                        placeholder="8876543210"
                                        value={formData.contactNumber}
                                        onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Social Sync & Actions */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Github className="text-indigo-600" size={20} /> Developer Sync
                        </h3>
                        <div className="space-y-4">
                            <div className="relative group">
                                <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600" />
                                <Input
                                    placeholder="GitHub Username"
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none"
                                    value={formData.gitUsername}
                                    onChange={e => setFormData({...formData, gitUsername: e.target.value})}
                                />
                            </div>
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600" />
                                <Input
                                    placeholder="Git SSH Public Key"
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-none"
                                    value={formData.gitPublicKey}
                                    onChange={e => setFormData({...formData, gitPublicKey: e.target.value})}
                                />
                            </div>
                        </div>
                        <p className="mt-4 text-[10px] font-medium text-slate-400 italic">Optional: Sync for Git-level permissions</p>
                    </section>

                    <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Security Check</p>
                                <h4 className="text-xl font-black mt-1">Creation Protocol</h4>
                            </div>
                            <ShieldCheck size={40} className="text-indigo-500 opacity-50" />
                        </div>
                        <p className="relative z-10 mt-6 text-xs text-slate-400 leading-relaxed font-medium">
                            By clicking Register, you are provisioning a new <span className="text-emerald-400 font-bold">Authorized Account</span> within the Work-Flux domain.
                        </p>
                        <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-indigo-600/20 rounded-full blur-3xl" />
                    </div>

                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            <UserPlus className="mr-3" size={18} />
                        )}
                        Provision User Account
                    </Button>
                </div>
            </div>
        </div>
    );
}