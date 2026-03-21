import { springApi } from "@/src/api/http";
import type { AxiosError } from "axios";
import type { LoginRequest, LoginResponse, SignupRequest } from "@/src/types";
import { requestFirstSuccess } from "./requestFallback";

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const legacyPayload = {
      userId: payload.employeeNumber,
      password: payload.password,
    };

    let data: any;

    try {
      const response = await springApi.request({
        url: "/api/auth/login",
        method: "POST",
        data: payload,
      });
      data = response.data;
    } catch (error) {
      const status = (error as AxiosError | undefined)?.response?.status;
      if (status !== 400 && status !== 401 && status !== 404 && status !== 405 && status !== 501) {
        throw error;
      }

      const fallbackResponse = await springApi.request({
        url: "/member/login",
        method: "POST",
        data: legacyPayload,
      });
      data = fallbackResponse.data;
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user ?? {
        id: data.id ?? 0,
        employeeNumber: data.employeeNumber ?? legacyPayload.userId,
        name: data.name ?? "사용자",
        role: data.role === "USER" ? "WORKER" : data.role,
        department: data.department,
        workZone: data.workZone,
      },
    };
  },

  async signup(payload: SignupRequest) {
    const legacyPayload = {
      userId: payload.employeeNumber,
      username: payload.name,
      password: payload.password,
      role: payload.role === "WORKER" ? "USER" : payload.role,
    };

    try {
      await springApi.request({
        url: "/api/auth/signup",
        method: "POST",
        data: payload,
      });
    } catch (error) {
      const status = (error as AxiosError | undefined)?.response?.status;
      if (status !== 400 && status !== 401 && status !== 404 && status !== 405 && status !== 501) {
        throw error;
      }

      await springApi.request({
        url: "/member/signup",
        method: "POST",
        data: legacyPayload,
      });
    }
  },

  async logout() {
    await requestFirstSuccess(springApi, [
      { url: "/api/auth/logout", method: "POST" },
      { url: "/member/logout", method: "POST" },
    ]);
  },
};
