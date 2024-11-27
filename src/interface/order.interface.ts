import { UserDetail } from "./userdetail.interface";

export type TWeight = 0 | 7 | 14 | 21;

export const MachinePrice = {
  0: 0,
  7: 50,
  14: 100,
  21: 150,
};

export enum EServiceType {
  Pickup = "Pickup",
  Delivery = "Delivery",
  Drying = "Drying",
  Washing = "Washing",
  Agents = "Agents",
}
export enum EOrderStatus {
  Waiting = "Waiting",
  Processing = "Processing",
  Completed = "Completed",
  Canceled = "Canceled",
  Expired = "Expired",
}

export interface IOrderDetail {
  created_at: string;
  created_by: string;
  deleted_at: string;
  deleted_by: string;
  finished_at: string;
  machine_serial: string;
  order_basket_id: string;
  order_header_id: string;
  order_status: EOrderStatus;
  service_type: EServiceType;
  updated_at: string;
  updated_by: string;
  weight: TWeight;
}

export interface IOrder {
  branch_id: string;
  created_at: string;
  created_by: string;
  deleted_at: string;
  deleted_by: string;
  delivery_address: string;
  delivery_lat: number;
  delivery_long: number;
  order_details: IOrderDetail[];
  order_header_id: string;
  order_note: string;
  payment_id: string;
  review_comment: string;
  star_rating: number;
  updated_at: string;
  updated_by: string;
  user_detail: UserDetail;
  user_id: string;
  zuck_onsite: boolean;
}
