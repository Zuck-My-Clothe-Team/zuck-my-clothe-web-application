import { Spin } from "antd";

const LoadingSpinPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spin size="large" />
    </div>
  );
};

export default LoadingSpinPage;
