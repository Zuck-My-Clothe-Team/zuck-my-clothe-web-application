import { IBranch } from "../interface/branch.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllBranch() {
  const result = await axiosInstance.get("/branch/all");
  return result;
}

export async function GetBranchById(branchID: string) {
  const result = await axiosInstance.get(`/branch/${branchID}`);
  return result;
}

export async function GetOwnBranch() {
  const result = await axiosInstance.get("/branch/owns");
  return result;
}

export async function CreateBranch(data: IBranch) {
  const result = await axiosInstance.post("/branch/create", data);
  return result;
}

export async function DeleteBranch(branchID: string) {
  const result = await axiosInstance.delete(`/branch/${branchID}`);
  return result;
}
