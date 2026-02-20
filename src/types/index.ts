
export enum UserRole {
  DEVELOPER = "DEVELOPER",
  TEAM_LEAD = "TEAM_LEAD",
  MANAGEMENT = "MANAGEMENT",
}

export enum ProjectStatus {
  PLANNING = "Planning",
  ACTIVE = "Active",
  TESTING = "Testing",
  DEPLOYED = "Deployed",
  MAINTENANCE = "Maintenance",
  ON_HOLD = "On Hold",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum TaskStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In-Progress",
  REVIEW = "Review",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed",
  POSTPONED = "Postponed",
}

export enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent",
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedDeveloperId: string;
  deadline: string;
  status: TaskStatus;
  progressPercentage: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  deadline: string;
  priority: Priority;
  status: ProjectStatus;
  assignedLeadId: string;
  assignedDeveloperIds: string[];
  progressPercentage: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  targetId: string;
  targetType: "PROJECT" | "TASK";
  timestamp: string;
}
