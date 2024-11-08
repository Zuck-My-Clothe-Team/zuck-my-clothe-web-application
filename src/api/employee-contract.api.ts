import { axiosInstance } from "../utils/axiosInstance";

export async function GetEmployeeContractsByUserID(userId: string) {
  try {
    const result = await axiosInstance.get(`/employee-contract/user/${userId}`);
    return result;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}
