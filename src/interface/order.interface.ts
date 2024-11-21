import { UserDetail } from "./userdetail.interface";

export interface IOrderDetail {
  created_at: string;
  created_by: string;
  deleted_at: string;
  deleted_by: string;
  finished_at: string;
  machine_serial: string;
  order_basket_id: string;
  order_header_id: string;
  order_status: string;
  service_type: string;
  updated_at: string;
  updated_by: string;
  weight: number;
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
