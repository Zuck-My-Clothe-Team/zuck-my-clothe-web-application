import { axiosInstance } from "../utils/axiosInstance";

export async function Login(email: string, password: string) {
  const result = await axiosInstance.post("/auth/signin", {
    email: email,
    password: password,
  });
  return result.data;
}
