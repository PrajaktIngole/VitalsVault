import { jwtDecode } from "jwt-decode";

export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export type TokenPayload = {
  id: number;
  role: UserRole;
};

export const getUserFromToken = (): TokenPayload | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
};
