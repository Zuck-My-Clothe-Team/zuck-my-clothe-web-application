import { IReportUpdateDTO } from "../interface/report.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllReport() {
  try {
    const result = await axiosInstance.get("/report/");
    return result;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    throw error;
  }
}

export async function GetReportByBranchId(branchID: string) {
  try {
    const result = await axiosInstance.get(`/report/branch/${branchID}`);
    return result;
  } catch (error) {
    console.error(`Error fetching reports by branch ID ${branchID}:`, error);
    throw error;
  }
}

export async function UpdateReportStatus(updateData: IReportUpdateDTO) {
  try {
    const result = await axiosInstance.put(`/report/update`, updateData);
    return result;
  } catch (error) {
    console.error(
      `Error updating report status for ID ${updateData.report_id}:`,
      error
    );
    throw error;
  }
}
