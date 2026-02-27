"use client";

import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Flag,
  Layout,
  Smartphone,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { callAPIWithToken, callGetAPIWithToken } from '@/components/apis/commonAPIs';

const ProjectCreation = () => {
  const addProject = useStore((state) => state.addProject);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: '',
    progress: 0,
    status: '',
    priority: '',
    type: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [projectStatusData, setProjectStatusData] = useState<any[]>([]);
  const [projectPriorityData, setProjectPriorityData] = useState<any[]>([]);
  const [projectTypesData, setProjectTypesData] = useState<any[]>([]);

  useEffect(() => {
    fetchProjectStatus();
    fetchProjectPriority();
    fetchProjectTypes();
  }, []);

  const fetchProjectStatus = async () => {
    try {
      const result = await callGetAPIWithToken("master/project-status");
      if (result.success) setProjectStatusData(result.data);
    } catch (error) {
      console.error('Error fetching project status:', error);
    }
  };

  const fetchProjectPriority = async () => {
    try {
      const result = await callGetAPIWithToken("master/priority");
      if (result.success) setProjectPriorityData(result.data);
    } catch (error) {
      console.error('Error fetching project priority:', error);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const result = await callGetAPIWithToken("master/project-type");
      if (result.success) setProjectTypesData(result.data);
    } catch (error) {
      console.error('Error fetching project types:', error);
    }
  };

  const selectedStatus = projectStatusData.find(
    (s: any) => String(s.ProjectStatusID) === formData.status
  );

  const selectedPriority = projectPriorityData.find(
    (p: any) => String(p.PriorityID) === formData.priority
  );

  const selectedType = projectTypesData.find(
    (t: any) => String(t.ProjectTypeID) === formData.type
  );

  // Style mapping based on your image
  const statusStyles = {
    Planning: "bg-blue-50 text-blue-600 border-blue-200",
    Active: "bg-orange-50 text-orange-600 border-orange-200",
    Testing: "bg-indigo-50 text-indigo-600 border-indigo-200",
    Deployed: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Maintenance: "bg-cyan-50 text-cyan-600 border-cyan-200",
    "On hold": "bg-gray-100 text-gray-600 border-gray-200",
  };

  const priorityStyles = {
    Low: "text-slate-400",
    Medium: "text-blue-600",
    High: "text-orange-600",
    Critical: "text-red-600",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Improved Validation
    if (!formData.name || !formData.type || !formData.priority || !formData.status) {
      toast.error('Missing Required Fields', {
        description: 'Please ensure Project Name, Type, Priority, and Status are filled.'
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating project...');

    try {
      const payload = {
        ProjectID: 0,
        ProjectName: formData.name,
        ProjectDescription: formData.description,
        ProjectType: Number(formData.type),
        ProjectPriority: Number(formData.priority),
        ProjectStatus: Number(formData.status),
        ProjectDeadline: formData.deadline,
        ProgressPercentage: Number(formData.progress),
      };

      const result = await callAPIWithToken('projects', payload);

      if (result.success) {
        toast.success('Project Created', {
          id: toastId,
          description: `${formData.name} has been successfully initialized.`,
        });

        // Sync with Zustand Store for immediate local update
        addProject({
          name: formData.name,
          description: formData.description,
          status: (selectedStatus?.ProjectStatusName || 'Planning') as any,
          priority: (selectedPriority?.PriorityName || 'Medium') as any,
          deadline: formData.deadline,
          progressPercentage: Number(formData.progress),
          startDate: new Date().toISOString(),
          assignedLeadId: '',
          assignedDeveloperIds: [],
        } as any);

        // Reset form
        setFormData({
          name: '',
          description: '',
          deadline: '',
          progress: 0,
          status: '',
          priority: '',
          type: ''
        });

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/team-lead-dashboard');
        }, 1500);

      } else {
        throw new Error(result.error?.message || 'Failed to save project');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Submission Failed', {
        id: toastId,
        description: error.message || 'Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create New Project</h1>
          <p className="text-slate-500">Enter project details to update your dashboard grid.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* FORM SECTION */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Cloud Migration"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="What is this project about?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select name="status" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none">
                    <option value="">Select Status</option>

                    {projectStatusData.map((status) => (
                      <option
                        key={status.ProjectStatusID}
                        value={status.ProjectStatusID}
                      >
                        {status.ProjectStatusName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select name="priority" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none">
                    <option value="">Select Priority</option>

                    {projectPriorityData.map((priority) => (
                      <option
                        key={priority.PriorityID}
                        value={priority.PriorityID}
                      >
                        {priority.PriorityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Deadline</label>
                  <input type="date" name="deadline" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                  <select name="type" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none">
                    <option value="">Select Type</option>

                    {projectTypesData.map((type) => (
                      <option
                        key={type.ProjectTypeID}
                        value={type.ProjectTypeID}
                      >
                        {type.ProjectTypeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Workstream Velocity</label>
                  <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{formData.progress}%</span>
                </div>
                <div className="relative h-2 w-full group">
                  {/* Track Fill Background */}
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                    style={{ width: `${formData.progress}%` }}
                  />
                  <input
                    type="range"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.progress}
                    className="absolute inset-0 w-full h-full appearance-none bg-slate-100 rounded-full cursor-pointer accent-transparent focus:outline-none bg-transparent"
                    onChange={handleChange}
                    style={{
                      WebkitAppearance: 'none',
                      background: 'rgba(241, 245, 249, 0.5)'
                    }}
                  />
                  {/* Styled Thumb via CSS (will be added to the input class or inline styles if necessary, but Tailwind accent-transparent and background transparent with the div fill provides the look) */}
                </div>
                <p className="mt-3 text-[10px] font-medium text-slate-400 italic">Drag to set initial delivery progress</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={20} />
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>

          {/* PREVIEW SECTION */}
          <div className="lg:col-span-5 sticky top-12 flex flex-col items-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Live Card Preview</h2>

            {/* The Actual Project Card Component */}
            <div className="w-full max-w-[380px] bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-slate-100">
              <div className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-wider mb-6 ${statusStyles[selectedStatus?.ProjectStatusName as keyof typeof statusStyles]}`}>
                {selectedStatus?.ProjectStatusName}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2 truncate">
                {formData.name || "Project Name"}
              </h3>

              <p className="text-slate-400 text-sm leading-relaxed mb-8 h-10 line-clamp-2">
                {formData.description || "Project description will appear here..."}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Velocity</span>
                  <span className="text-sm font-black text-slate-800">{formData.progress}%</span>
                </div>
                <div className="w-full h-[10px] bg-slate-100 rounded-full overflow-hidden p-[2px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${formData.progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.4)] relative"
                  >
                    <div className="absolute inset-0 bg-white/20 blur-[1px] rounded-full" />
                  </motion.div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    {selectedType?.ProjectTypeName === 'Mobile App' && <Smartphone size={14} />}
                    {selectedType?.ProjectTypeName === 'Web App' && <Layout size={14} />}
                    {selectedType?.ProjectTypeName === 'IOT/Hardware' && <Cpu size={14} />}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{selectedType?.ProjectTypeName}</span>
                </div>

                <div className="text-right">
                  <div className={`text-[10px] font-black flex items-center justify-end gap-1 ${priorityStyles[selectedPriority?.PriorityName as keyof typeof priorityStyles]}`}>
                    <Flag size={10} fill="currentColor" /> {selectedPriority?.PriorityName}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 flex items-center justify-end gap-1 mt-1">
                    <Calendar size={10} /> {formData.deadline ? new Date(formData.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Set Date'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectCreation;