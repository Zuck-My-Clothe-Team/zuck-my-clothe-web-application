import { Button, Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { CreateUser } from "../../api/users.api";
import { useAuth } from "../../context/auth.context";
import { Role, UserDetail } from "../../interface/userdetail.interface";
import { ToastNotification } from "../Toast/Toast";

type CreateUserModalType = {
  isOpen: boolean;
  onClose: () => unknown;
  fetchUser: () => Promise<void>;
};

const CreateUserModal: React.FC<CreateUserModalType> = (props) => {
  const [form] = Form.useForm();
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: UserDetail) => {
    setLoading(true);
    try {
      const result = await CreateUser(values);
      if (!result || result.status !== 201) throw new Error("เกิดข้อผิดพลาด");
      form.resetFields();
      props.onClose();
      setLoading(false);
      ToastNotification.success({
        config: {
          message: "เพิ่มข้อมูลสำเร็จ",
          description: `ข้อมูลของ ${
            auth?.authContext.role === Role.SuperAdmin ? "บัญชีใหม่" : "พนักงาน"
          } ถูกเพิ่มเข้าสู่ระบบแล้ว`,
        },
      });
      await props.fetchUser();
    } catch (error) {
      ToastNotification.error({
        config: {
          message: "ไม่สามารถลบข้อมูลได้",
          description: `เกิดข้อผิดพลาด: ${error}`,
        },
      });
      console.log(error);
    }
  };

  useEffect(() => {
    if (!props.isOpen) {
      form.resetFields();
      setLoading(false);
    }
  }, [form, props.isOpen]);

  return (
    <Modal
      title={
        <div className="text-center">
          <h4 className="font-medium text-3xl">ลงทะเบียนพนักงาน</h4>
        </div>
      }
      open={props.isOpen}
      onCancel={props.onClose}
      width={480}
      footer={null}
      centered
    >
      <div className="my-4">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="flex flex-col gap-y-4">
            <Form.Item<UserDetail>
              label="ชื่อ"
              name="firstname"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกชื่อ",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="ชื่อ"
                disabled={loading}
              />
            </Form.Item>
            <Form.Item<UserDetail>
              label="นามสกุล"
              name="lastname"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกนามสกุล",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="นามสกุล"
                disabled={loading}
              />
            </Form.Item>
            <Form.Item<UserDetail>
              label="ตำแหน่ง"
              name="role"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกเลือกตำแหน่ง",
                },
              ]}
            >
              <Select
                className="w-full mt-2 text-sm h-8"
                placeholder="ตำแหน่ง"
                disabled={loading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {Object.values(Role)
                  .filter(
                    (item) =>
                      (auth?.authContext.role === Role.BranchManager &&
                        item === Role.Employee) ||
                      auth?.authContext.role === Role.SuperAdmin
                  )
                  .map((role, index) => (
                    <Select.Option key={index} value={role}>
                      {role}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item<UserDetail>
              label="เบอร์โทร"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกเบอร์โทร",
                },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "กรุณากรอกเบอร์โทร 10 หลัก",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="เบอร์โทร"
                minLength={10}
                maxLength={10}
                disabled={loading}
              />
            </Form.Item>
            <hr />
            <Form.Item<UserDetail>
              label="อีเมล"
              name="email"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกเลือกอีเมล",
                },
                {
                  type: "email",
                  message: "กรุณากรอกอีเมลที่ถูกต้อง",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="อีเมล"
                disabled={loading}
              />
            </Form.Item>
            <Form.Item<UserDetail>
              label="รหัสผ่าน"
              name="password"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกรหัสผ่าน",
                },
                {
                  min: 8,
                  message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
                },
              ]}
            >
              <Input.Password
                className="w-full mt-2 text-sm h-8"
                placeholder="รหัสผ่าน"
                disabled={loading}
              />
            </Form.Item>

            <Button
              htmlType="submit"
              type="primary"
              disabled={loading}
              className="disabled:!bg-primaryblue-300/90 disabled:!border-disabled disabled:!text-white"
            >
              {loading ? "กำลังเพิ่มสมาชิกใหม่..." : "เพิ่มสมาชิกใหม่"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
