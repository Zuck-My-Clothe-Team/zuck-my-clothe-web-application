import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllBranch() {
  const result = await axiosInstance.get("/branch/all");
  return result;
}
