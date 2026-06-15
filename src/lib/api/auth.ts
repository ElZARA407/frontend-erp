import { apiClient } from "./client";

export async function login(payload: { email: string; password: string }) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}
