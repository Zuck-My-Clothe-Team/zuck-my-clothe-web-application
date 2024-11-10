import { UserDetail } from "../interface/userdetail.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllUsers() {
  try {
    const result = await axiosInstance.get("/users/all");
    return result;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

export async function GetUserById(id: string) {
  try {
    const result = await axiosInstance.get(`/users/${id}`);
    return result;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
}

export async function GetBranchEmployee(branchId: string) {
  try {
    const result = await axiosInstance.get(`/users/branch/${branchId}`);
    return result;
  } catch (error) {
    console.error("Error fetching all managers:", error);
    throw error;
  }
}

export async function GetAllManagers() {
  try {
    const result = await axiosInstance.get("/users/manager/all");
    return result;
  } catch (error) {
    console.error("Error fetching all managers:", error);
    throw error;
  }
}

export async function CreateUser(data: UserDetail) {
  try {
    const result = await axiosInstance.post("/users", data);
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function DeleteUser(id: string) {
  try {
    const result = await axiosInstance.delete(`/users/${id}`);
    return result;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
}
