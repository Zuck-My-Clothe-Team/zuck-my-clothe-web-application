import { Form, Input } from "antd";
import { useState } from "react";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuUser2 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { Login } from "../api/auth.api";
import { IUserDetail } from "../interface/userdetail.interface";
import { axiosInstance } from "../utils/axiosInstance";
import { SwalError, SwalSuccess } from "../utils/swal";

const LoginForm = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const response = await Login(values.email, values.password);
      const userDetail: IUserDetail = response;
      localStorage.setItem("accessToken", userDetail.token);
      axiosInstance.defaults.headers.Authorization = `Bearer ${userDetail.token}`;
      SwalSuccess("เข้าสู่ระบบสำเร็จ", "กำลังเปลี่ยนเส้นทาง");
      navigate("home");
      setIsLoading(false);
    } catch (err) {
      SwalError("เข้าสู่ระบบไม่สำเร็จ", "กรุณาลองใหม่ภายหลัง");
      setIsLoading(false);
      throw new Error("Failed : cannot login." + err);
    }
  };
  return (
    <div className="w-full">
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        scrollToFirstError
        layout="vertical"
      >
        <Form.Item
          label="อีเมล"
          name="email"
          hasFeedback
          rules={[
            {
              type: "email",
              message: "กรุณากรอกอีเมลให้ถูกต้อง",
            },
            {
              required: true,
              message: "กรุณากรอกอีเมล",
            },
          ]}
        >
          <Input
            name="email"
            size="large"
            prefix={<LuUser2 className="text-primary" />}
            placeholder="อีเมล"
          />
        </Form.Item>
        <Form.Item
          label="รหัสผ่าน"
          name="password"
          hasFeedback
          rules={[
            {
              required: true,
              message: "กรุณากรอกรหัสผ่าน",
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<IoLockClosedOutline className="text-primary" />}
            placeholder="รหัสผ่าน"
          />
        </Form.Item>

        <div className="flex flex-row justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-sm text-lg disabled:bg-blue-300/60"
          >
            Login
          </button>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
