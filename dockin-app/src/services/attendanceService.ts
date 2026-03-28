import { springApi } from "@/src/api/http";
import type { AttendanceSummary, TodayAttendance } from "@/src/types";
import { AttendanceState } from "@/src/types";
import { loadAuthSession } from "@/src/utils/storage";

function toTodayAttendance(dto: any): TodayAttendance {
  const state =
    dto.clockOutTime ? AttendanceState.OFF_WORK : dto.clockInTime ? AttendanceState.WORKING : AttendanceState.BEFORE_WORK;

  return {
    id: dto.id,
    userId: dto.userId,
    date: dto.clockInTime ?? dto.clockOutTime ?? new Date().toISOString(),
    checkInTime: dto.clockInTime ? new Date(dto.clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    checkOutTime: dto.clockOutTime ? new Date(dto.clockOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    totalWorkTime: dto.totalWorkTime,
    inLocation: dto.inLocation,
    outLocation: dto.outLocation,
    status: dto.status,
    leaveDays: 0,
    absentDays: 0,
    state,
  };
}

export const attendanceService = {
  async getManagerSummary() {
    const response = await springApi.get("/api/attendance");
    const list = response.data ?? [];
    const latest = list.at?.(-1) ?? list[list.length - 1];
    return {
      zoneName: latest?.inLocation ?? "제1조선소",
      workShift: latest?.status ?? "NORMAL",
      state: latest?.clockOutTime
        ? AttendanceState.OFF_WORK
        : latest?.clockInTime
          ? AttendanceState.WORKING
          : AttendanceState.BEFORE_WORK,
      checkInCount: list.filter((item: any) => item.clockInTime).length,
      checkOutCount: list.filter((item: any) => item.clockOutTime).length,
      leaveCount: 0,
      absentCount: 0,
    } satisfies AttendanceSummary;
  },

  async getTodayAttendance() {
    const response = await springApi.get("/api/attendance");
    const list = response.data ?? [];
    const session = await loadAuthSession();
    const employeeNumber = session.user?.employeeNumber;
    const todayKey = new Date().toDateString();

    const filtered = list
      .filter((item: any) => !employeeNumber || item.userId === employeeNumber)
      .filter((item: any) => {
        const baseDate = item.clockInTime ?? item.clockOutTime;
        return baseDate ? new Date(baseDate).toDateString() === todayKey : false;
      })
      .sort((a: any, b: any) => {
        const aTime = new Date(a.clockOutTime ?? a.clockInTime ?? 0).getTime();
        const bTime = new Date(b.clockOutTime ?? b.clockInTime ?? 0).getTime();
        return bTime - aTime;
      });

    const latest = filtered[0] ?? list.at?.(-1) ?? list[list.length - 1];
    return latest
      ? toTodayAttendance(latest)
      : {
          date: new Date().toISOString(),
          checkInTime: undefined,
          checkOutTime: undefined,
          totalWorkTime: undefined,
          inLocation: undefined,
          outLocation: undefined,
          status: undefined,
          leaveDays: 0,
          absentDays: 0,
          state: AttendanceState.BEFORE_WORK,
        };
  },

  async checkIn() {
    const response = await springApi.post("/api/attendance/in", {
      inLocation: "제1조선소",
    });
    return toTodayAttendance(response.data);
  },

  async checkOut() {
    const response = await springApi.post("/api/attendance/out", {
      outLocation: "제1조선소",
    });
    return toTodayAttendance(response.data);
  },
};
