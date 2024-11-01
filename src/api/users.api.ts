import { UserDetail } from "../interface/userdetail.interface";
import { axiosInstance } from "../utils/axiosInstance";

export async function GetAllUsers() {
  const result = await axiosInstance.get("/users/all");
  return result;
}

export async function GetAllManagers() {
  const result = await axiosInstance.get("/users/manager/all");
  return result;
}

export async function CreateUser(data: UserDetail) {
  const result = await axiosInstance.post("/users", data);
  return result;
}

export async function DeleteUser(id: string) {
  const result = await axiosInstance.delete(`/users/${id}`);
  return result;
}
