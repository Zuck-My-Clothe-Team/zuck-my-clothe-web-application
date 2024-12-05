import { Breakpoint, Button, Form, Input, Select } from "antd";
import { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { GetAllBranch } from "../../api/branch.api";
import {
  DeleteMachine,
  GetAllMachine,
  GetAllMachineByBranch,
  UpdateMachineLabel,
  UpdateMachineStatus,
} from "../../api/machine.api";
import TableInfo from "../../components/Table";
import { useAuth } from "../../context/auth.context";
import { IBranch } from "../../interface/branch.interface";
import { IMachine, MachineType } from "../../interface/machine.interface";
import { Role } from "../../interface/userdetail.interface";
import { ToastNotification } from "../../components/Toast/Toast";
import LoadingPage from "../LoadingPage";

const ConfirmModal = lazy(
  () => import("../../components/Modal/confirmation.modal")
);
const CreateMachineModal = lazy(
  () => import("../../components/Modal/createMachine.modal")
);

const MachineManagePage = () => {
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
  const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
  const [branchData, setBranchData] = useState<IBranch[]>([]);
  const [datasource, setDatasource] = useState<IMachine[]>([]);
  const [filterData, setFilterData] = useState<IMachine[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [machineType, setMachineType] = useState<MachineType | null>(null);
  const [machineStatus, setMachineStatus] = useState<boolean | null>(null);
  const [machineAvaliable, setMachineAvaliable] = useState<boolean | null>(
    null
  );
  const [openCreateMachineModal, setOpenCreateMachineModal] =
    useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openUpdateStatusModal, setOpenUpdateStatusModal] =
    useState<boolean>(false);
  const [machineToBeUpdate, setMachineToBeUpdate] = useState<IMachine | null>(
    null
  );
  const [updateStatusValue, setUpdateStatusValue] = useState<boolean>(false);
  const [editMachineLabel, setEditMachineLabel] = useState<string | null>(null);

  const updateMachineLabel = async (machine_id: string, newLabel: number) => {
    setLoadingUpdate(true);
    try {
      const result = await UpdateMachineLabel(machine_id, newLabel);
      if (result.status !== 200) throw new Error(result.statusText);
      setDatasource((prev) =>
        prev.map((data) =>
          data.machine_serial === machine_id
            ? {
                ...data,
                machine_label: `${
                  data.machine_type === MachineType.WASHER
                    ? "เครื่องซักที่"
                    : "เครื่องอบที่"
                } ${newLabel}`,
              }
            : data
        )
      );
      ToastNotification.success({
        config: {
          message: "อัพเดทหมายเลขเครื่องสำเร็จ",
          description: `อัพเดทหมายเลขเครื่อง ${machine_id} สำเร็จ`,
        },
      });
      setLoadingUpdate(false);
    } catch (error) {
      ToastNotification.error({
        config: {
          message: "ไม่สามารถอัพเดทหมายเลขเครื่องได้",
          description: `เกิดข้อผิดพลาด: ${error}`,
        },
      });
      console.error(error);
    }

    setLoading(false);
    setEditMachineLabel(null);
  };

  const columns = [
    {
      title: "รหัสเครื่อง",
      dataIndex: "machine_serial",
      key: "machine_serial",
    },
    ...(auth?.authContext.role === Role.SuperAdmin
      ? [
          {
            title: "สาขา",
            dataIndex: "branch_id",
            key: "branch_id",
            render: (branch_id: string) => {
              return (
                <div>
                  {
                    branchData.find((branch) => branch.branch_id === branch_id)
                      ?.branch_name
                  }
                </div>
              );
            },
          },
        ]
      : []),
    {
      title: "หมายเลขเครื่อง",
      defaultSortOrder: "ascend" as const,
      sorter: (a: IMachine, b: IMachine) =>
        String(a.machine_label).localeCompare(String(b.machine_label)),
      render: (data: IMachine) => {
        const isEditing = editMachineLabel === data.machine_serial;
        return (
          <div className="flex flex-row gap-2 items-center">
            {isEditing ? (
              <>
                {data.machine_type === MachineType.WASHER
                  ? "เครื่องซักที่"
                  : "เครื่องอบที่"}
                <Form.Item
                  rules={[
                    {
                      pattern: /^[0-9]{1,2}$/,
                      message: "กรุณากรอกเฉพาะตัวเลข",
                    },
                  ]}
                >
                  <Input
                    defaultValue={String(data.machine_label).split(" ")[1]}
                    onBlur={(e) => {
                      updateMachineLabel(
                        data.machine_serial,
                        Number(e.target.value)
                      );
                    }}
                    minLength={1}
                    maxLength={2}
                    disabled={loading}
                  />
                </Form.Item>
                <RxCross2
                  className="size-4 cursor-pointer"
                  onClick={() => {
                    setEditMachineLabel(null);
                  }}
                />
              </>
            ) : (
              <>
                {data.machine_label ? data.machine_label : "-"}
                <AiFillEdit
                  className="size-4 cursor-pointer"
                  onClick={() => setEditMachineLabel(data.machine_serial)}
                />
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "ประเภทเครื่อง",
      dataIndex: "machine_type",
      responsive: ["xl" as Breakpoint],
      render: (machine_type: string) => {
        return (
          <div>
            {machine_type === "Washer" ? "เครื่องซักผ้า" : "เครื่องอบผ้า"}
          </div>
        );
      },
    },
    {
      title: "น้ำหนักเครื่อง",
      dataIndex: "weight",
      key: "weight",
    },
    ...(auth?.authContext.role !== Role.SuperAdmin
      ? [
          {
            title: "กำลังใช้งาน",
            render: (row: IMachine, __: unknown, index: number) => {
              return (
                <div key={index}>{row.finished_at ? "ไม่ว่าง" : "ว่าง"}</div>
              );
            },
          },
        ]
      : []),
    {
      title: "สถานะ",
      width: "10%",
      render: (row: IMachine) => {
        const selectClass = row.is_active ? "select-active" : "select-inactive";
        return (
          <>
            <Select
              className={`${selectClass}`}
              placeholder="ตำแหน่ง"
              size="large"
              onChange={(value: boolean) => {
                setUpdateStatusValue(value);
                setOpenUpdateStatusModal(true);
                setMachineToBeUpdate(row);
              }}
              value={row.is_active ? true : false}
              disabled={loading}
              loading={loading}
            >
              <Select.Option value={true}>เปิดการทำงาน</Select.Option>
              <Select.Option value={false}>ปิดการทำงาน</Select.Option>
            </Select>
          </>
        );
      },
    },
    {
      width: "2.5%",
      render: (data: IMachine, __: unknown, index: number) => (
        <div className="flex flex-row gap-x-4 text-primaryblue-100" key={index}>
          <AiTwotoneDelete
            className="size-6 cursor-pointer"
            onClick={() => {
              setMachineToBeUpdate(data);
              setOpenDeleteModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  const fetchAllMachines = useCallback(async () => {
    try {
      setLoading(true);
      let resultData;
      if (auth?.authContext.role === Role.SuperAdmin) {
        resultData = await GetAllMachine();
      } else {
        resultData = await GetAllMachineByBranch(branch_id!);
      }
      if (resultData.status !== 200)
        throw new Error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");

      const machineData: IMachine[] = resultData.data;
      setFilterData(machineData);
      setDatasource(machineData);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, [auth?.authContext.role, branch_id]);

  const fetchAllBranchs = useCallback(async () => {
    if (auth?.authContext.role === Role.SuperAdmin) {
      try {
        setLoading(true);
        const result = await GetAllBranch();
        if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");

        const branchData: IBranch[] = result.data;
        setBranchData(branchData);

        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  }, [auth?.authContext.role]);

  const searchMachine = useCallback(
    (value: string) => {
      if (loading || !datasource) return;
      let filterData = datasource.filter((data) =>
        data.machine_serial.toLowerCase().includes(value.toLowerCase())
      );
      if (machineType) {
        filterData = filterData.filter(
          (data) => data.machine_type === machineType
        );
      }
      if (machineStatus !== null) {
        filterData = filterData.filter((data) => {
          return data.is_active == Boolean(machineStatus);
        });
      }
      if (machineAvaliable !== null) {
        filterData = filterData.filter((data) => {
          return (
            (data.finished_at !== null ? false : true) === machineAvaliable
          );
        });
      }
      setFilterData(filterData);
    },
    [datasource, machineStatus, machineType, loading, machineAvaliable]
  );

  useMemo(() => {
    Promise.all([fetchAllBranchs(), fetchAllMachines()]);
  }, [fetchAllMachines, fetchAllBranchs]);

  useEffect(() => {
    searchMachine(searchValue);
  }, [searchValue, searchMachine]);

  if (loading) return <LoadingPage />;

  return (
    <>
      <h3 className="text-text-1 text-4xl py-4">ระบบจัดการเครื่องซัก/อบ</h3>
      <section className="flex flex-col lg:flex-row justify-between my-4  py-6 lg:px-6">
        <Input
          placeholder="ค้นหาเลขเครื่อง"
          size="large"
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
          className="mb-4 lg:mb-0 lg:mr-4 w-full md:w-auto"
        />
        <div className="flex flex-col lg:flex-row justify-between gap-x-4">
          <Select
            className="w-full lg:w-1/2 mb-4 lg:mb-0"
            placeholder="ประเภทเครื่อง"
            size="large"
            onChange={(value) => {
              setMachineType(value);
            }}
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            <Select.Option value="Washer">เครื่องซักผ้า</Select.Option>
            <Select.Option value="Dryer">เครื่องอบผ้า</Select.Option>
          </Select>
          <Select
            className="w-full lg:w-1/2 mb-4 lg:mb-0"
            placeholder="กำลังใช้งาน"
            size="large"
            onChange={(value: string) => {
              setMachineAvaliable(value === "" ? null : Boolean(value));
            }}
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            <Select.Option value={true}>ว่าง</Select.Option>
            <Select.Option value={false}>ไม่ว่าง</Select.Option>
          </Select>
          <Select
            className="w-full lg:w-1/2 mb-4 lg:mb-0"
            placeholder="สถานะเครื่อง"
            size="large"
            onChange={(value: string) => {
              setMachineStatus(value === "" ? null : Boolean(value));
            }}
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            <Select.Option value={true}>เปิดใช้งาน</Select.Option>
            <Select.Option value={false}>ปิดใช้งาน</Select.Option>
          </Select>
          <Button
            type="primary"
            size="large"
            className="w-full md:w-auto"
            onClick={() => {
              setOpenCreateMachineModal(true);
            }}
          >
            + เพิ่มเครื่อง
          </Button>
        </div>
      </section>
      <TableInfo columns={columns} loading={loading} dataSource={filterData} />
      <ConfirmModal
        isOpen={openUpdateStatusModal}
        title={`${updateStatusValue ? "เปิด" : "ปิด"}การทำงาน`}
        message={[
          `คุณกำลังทำการเปลี่ยนสถานะการทำงาน ${machineToBeUpdate?.machine_serial}`,
          "คุณมั่นใจแล้วใช่ไหมว่าต้องการปิดการทำงาน",
        ]}
        onOk={async () => {
          setLoadingUpdate(true);
          try {
            const result = await UpdateMachineStatus(
              machineToBeUpdate!.machine_serial,
              updateStatusValue
            );
            if (result.status !== 200) throw new Error(result.statusText);
            setDatasource((prev) =>
              prev.map((data) =>
                data.machine_serial === machineToBeUpdate?.machine_serial
                  ? { ...data, is_active: updateStatusValue }
                  : data
              )
            );
            setLoadingUpdate(false);
            setMachineToBeUpdate(null);
            setOpenUpdateStatusModal(false);
            ToastNotification.success({
              config: {
                message: "เปลี่ยนสถานะเครื่องสำเร็จ",
                description: `เปลี่ยนสถานะเครื่อง 
                ${machineToBeUpdate?.machine_serial} จาก 
                ${updateStatusValue ? "ปิด" : "เปิด"} เป็น 
                ${updateStatusValue ? "เปิด" : "ปิด"} สำเร็จ`,
              },
            });
          } catch (error) {
            ToastNotification.error({
              config: {
                message: "ไม่สามารถเปลี่ยนสถานะได้",
                description: `เกิดข้อผิดพลาด: ${error}`,
              },
            });
            console.error(error);
          }
        }}
        onClose={() => {
          setMachineToBeUpdate(null);
          setOpenUpdateStatusModal(false);
        }}
        variant="confirm"
        loading={loadingUpdate}
      />
      <ConfirmModal
        isOpen={openDeleteModal}
        title="โปรดตรวจสอบก่อนทำการลบ"
        message={[
          `คุณต้องการลบข้อมูลนี้ใช่หรือไม่ ${machineToBeUpdate?.machine_serial}`,
          "คุณมั่นใจแล้วใช่ไหมว่าต้องการลบออกจากระบบ",
        ]}
        onOk={async () => {
          setLoadingDelete(true);
          try {
            if (!machineToBeUpdate) throw new Error("ไม่พบข้อมูลเครื่อง");
            const result = await DeleteMachine(
              machineToBeUpdate.machine_serial
            );
            if (result.status !== 200) throw new Error(result.statusText);
            setDatasource((prev) =>
              prev.filter(
                (data) =>
                  data.machine_serial !== machineToBeUpdate.machine_serial
              )
            );
            setOpenDeleteModal(false);
            setLoadingDelete(false);
            ToastNotification.success({
              config: {
                message: "ลบเครื่องสำเร็จ",
                description: `ลบเครื่อง ${machineToBeUpdate?.machine_serial} สำเร็จ`,
              },
            });
          } catch (error) {
            console.error(error);
            ToastNotification.error({
              config: {
                message: "ไม่สามารถลบเครื่องได้",
                description: `เกิดข้อผิดพลาด: ${error}`,
              },
            });
          }
        }}
        onClose={() => {
          setMachineToBeUpdate(null);
          setOpenDeleteModal(false);
        }}
        variant="delete"
        loading={loadingDelete}
      />
      <CreateMachineModal
        isOpen={openCreateMachineModal}
        onClose={() => {
          setOpenCreateMachineModal(false);
        }}
      />
    </>
  );
};
export default MachineManagePage;
