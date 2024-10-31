import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllUsers() {
  const result = await axiosInstance.get("/users/all");
  return result;
}
