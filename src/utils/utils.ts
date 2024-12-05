import {
  EOrderStatus,
  EServiceType,
  IOrderDetail,
  EWorkingStatus,
} from "../interface/order.interface";

export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "-";
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phoneNumber;
}

export const GetStatusOrderFromOrderDetails = (
  detail: IOrderDetail[]
): EWorkingStatus => {
  if (!detail || detail.length === 0) return EWorkingStatus.Waiting;
  const isComplete = detail
    .filter((d) => d.service_type !== EServiceType.Agents)
    .every((d) => d.order_status === EOrderStatus.Completed);
  const isCancel = detail.every(
    (d) => d.order_status === EOrderStatus.Canceled
  );
  const isOutForDelivery = detail.some(
    (d) =>
      d.service_type === EServiceType.Delivery &&
      d.order_status === EOrderStatus.Processing
  );
  const isProcessing = detail
    .filter(
      (d) =>
        d.service_type !== EServiceType.Agents &&
        d.service_type !== EServiceType.Pickup
    )
    .some(
      (d) =>
        d.order_status === EOrderStatus.Processing ||
        d.order_status === EOrderStatus.Completed
    );
  const isPickup = detail.some(
    (d) =>
      d.service_type === EServiceType.Pickup &&
      d.order_status === EOrderStatus.Processing
  );
  const isBackToStore = detail.some(
    (d) =>
      d.service_type === EServiceType.Pickup &&
      d.order_status === EOrderStatus.Completed
  );
  const isWaiting = detail.every(
    (d) => d.order_status === EOrderStatus.Waiting
  );

  let status: EWorkingStatus = EWorkingStatus.Waiting;

  if (isComplete) status = EWorkingStatus.Completed;
  else if (isCancel) status = EWorkingStatus.Canceled;
  else if (isOutForDelivery) status = EWorkingStatus.OutForDelivery;
  else if (isProcessing) status = EWorkingStatus.Processing;
  else if (isPickup) status = EWorkingStatus.Pickup;
  else if (isBackToStore) status = EWorkingStatus.BackToStore;
  else if (isWaiting) status = EWorkingStatus.Waiting;

  return status;
};
