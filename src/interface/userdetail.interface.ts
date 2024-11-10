import { IBranch } from "./branch.interface";
import { IContracts } from "./employee.interface";

export interface IUserDetail {
  data: UserDetail;
  token: string;
}

export interface IUser extends UserDetail {
  branch: IBranch[];
  contracts: IContracts[];
}

export interface UserDetail {
  user_id: string;
  email: string;
  firstname: string;
  role: string;
  lastname: string;
  phone: string;
  profile_image_url: string;
  password?: string;
}

export interface IUserReview {
  firstname: string;
  lastname: string;
  profile_image_url: string;
  review_comment: string;
  star_rating: number;
}

export enum Role {
  SuperAdmin = "SuperAdmin",
  BranchManager = "BranchManager",
  Employee = "Employee",
  Client = "Client",
}

export enum ContractType {
  Worker = "Worker",
  Deliver = "Deliver",
}
