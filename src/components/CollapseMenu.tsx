import { IoIosArrowDown } from "react-icons/io";
import { BsArrowRightSquare } from "react-icons/bs";
import { useRef, useEffect, useState } from "react";
import { DateFormatter } from "../utils/datetime";

export type CollapseMenuItems = {
  title: string;
  onClick: () => void;
  createdDate: Date;
  content?: React.ReactNode;
};

type CollapseMenuProps = {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  headerText: string;
  headerBgStyle?: string;
  items: CollapseMenuItems[];
};

const CollapseMenu: React.FC<CollapseMenuProps> = ({
  headerBgStyle = "bg-primaryblue-300 hover:bg-primaryblue-300/80",
  ...props
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>(0);

  useEffect(() => {
    if (props.items.length === 0) {
      setHeight(0);
    } else if (props.isOpen) {
      setHeight("auto");
      requestAnimationFrame(() => {
        setHeight(contentRef.current?.scrollHeight || "auto");
      });
    } else {
      setHeight(contentRef.current?.scrollHeight || 0);
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [props, props.isOpen, props.items.length]);

  return (
    <div className="flex flex-col w-full">
      <div
        className={`cursor-pointer px-3 py-2 ${headerBgStyle} ${
          props.isOpen
            ? props.items.length > 0
              ? "rounded-t-[9px]"
              : "rounded-[9px]"
            : "rounded-[9px]"
        } border-b-primaryblue-300 flex flex-row justify-between`}
        onClick={() => props.setOpen(!props.isOpen)}
      >
        <p className="text-text-2 font-kanit font-normal text-lg">
          {props.headerText}
        </p>
        <IoIosArrowDown
          className={`size-6 text-text-2 ${
            props.isOpen ? "transform rotate-180" : "transform rotate-0"
          }`}
        />
      </div>
      <div
        ref={contentRef}
        style={{ height, transition: "height 0.3s ease" }}
        className="overflow-hidden"
      >
        {props.items.map((item, index) => (
          <div
            key={index}
            className="px-3 py-2 bg-white hover:bg-customgray-100 border border-b-customgray-300"
            onClick={item.onClick}
          >
            <div className="grid grid-cols-5 items-center justify-between p-2.5 gap-x-4">
              <div className="col-span-3 flex flex-col">
                <p className="text-text-1 font-kanit font-normal text-[16px]">
                  {item.title}
                </p>
                <div>{item.content ? item.content : null}</div>
              </div>
              <div className="col-span-2 flex flex-col gap-y-2 gap-x-4 items-end ">
                <div className="bg-background-2 size-6 rounded-md">
                  <BsArrowRightSquare className="size-6 text-text-2" />
                </div>
                <p className="text-text-4 font-kanit font-light text-[8px]">
                  {DateFormatter.getTimeDifference(item.createdDate)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollapseMenu;
