import { Form, Input } from "antd";
import React, { useMemo } from "react";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuUser2 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { Login } from "../api/auth.api";
import { useAuth } from "../context/auth.context";
import { IUserDetail, Role } from "../interface/userdetail.interface";
import { axiosInstance } from "../utils/axiosInstance";
import { SwalError } from "../utils/swal";
import { GetEmployeeContractsByUserID } from "../api/employee-contract.api";

type LoadingForm = {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const LoginForm: React.FC<LoadingForm> = ({ isLoading, setIsLoading }) => {
  const [form] = Form.useForm();
  const auth = useAuth();
  const navigate = useNavigate();

  const onFinish = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      const response = await Login(values.email, values.password);
      const userDetail: IUserDetail = response;
      localStorage.setItem("accessToken", userDetail.token);
      axiosInstance.defaults.headers.Authorization = `Bearer ${userDetail.token}`;
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      SwalError("เข้าสู่ระบบไม่สำเร็จ", "กรุณาลองใหม่ภายหลัง");
      setIsLoading(false);
      throw new Error("Failed : cannot login." + err);
    }
  };

  useMemo(async () => {
    if (localStorage.getItem("accessToken")) {
      if (auth?.authContext.role === Role.BranchManager) {
        navigate("/manager/home");
      }
      if (auth?.authContext.role === Role.SuperAdmin) {
        navigate("/admin/dashboard");
      }
      if (auth?.authContext.role === Role.Employee) {
        const result = await GetEmployeeContractsByUserID(
          auth?.authContext.user_id
        );

        if (!result || result.status !== 200) {
          SwalError("เข้าสู่ระบบไม่สำเร็จ", "กรุณาลองใหม่ภายหลัง");
          setIsLoading(false);
          return;
        }

        if (result.data.length === 0) {
          SwalError("ไม่พบข้อมูลสาขา", "กรุณาลองใหม่ภายหลัง");
          setIsLoading(false);
          return;
        } else {
          navigate(`/employee/${result.data[0].branch_id}/order`);
        }
      }
    }
  }, [auth?.authContext.role, navigate]);

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
