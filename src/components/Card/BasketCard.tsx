import { AiFillClockCircle } from "react-icons/ai";
import {
  EOrderStatus,
  EServiceType,
  IOrderDetail,
} from "../../interface/order.interface";
import { DateFormatter } from "../../utils/datetime";
import CardWrapper from "./CardWrapper";
import { FaCircleXmark } from "react-icons/fa6";

type BasketCardProps = {
  title?: string;
  data: IOrderDetail;
};

const BasketCardData: {
  [key: string]: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
} = {
  [EOrderStatus.Waiting]: {
    title: "ผ้ามาใหม่",
    description: "รอการดำเนินการ",
    icon: (
      <img
        src="/images/basket.png"
        className="aspect-auto my-4 size-16 md:size-28"
      />
    ),
  },
  [EOrderStatus.Processing]: {
    title: "",
    description: "กำลังดำเนินการ",
    icon: (
      <img
        src="/images/washer.png"
        className="aspect-auto my-4 size-16 md:size-28"
      />
    ),
  },
  [EOrderStatus.Completed]: {
    title: "ดำเนินการสำเร็จ",
    description: "รอการจัดส่ง",
    icon: (
      <img
        src="/images/clothes.png"
        className="aspect-auto my-4 size-16 md:size-28"
      />
    ),
  },
  [EOrderStatus.Expired]: {
    title: "ออเดอร์หมดอายุ",
    description: "ออเดอร์หมดอายุ",
    icon: (
      <FaCircleXmark className="size-16 md:size-28 text-customred-1 my-4" />
    ),
  },
};

const BasketCard: React.FC<BasketCardProps> = (props) => {
  return (
    <CardWrapper
      title={props.title ?? BasketCardData[props.data.order_status].title}
    >
      <div className="flex flex-col items-center justify-center">
        {BasketCardData[props.data.order_status].icon}
        <p className="text-text-1">
          {BasketCardData[props.data.order_status].description}
        </p>
        {props.data.order_status === EOrderStatus.Waiting && (
          <p className="text-[#696969] text-[14px]">
            {props.data.service_type === EServiceType.Washing
              ? "เครื่องซัก "
              : "เครื่องอบ "}
            {props.data.weight} kg.
          </p>
        )}
        {props.data.order_status === EOrderStatus.Processing && (
          <span className="text-customgray-400 text-xs md:text-[14px] gap-x-2 flex items-center">
            <AiFillClockCircle className="size-3 lg:size-4 text-#FFE286" />
            เหลือเวลาอีก{" "}
            {DateFormatter.getTimeDifference(
              new Date(),
              new Date(props.data.finished_at)
            )}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-y-1 lg:gap-y-2 mt-4 px-4 text-xs md:text-[14px] "></div>
    </CardWrapper>
  );
};

export default BasketCard;
