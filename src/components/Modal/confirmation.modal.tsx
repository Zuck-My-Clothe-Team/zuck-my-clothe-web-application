import { Button, Modal } from "antd";
import { CiCircleInfo } from "react-icons/ci";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string[];
  onOk: () => void;
  onClose: () => void;
  variant?: "confirm" | "delete";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  variant = "confirm",
  ...props
}) => {
  if (!props.isOpen) return null;
  return (
    <Modal
      open={props.isOpen}
      onOk={props.onOk}
      onClose={props.onClose}
      closeIcon={false}
      width={480}
      footer={[
        <Button
          key="back"
          onClick={props.onClose}
          className="bg-[#F0F0F0] !text-text-1 hover:!bg-white hover:!border hover:!border-text-1"
        >
          ยกเลิก
        </Button>,
        <Button
          key="submit"
          onClick={props.onOk}
          className={`${
            variant === "confirm"
              ? "bg-primaryblue-300 !text-white hover:!bg-primaryblue-100 hover:!border hover:!border-primaryblue-300"
              : "bg-customred-1 !text-white hover:!bg-red-600 hover:!border hover:!border-customred-1"
          }`}
        >
          {variant === "confirm" ? "ยืนยัน" : "ลบออก"}
        </Button>,
      ]}
    >
      <div className="flex flex-row gap-4 pb-4">
        <CiCircleInfo
          className={`size-8 ${
            variant === "confirm" ? "text-primaryblue-300" : "text-customred-1"
          }`}
        />
        <div>
          <h4 className="text-text-1 font-medium text-2xl"> {props.title} </h4>
          <div className="mt-4 text-text-1 font-normal text-[16px]">
            {props.message.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
