import { Form, Input } from "antd";
import { useState } from "react";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuUser2 } from "react-icons/lu";
import { Login } from "../api/auth.api";
import { IUserDetail } from "../interface/userdetail.interface";
import { axiosInstance } from "../utils/axiosInstance";
import { SwalError, SwalSuccess } from "../utils/swal";

const LoginForm = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const response = await Login(values.email, values.password);
      console.log(response);
      const userDetail: IUserDetail = response;
      localStorage.setItem("accessToken", userDetail.token);
      axiosInstance.defaults.headers.Authorization = `Bearer ${userDetail.token}`;
      SwalSuccess("เข้าสู่ระบบสำเร็จ", "กำลังเปลี่ยนเส้นทาง");
      window.location.reload();
      setIsLoading(false);
    } catch (err) {
      SwalError("เข้าสู่ระบบไม่สำเร็จ", "กรุณาลองใหม่ภายหลัง");
      setIsLoading(false);
      throw new Error("Failed : cannot login." + err);
    }
  };
  return (
    <div className="w-full">
      <Form form={form} name="login" onFinish={onFinish} scrollToFirstError>
        <Form.Item
          name="email"
          hasFeedback
          rules={[
            {
              type: "email",
              message: "The input is not valid e-mail!",
            },
            {
              required: true,
              message: "Please input your e-mail!",
            },
          ]}
        >
          <Input
            name="email"
            size="large"
            prefix={<LuUser2 className="text-primary" />}
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<IoLockClosedOutline className="text-primary" />}
            placeholder="Password"
          />
        </Form.Item>

        <div className="flex flex-row justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-sm text-lg disabled:bg-blue-300/60"
          >
            Sign in
          </button>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
