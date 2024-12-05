import { IOrderUpdateDTO } from "../interface/order.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetOrderByBranch(branchID: string) {
  try {
    const result = await axiosInstance.get(`order/branch/${branchID}`);
    return result;
  } catch (error) {
    console.error(`Error fetching order by branch ID ${branchID}:`, error);
    throw error;
  }
}

export async function GetAllOrder() {
  try {
    const result = await axiosInstance.get(`order/all`);
    return result;
  } catch (error) {
    console.error(`Error fetching all order`, error);
    throw error;
  }
}

export async function updateStatusOrder(updateDTO: IOrderUpdateDTO) {
  try {
    const result = await axiosInstance.put(`/order/update`, updateDTO);
    return result;
  } catch (error) {
    console.error("Error during update status order:", error);
    throw error;
  }
}
