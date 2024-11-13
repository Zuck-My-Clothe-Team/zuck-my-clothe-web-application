import { notification } from "antd";
import { ArgsProps } from "antd/es/notification";

export const ToastNotification = {
  success: ({
    config,
    placement = "bottomRight",
  }: {
    config: ArgsProps;
    placement?:
      | "bottomRight"
      | "top"
      | "topLeft"
      | "topRight"
      | "bottom"
      | "bottomLeft";
  }) => {
    return notification.success({
      message: (
        <div className="text-[#219506] text-lg font-bold">{config.message}</div>
      ),
      description: config.description,
      placement: placement,
      className: "bg-[#DFF0D8]",
    });
  },
  error: ({
    config,
    placement = "bottomRight",
  }: {
    config: ArgsProps;
    placement?:
      | "bottomRight"
      | "top"
      | "topLeft"
      | "topRight"
      | "bottom"
      | "bottomLeft";
  }) => {
    return notification.error({
      description: config.description,
      placement: placement,
      className: "bg-[#FFC2BB]",
      ...config,
    });
  },
  warning: ({
    config,
    placement = "bottomRight",
  }: {
    config: ArgsProps;
    placement?:
      | "bottomRight"
      | "top"
      | "topLeft"
      | "topRight"
      | "bottom"
      | "bottomLeft";
  }) => {
    return notification.warning({
      message: (
        <div className="text-[#FFA800] text-lg font-bold">{config.message}</div>
      ),
      description: config.description,
      placement: placement,
      className: "bg-[#FFF4CE]",
    });
  },
  info: ({
    config,
    placement = "bottomRight",
  }: {
    config: ArgsProps;
    placement?:
      | "bottomRight"
      | "top"
      | "topLeft"
      | "topRight"
      | "bottom"
      | "bottomLeft";
  }) => {
    return notification.info({
      message: (
        <div className="text-[#0056B3] text-lg font-bold">{config.message}</div>
      ),
      description: config.description,
      placement: placement,
      className: "bg-[#D9EDF7]",
    });
  },
};
