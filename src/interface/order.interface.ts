import { UserDetail } from "./userdetail.interface";

export type TWeight = 0 | 7 | 14 | 21;

export const MachinePrice = {
  0: 20,
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

export enum EWorkingStatus {
  Waiting = "Waiting",
  Pickup = "Pickup",
  BackToStore = "BackToStore",
  Processing = "Processing",
  OutForDelivery = "OutForDelivery",
  Completed = "Completed",
  Canceled = "Canceled",
}

export enum EWorkingStatusTH {
  Waiting = "รอดำเนินการ",
  Pickup = "รับผ้า",
  BackToStore = "ผ้ากลับมาถึงร้าน",
  Processing = "กำลังดำเนินการ",
  OutForDelivery = "กำลังจัดส่ง",
  Completed = "เสร็จสิ้น",
  Canceled = "ยกเลิก",
}

export enum EServiceTypeTH {
  Washing = "เครื่องซัก",
  Drying = "เครื่องอบ",
  Pickup = "รับผ้า",
  Delivery = "ส่งผ้า",
  Agents = "ค่าน้ำยาซัก-ปรับผ้านุ่ม",
  DeliveryOrPickup = "รับ-ส่งผ้า",
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

export interface IOrderUpdateDTO {
  finished_at: string;
  machine_serial: string | null;
  order_basket_id: string;
  order_status: EOrderStatus;
}
