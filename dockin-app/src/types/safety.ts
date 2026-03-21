import type { ChecklistItem } from "./common";

export type SafetyInspectionSummary = {
  totalWorkers: number;
  completedWorkers: number;
  incompleteWorkers: number;
  unsignedWorkers: number;
};

export type SafetyWorkerProgress = {
  workerId: number;
  workerName: string;
  teamName: string;
  completedCount: number;
  totalCount: number;
  completed: boolean;
};

export type SafetyEducation = {
  id: number;
  userId?: string;
  title: string;
  description?: string;
  videoUrl?: string;
  materialUrl?: string;
  durationMinutes: number;
  deadline: string;
  progressRate: number;
  completed: boolean;
  status?: "WATCHED" | "UNWATCHED" | "WATCHING";
  completionDate?: string;
};

export type SafetyEducationPayload = {
  title: string;
  description: string;
  videoUrl: string;
  materialUrl?: string;
  durationMinutes: number;
};

export type SafetyInspectionGroup = {
  id: number;
  title: string;
  completedCount: number;
  totalCount: number;
  items: ChecklistItem[];
};
