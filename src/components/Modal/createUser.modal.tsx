import { Button, Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreateUser } from "../../api/users.api";
import { useAuth } from "../../context/auth.context";
import { IContracts } from "../../interface/employee.interface";
import {
  ContractType,
  IUser,
  Role,
} from "../../interface/userdetail.interface";
import { ToastNotification } from "../Toast/Toast";

type CreateUserModalType = {
  isOpen: boolean;
  onClose: () => unknown;
  fetchUser: () => Promise<void>;
};

const CreateUserModal: React.FC<CreateUserModalType> = (props) => {
  const [form] = Form.useForm();
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: IUser) => {
    setLoading(true);
    if (
      (!values.contracts || values.contracts.length === 0) &&
      values.role === Role.Employee
    ) {
      ToastNotification.error({
        config: {
          message: "ไม่สามารถเพิ่มข้อมูลได้",
          description: `กรุณาเลือกประเภทสัญญา`,
        },
      });
      setLoading(false);
      return;
    }

    if (!branch_id && auth?.authContext.role === Role.BranchManager) {
      ToastNotification.error({
        config: {
          message: "ไม่สามารถเพิ่มข้อมูลได้",
          description: `ข้อมูลไม่ครบถ้วน`,
        },
      });
      setLoading(false);
      return;
    }

    if (!auth || !auth.authContext.user_id) {
      setLoading(false);
      return;
    }

    let contracts: IContracts[] = [];

    if (values.contracts && values.contracts.length > 0) {
      contracts = values.contracts.map((contract) => {
        return {
          contract_id: "",
          user_id: "",
          branch_id: branch_id || "",
          position_id: contract.position_id,
          created_by: auth.authContext.user_id,
          created_at: new Date().toISOString(),
          deleted_at: "",
          deleted_by: "",
        };
      });
    }

    values.contracts = contracts;

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
      setLoading(false);
    } catch (error) {
      ToastNotification.error({
        config: {
          message: "ไม่สามารถลบข้อมูลได้",
          description: `เกิดข้อผิดพลาด: ${error}`,
        },
      });
      setLoading(false);
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
            <Form.Item<IUser>
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
            <Form.Item<IUser>
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
            <Form.Item<IUser>
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
                      (auth?.authContext.role === Role.SuperAdmin &&
                        item !== Role.Employee)
                  )
                  .map((role, index) => (
                    <Select.Option key={index} value={role}>
                      {role}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            {auth?.authContext.role === Role.BranchManager && (
              <Form.List name="contracts">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => {
                      return (
                        <div key={field.key}>
                          <div className="grid grid-cols-3 items-end gap-x-4">
                            <Form.Item
                              label="ประเภทสัญญา"
                              name={[field.name, "position_id"]}
                              rules={[
                                {
                                  required: true,
                                  message: "กรุณากรอกเลือกประเภทสัญญา",
                                },
                              ]}
                              className="col-span-2"
                            >
                              <Select
                                className="w-full mt-2 text-sm h-8"
                                placeholder="ประเภทสัญญา"
                                disabled={loading}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  String(option?.children ?? "")
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {Object.values(ContractType).map(
                                  (contract, index) => (
                                    <Select.Option key={index} value={contract}>
                                      {contract}
                                    </Select.Option>
                                  )
                                )}
                              </Select>
                            </Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => remove(field.name)}
                              className="w-full !border !border-customred-1 !text-customred-1 mb-1"
                              disabled={loading}
                            >
                              ลบประเภทสัญญา
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      type="dashed"
                      onClick={() => {
                        if (fields.length < Object.keys(ContractType).length) {
                          add("");
                        } else {
                          ToastNotification.error({
                            config: {
                              message: "ไม่สามารถเพิ่มประเภทสัญญาได้",
                              description:
                                "เนื่องจากเลือกประเภทสัญญาสูงสุดแล้ว",
                              duration: 2,
                            },
                          });
                        }
                      }}
                      className="w-full mt-2 text-sm h-8"
                      disabled={loading}
                    >
                      เพิ่มประเภทสัญญา
                    </Button>
                  </>
                )}
              </Form.List>
            )}
            <Form.Item<IUser>
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
            <Form.Item<IUser>
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
            <Form.Item<IUser>
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
