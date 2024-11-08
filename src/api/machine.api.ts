import { IMachine } from "../interface/machine.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllMachine() {
  try {
    const result = await axiosInstance.get("/machine/all");
    return result;
  } catch (error) {
    console.error("Error fetching all machines:", error);
    throw error;
  }
}

export async function GetAllMachineByBranch(branch_id: string) {
  try {
    const result = await axiosInstance.get(`/machine/branch/${branch_id}`);
    return result;
  } catch (error) {
    console.error(`Error fetching machines for branch ${branch_id}:`, error);
    throw error;
  }
}

export async function CreateMachine(machine: IMachine) {
  try {
    const result = await axiosInstance.post("/machine/add", machine);
    return result;
  } catch (error) {
    console.error("Error creating machine:", error);
    throw error;
  }
}

export async function UpdateMachineLabel(
  machine_serial: string,
  label: number
) {
  try {
    const result = await axiosInstance.put(
      `/machine/update/${machine_serial}/set_label/${label}`
    );
    return result;
  } catch (error) {
    console.error(
      `Error updating machine label for serial ${machine_serial}:`,
      error
    );
    throw error;
  }
}

export async function UpdateMachineStatus(
  machine_serial: string,
  status: boolean
) {
  try {
    const result = await axiosInstance.put(
      `/machine/update/${machine_serial}/set_active/${status}`
    );
    return result;
  } catch (error) {
    console.error(
      `Error updating machine status for serial ${machine_serial}:`,
      error
    );
    throw error;
  }
}

export async function DeleteMachine(machine_serial: string) {
  try {
    const result = await axiosInstance.delete(
      `/machine/delete/${machine_serial}`
    );
    return result;
  } catch (error) {
    console.error(
      `Error deleting machine with serial ${machine_serial}:`,
      error
    );
    throw error;
  }
}
