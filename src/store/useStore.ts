import { create } from 'zustand';
import { User, Project, Task, ActivityLog, UserRole, ProjectStatus, TaskStatus } from '@/types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_TASKS } from '@/lib/mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  isDarkMode: boolean;

  // Auth
  login: (username: string) => User | null;
  logout: () => void;

  // Users
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;

  // Projects
  addProject: (project: Omit<Project, 'id' | 'progressPercentage'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // UI
  toggleDarkMode: () => void;

  // Helpers
  getProjectTasks: (projectId: string) => Task[];
  calculateProjectProgress: (projectId: string) => number;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: MOCK_USERS,
  projects: MOCK_PROJECTS,
  tasks: MOCK_TASKS,
  activityLogs: [],
  isDarkMode: false,

  login: (username: string) => {
    const user = MOCK_USERS.find(u => u.username === username);
    if (user) {
      set({ currentUser: user });
      return user;
    }
    return null;
  },

  logout: () => set({ currentUser: null }),

  addUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`,
    };
    set(state => ({
      users: [...state.users, newUser],
      activityLogs: [
        {
          id: `log${Date.now()}`,
          userId: state.currentUser?.id || 'system',
          action: `Created user ${newUser.name}`,
          targetId: newUser.id,
          targetType: 'PROJECT', // Using PROJECT as a placeholder for user logs
          timestamp: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    }));
  },

  deleteUser: (id) => {
    set(state => ({
      users: state.users.filter(u => u.id !== id),
    }));
  },

  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: `p${Date.now()}`,
      progressPercentage: 0,
    };
    set(state => ({
      projects: [...state.projects, newProject],
      activityLogs: [
        {
          id: `log${Date.now()}`,
          userId: state.currentUser?.id || 'system',
          action: 'Created project',
          targetId: newProject.id,
          targetType: 'PROJECT',
          timestamp: new Date().toISOString(),
        },
        ...state.activityLogs,
      ],
    }));
  },

  updateProject: (id, updates) => {
    set(state => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  },

  deleteProject: (id) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      tasks: state.tasks.filter(t => t.projectId !== id),
    }));
  },

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set(state => {
      const newTasks = [...state.tasks, newTask];
      return {
        tasks: newTasks,
        activityLogs: [
          {
            id: `log${Date.now()}`,
            userId: state.currentUser?.id || 'system',
            action: 'Created task',
            targetId: newTask.id,
            targetType: 'TASK',
            timestamp: new Date().toISOString(),
          },
          ...state.activityLogs,
        ],
      };
    });
    // Update project progress
    get().calculateProjectProgress(taskData.projectId);
  },

  updateTask: (id, updates) => {
    set(state => {
      const updatedTasks = state.tasks.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      );
      return { tasks: updatedTasks };
    });

    const task = get().tasks.find(t => t.id === id);
    if (task) {
      get().calculateProjectProgress(task.projectId);
    }
  },

  deleteTask: (id) => {
    const task = get().tasks.find(t => t.id === id);
    const projectId = task?.projectId;
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id),
    }));
    if (projectId) {
      get().calculateProjectProgress(projectId);
    }
  },

  toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),

  getProjectTasks: (projectId) => {
    return get().tasks.filter(t => t.projectId === projectId);
  },

  calculateProjectProgress: (projectId) => {
    const projectTasks = get().tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;

    const totalProgress = projectTasks.reduce((acc, task) => acc + task.progressPercentage, 0);
    const averageProgress = Math.round(totalProgress / projectTasks.length);

    set(state => ({
      projects: state.projects.map(p =>
        p.id === projectId ? { ...p, progressPercentage: averageProgress } : p
      ),
    }));

    return averageProgress;
  },
}));
