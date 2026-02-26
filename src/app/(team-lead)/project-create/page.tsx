"use client";

import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
        Deadline: formData.deadline,
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
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Progress Percentage</label>
                  <span className="text-sm font-bold text-indigo-600">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  onChange={handleChange}
                />
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

              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Delivery Progress</span>
                  <span className="text-xs font-black text-slate-800">{formData.progress}%</span>
                </div>
                <div className="w-full h-[6px] bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${formData.progress}%` }}
                  />
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