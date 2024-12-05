import { FaInfoCircle } from "react-icons/fa";
import CardWrapper from "./CardWrapper";
import { AiFillClockCircle } from "react-icons/ai";
import { DateFormatter } from "../../utils/datetime";
import {
  EServiceTypeTH,
  EWorkingStatus,
  IOrder,
  MachinePrice,
} from "../../interface/order.interface";
import { FaCircleXmark } from "react-icons/fa6";
import { BsCheckCircleFill } from "react-icons/bs";

type SummaryOrderCardProps = {
  data: IOrder;
  status: EWorkingStatus;
};

const SummaryOrderCardData: {
  [key: string]: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
} = {
  [EWorkingStatus.Waiting]: {
    title: "รอดำเนินการ",
    description: "รายละเอียดออเดอร์",
    icon: <FaInfoCircle className="size-16 md:size-28 text-[#FFEFBD] my-4" />,
  },
  [EWorkingStatus.Pickup]: {
    title: "กำลังไปรับผ้า",
    description: "กำลังดำเนินการ",
    icon: (
      <img
        src="/images/delivery.png"
        className="aspect-auto my-4 size-16 md:size-28"
      />
    ),
  },
  [EWorkingStatus.Canceled]: {
    title: "ยกเลิกออเดอร์",
    description: "ออเดอร์ถูกยกเลิก",
    icon: (
      <FaCircleXmark className="size-16 md:size-28 text-customred-1 my-4" />
    ),
  },
  [EWorkingStatus.BackToStore]: {
    title: "จัดส่งเสร็จสิ้น",
    description: "ส่งผ้าเรียบร้อย",
    icon: (
      <img
        src="/images/delivery.png"
        className="aspect-auto my-4 size-16 md:size-28"
      />
    ),
  },
  [EWorkingStatus.OutForDelivery]: {
    title: "กำลังจัดส่ง",
    description: "กำลังจัดส่ง",
    icon: (
      <img
        src="/images/delivery.png"
        className="aspect-auto my-4 size-16 md:size-28"
      />
    ),
  },
  [EWorkingStatus.Completed]: {
    title: "เสร็จสิ้น",
    description: "รายละเอียดออเดอร์",
    icon: (
      <BsCheckCircleFill className="size-16 md:size-28 text-[#BDFFC2] my-4" />
    ),
  },
};

const SummaryOrderCard: React.FC<SummaryOrderCardProps> = (props) => {
  return (
    <CardWrapper title={SummaryOrderCardData[props.status].title}>
      <div className="flex flex-col items-center justify-center">
        {SummaryOrderCardData[props.status].icon}
        <p className="text-text-1">
          {SummaryOrderCardData[props.status].description}
        </p>
        <span className="text-customgray-400 text-xs md:text-[14px] gap-x-2 flex items-center">
          <AiFillClockCircle className="size-3 lg:size-4" />
          {DateFormatter.getDateTimeThaiFomatted(
            new Date(props.data.created_at)
          )}
        </span>
      </div>
      <div className="flex flex-col gap-y-1 lg:gap-y-2 mt-4 px-4 text-xs md:text-[14px] ">
        {props.data.order_details
          .sort((a, b) => b.weight - a.weight)
          .map((order, index) => (
            <div
              key={index}
              className="flex flex-row gap-x-4 items-center justify-between text-[#696969]"
            >
              <p>
                {EServiceTypeTH[order.service_type]}
                {order.weight > 0 && ` ${order.weight} kg.`}
              </p>
              <p>{MachinePrice[order.weight]} บาท</p>
            </div>
          ))}
        <div className="flex flex-row gap-x-4 items-center justify-between text-[#373737]">
          <p>ราคมรวม</p>
          <p>
            {props.data.order_details.reduce(
              (total, order) => total + MachinePrice[order.weight],
              0
            )}{" "}
            บาท
          </p>
        </div>
      </div>
    </CardWrapper>
  );
};

export default SummaryOrderCard;
