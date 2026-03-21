import { springApi } from "@/src/api/http";
import type { SafetyEducation, SafetyEducationPayload, SafetyInspectionGroup, SafetyInspectionSummary, SafetyWorkerProgress } from "@/src/types";

type SafetyCourseDto = {
  courseId: number;
  userId?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  materialUrl?: string;
  durationMinutes?: number;
  status?: string;
};

function pageableParams(page = 0, size = 20, keyword?: string) {
  return { page, size, ...(keyword ? { keyword } : {}) };
}

export const safetyService = {
  async getInspectionSummary(month: string) {
    const [adminRes, userRes] = await Promise.all([
      springApi.get("/api/safety/admin/courses", { params: pageableParams(0, 20) }),
      springApi.get("/api/safety/user/training/uncompleted"),
    ]);
    const totalWorkers = adminRes.data.totalElements ?? adminRes.data.content?.length ?? 0;
    const incomplete = ((userRes.data ?? []) as SafetyCourseDto[]).length;
    return {
      totalWorkers,
      completedWorkers: Math.max(totalWorkers - incomplete, 0),
      incompleteWorkers: incomplete,
      unsignedWorkers: incomplete,
    } satisfies SafetyInspectionSummary;
  },

  async getWorkerProgress(month: string) {
    const response = await springApi.get("/api/safety/user/training/uncompleted");
    return ((response.data ?? []) as SafetyCourseDto[]).map((item, index) => ({
      workerId: item.courseId ?? index + 1,
      workerName: item.title ?? "교육 미이수",
      teamName: item.status ?? "UNWATCHED",
      completedCount: item.status === "WATCHED" ? 1 : 0,
      totalCount: 1,
      completed: item.status === "WATCHED",
    })) satisfies SafetyWorkerProgress[];
  },

  async getEducationList() {
    const [allRes, uncompletedRes] = await Promise.all([
      springApi.get("/api/safety/user/courses", { params: pageableParams(0, 20) }),
      springApi.get("/api/safety/user/training/uncompleted"),
    ]);
    const uncompletedIds = new Set(((uncompletedRes.data ?? []) as SafetyCourseDto[]).map((item) => item.courseId));
    return ((allRes.data.content ?? []) as SafetyCourseDto[]).map((item) => ({
      id: item.courseId,
      userId: item.userId,
      title: item.title ?? "안전 교육",
      description: item.description,
      videoUrl: item.videoUrl,
      materialUrl: item.materialUrl,
      durationMinutes: item.durationMinutes ?? 0,
      deadline: "-",
      progressRate: uncompletedIds.has(item.courseId) ? 0 : 100,
      completed: !uncompletedIds.has(item.courseId),
      status: uncompletedIds.has(item.courseId) ? "UNWATCHED" : "WATCHED",
    })) satisfies SafetyEducation[];
  },

  async searchEducationList(keyword: string, admin = false): Promise<SafetyEducation[]> {
    const response = await springApi.get(admin ? "/api/safety/admin/courses/search" : "/api/safety/user/courses/search", {
      params: pageableParams(0, 20, keyword),
    });
    return ((response.data.content ?? []) as SafetyCourseDto[]).map((item) => ({
      id: item.courseId,
      userId: item.userId,
      title: item.title ?? "안전 교육",
      description: item.description,
      videoUrl: item.videoUrl,
      materialUrl: item.materialUrl,
      durationMinutes: item.durationMinutes ?? 0,
      deadline: "-",
      progressRate: item.status === "WATCHED" ? 100 : 0,
      completed: item.status === "WATCHED",
      status: (item.status as "WATCHED" | "UNWATCHED" | "WATCHING" | undefined) ?? "UNWATCHED",
    })) satisfies SafetyEducation[];
  },

  async getUncompletedVideos(): Promise<SafetyEducation[]> {
    const response = await springApi.get("/api/safety/user/training/uncompleted");
    return ((response.data ?? []) as SafetyCourseDto[]).map((item) => ({
      id: item.courseId,
      title: item.title ?? "안전 교육",
      description: undefined,
      videoUrl: item.videoUrl,
      materialUrl: undefined,
      durationMinutes: item.durationMinutes ?? 0,
      deadline: "-",
      progressRate: item.status === "WATCHING" ? 50 : 0,
      completed: item.status === "WATCHED",
      status: (item.status as "WATCHED" | "UNWATCHED" | "WATCHING" | undefined) ?? "UNWATCHED",
      completionDate: undefined,
    })) satisfies SafetyEducation[];
  },

  async completeEducation(courseId: number) {
    await springApi.patch("/api/safety/user/training/complete", { courseId });
  },

  async getAdminEducationList(): Promise<SafetyEducation[]> {
    const response = await springApi.get("/api/safety/admin/courses", {
      params: pageableParams(0, 20),
    });
    return ((response.data.content ?? []) as SafetyCourseDto[]).map((item) => ({
      id: item.courseId,
      userId: item.userId,
      title: item.title ?? "안전 교육",
      description: item.description,
      videoUrl: item.videoUrl,
      materialUrl: item.materialUrl,
      durationMinutes: item.durationMinutes ?? 0,
      deadline: "-",
      progressRate: 0,
      completed: false,
    })) satisfies SafetyEducation[];
  },

  async createEducation(payload: SafetyEducationPayload): Promise<SafetyEducation> {
    const response = await springApi.post("/api/safety/admin/courses", payload);
    return {
      id: response.data.courseId,
      userId: response.data.userId,
      title: response.data.title,
      description: response.data.description,
      videoUrl: response.data.videoUrl,
      materialUrl: response.data.materialUrl,
      durationMinutes: response.data.durationMinutes ?? 0,
      deadline: "-",
      progressRate: 0,
      completed: false,
    } satisfies SafetyEducation;
  },

  async updateEducation(courseId: number, payload: SafetyEducationPayload): Promise<SafetyEducation> {
    const response = await springApi.put(`/api/safety/admin/courses/${courseId}`, payload);
    return {
      id: response.data.courseId,
      userId: response.data.userId,
      title: response.data.title,
      description: response.data.description,
      videoUrl: response.data.videoUrl,
      materialUrl: response.data.materialUrl,
      durationMinutes: response.data.durationMinutes ?? 0,
      deadline: "-",
      progressRate: 0,
      completed: false,
    } satisfies SafetyEducation;
  },

  async deleteEducation(courseId: number) {
    await springApi.delete(`/api/safety/admin/courses/${courseId}`);
  },

  async getDailyInspectionGroups() {
    const educations = await this.getEducationList();
    return [
      {
        id: 1,
        title: "안전교육 이수",
        completedCount: educations.filter((item) => item.completed).length,
        totalCount: educations.length,
        items: educations.map((item) => ({
          id: item.id,
          label: item.title,
          status: item.completed ? "DONE" : "TODO",
        })),
      },
    ] as SafetyInspectionGroup[];
  },
};
