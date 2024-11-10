import { IBranch, IBranchCreate } from "../interface/branch.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllBranch() {
  try {
    const result = await axiosInstance.get("/branch/all");
    return result;
  } catch (error) {
    console.error("Error fetching all branches:", error);
    throw error;
  }
}

export async function GetBranchById(branchID: string) {
  try {
    const result = await axiosInstance.get(`/branch/${branchID}`);
    return result;
  } catch (error) {
    console.error(`Error fetching branch by ID ${branchID}:`, error);
    throw error;
  }
}

export async function GetOwnBranch() {
  try {
    const result = await axiosInstance.get("/branch/owner");
    return result;
  } catch (error) {
    console.error("Error fetching own branch:", error);
    throw error;
  }
}

export async function CreateBranch(data: IBranchCreate) {
  try {
    const result = await axiosInstance.post("/branch/create", data);
    return result;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
}

export async function DeleteBranch(branchID: string) {
  try {
    const result = await axiosInstance.delete(`/branch/${branchID}`);
    return result;
  } catch (error) {
    console.error(`Error deleting branch by ID ${branchID}:`, error);
    throw error;
  }
}

export async function UpdateBranch(data: IBranch) {
  try {
    const result = await axiosInstance.put(`/branch/update/`, data);
    return result;
  } catch (error) {
    console.error(`Error updating branch by ID ${data.branch_id}:`, error);
    throw error;
  }
}
