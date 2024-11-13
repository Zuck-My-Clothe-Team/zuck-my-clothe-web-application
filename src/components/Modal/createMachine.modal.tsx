import { Button, Form, Input, Modal, Select, Spin } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../context/auth.context";
import { IMachine, MachineType } from "../../interface/machine.interface";
import { GetAllBranch, GetBranchById } from "../../api/branch.api";
import { IBranch } from "../../interface/branch.interface";
import { Role } from "../../interface/userdetail.interface";
import { useParams } from "react-router-dom";
import { CreateMachine } from "../../api/machine.api";

type CreateMachineModalType = {
  isOpen: boolean;
  onClose: () => unknown;
};

const CreateMachineModal: React.FC<CreateMachineModalType> = (props) => {
  const { branch_id } = useParams<{ branch_id: string }>();
  const [form] = Form.useForm();
  const auth = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [branchData, setBranchData] = useState<IBranch[]>([]);

  const onFinish = async (values: IMachine) => {
    setLoading(true);
    try {
      values.weight = Number(values.weight);
      values.machine_label = Number(values.machine_label);
      const result = await CreateMachine(values);
      if (!result || result.status !== 201) throw new Error("เกิดข้อผิดพลาด");
      form.resetFields();
      props.onClose();
      window.location.reload();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllBranch = useCallback(async () => {
    if (auth?.authContext?.role === Role.SuperAdmin) {
      try {
        setLoading(true);
        const result = await GetAllBranch();
        if (!result) throw new Error("ไม่พบข้อมูลสาขา");
        setBranchData(result.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        setLoading(true);
        const result = await GetBranchById(branch_id!);
        if (!result) throw new Error("ไม่พบข้อมูลสาขา");
        setBranchData([result.data]);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  }, [auth?.authContext?.role, branch_id]);

  useMemo(async () => {
    await fetchAllBranch();
  }, [fetchAllBranch]);

  return (
    <Modal
      title={
        <div className="text-center">
          <h4 className="font-medium text-3xl">เพิ่มเครื่องซัก/อบ</h4>
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
            <Form.Item<IMachine>
              label="รหัสเครื่อง"
              name="machine_serial"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกรหัสเครื่อง",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="รหัสเครื่อง"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item<IMachine>
              label="เลขเครื่อง"
              name="machine_label"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกเลขเครื่อง",
                },
                {
                  pattern: /^[0-9]{1,2}$/,
                  message: "กรุณากรอกเฉพาะตัวเลข",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="เลขเครื่อง"
                minLength={1}
                maxLength={2}
                disabled={loading}
              />
            </Form.Item>

            <Form.Item<IMachine>
              label="สาขา"
              name="branch_id"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกสาขา",
                },
              ]}
            >
              <Select
                className="w-full mt-2 text-sm h-8"
                placeholder="สาขา"
                disabled={loading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {branchData.map((branch: IBranch, index: number) => (
                  <Select.Option key={index} value={branch.branch_id}>
                    {branch.branch_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item<IMachine>
              label="ประเภทเครื่อง"
              name="machine_type"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกประเภทเครื่อง",
                },
              ]}
            >
              <Select
                className="w-full mt-2 text-sm h-8"
                placeholder="ประเภทเครื่อง"
                disabled={loading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {Object.values(MachineType).map((item, index: number) => (
                  <Select.Option key={index} value={item}>
                    {item === MachineType.WASHER
                      ? "เครื่องซักผ้า"
                      : "เครื่องอบผ้า"}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item<IMachine>
              label="น้ำหนัก"
              name="weight"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกน้ำหนัก",
                },
              ]}
            >
              <Select
                className="w-full mt-2 text-sm h-8"
                placeholder="น้ำหนัก"
                disabled={loading}
                optionFilterProp="children"
              >
                <Select.Option value={7}>7 kg.</Select.Option>
                <Select.Option value={14}>14 kg.</Select.Option>
                <Select.Option value={21}>21 kg.</Select.Option>
              </Select>
            </Form.Item>

            <Button htmlType="submit" type="primary" disabled={loading}>
              {loading ? <Spin /> : "เพิ่มเครื่องใหม่"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateMachineModal;
