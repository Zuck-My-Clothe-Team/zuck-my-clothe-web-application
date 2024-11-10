import { IMachine } from "./machine.interface";
import { IUserReview } from "./userdetail.interface";

export interface IBranchCreate {
  branch_name: string;
  branch_detail: string;
  branch_lat: number;
  branch_long: number;
  owner_user_id: string;
}
export interface IBranch {
  average_star: number;
  branch_detail: string;
  branch_id: string;
  branch_lat: number;
  branch_long: number;
  branch_name: string;
  created_at: string;
  created_by: string;
  deleted_at: string;
  deleted_by: string;
  distance: number;
  machines: IMachine[];
  owner_user_id: string;
  updated_at: string;
  updated_by: string;
  user_reviews: IUserReview[];
}
