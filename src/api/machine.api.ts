import { IMachine } from "../interface/machine.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllMachine() {
  const result = await axiosInstance.get("/machine/all");
  return result;
}

export async function GetAllMachineByBranch(branch_id: string) {
  const result = await axiosInstance.get(`/machine/branch/${branch_id}`);
  return result;
}

export async function CreateMachine(machine: IMachine) {
  const result = await axiosInstance.post("/machine/add", machine);
  return result;
}

export async function UpdateMachineStatus(
  machine_serial: string,
  status: boolean
) {
  const result = await axiosInstance.put(
    `/machine/update/${machine_serial}/set_active/${status}`
  );
  return result;
}

export async function DeleteMachine(machine_serial: string) {
  const result = await axiosInstance.delete(
    `/machine/delete/${machine_serial}`
  );
  return result;
}
