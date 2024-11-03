import { axiosInstance } from "../utils/axiosInstance";

export async function Login(email: string, password: string) {
  try {
    const result = await axiosInstance.post("/auth/signin", {
      email: email,
      password: password,
    });
    return result.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

export async function CheckToken() {
  try {
    const result = await axiosInstance.get("/auth/me");
    return result;
  } catch (error) {
    console.error("Error checking token:", error);
    throw error;
  }
}
