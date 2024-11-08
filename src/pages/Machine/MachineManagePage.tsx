import { Button, Form, Input, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import {
  DeleteMachine,
  GetAllMachine,
  GetAllMachineByBranch,
  UpdateMachineLabel,
  UpdateMachineStatus,
} from "../../api/machine.api";
import { ConfirmModal } from "../../components/Modal/confirmation.modal";
import TableInfo from "../../components/Table";
import { IMachine, MachineType } from "../../interface/machine.interface";
import { GetAllBranch } from "../../api/branch.api";
import { IBranch } from "../../interface/branch.interface";
import { useAuth } from "../../context/auth.context";
import { Role } from "../../interface/userdetail.interface";
import { useParams } from "react-router-dom";
import { CreateMachineModal } from "../../components/Modal/createMachine.modal";
import { RxCross2 } from "react-icons/rx";

const MachineManagePage = () => {
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [branchData, setBranchData] = useState<IBranch[]>([]);
  const [datasource, setDatasource] = useState<IMachine[]>([]);
  const [filterData, setFilterData] = useState<IMachine[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [machineType, setMachineType] = useState<MachineType | null>(null);
  const [machineStatus, setMachineStatus] = useState<boolean | null>(null);
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
    setLoading(true);
    try {
      const result = await UpdateMachineLabel(machine_id, newLabel);
      if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");
      fetchAllMachines();
    } catch (error) {
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
      key: "machine_type",
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
    {
      title: "สถานะ",
      render: (row: IMachine) => {
        const selectClass = row.is_active ? "select-active" : "select-inactive";
        return (
          <>
            <Select
              className={`w-1/2 ${selectClass}`}
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
          console.log(Boolean(machineStatus));
          return data.is_active == Boolean(machineStatus);
        });
      }
      setFilterData(filterData);
    },
    [datasource, machineStatus, machineType, loading]
  );

  useMemo(() => {
    Promise.all([fetchAllBranchs(), fetchAllMachines()]);
  }, [fetchAllMachines, fetchAllBranchs]);

  useEffect(() => {
    searchMachine(searchValue);
  }, [searchValue, searchMachine]);

  return (
    <>
      <h3 className="text-text-1 text-4xl py-4">ระบบจัดการเครื่องซัก/อบ</h3>
      <section className="flex flex-row justify-between gap-x-4 py-6 px-6">
        <div className="flex flex-row items-center w-full">
          <Input
            placeholder="ค้นหาเลขเครื่อง"
            size="large"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
          <Button type="primary" size="large">
            <FaSearch className="text-white size-4" />
          </Button>
        </div>
        <Select
          className="w-1/2"
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
          className="w-1/2"
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
          onClick={() => {
            setOpenCreateMachineModal(true);
          }}
        >
          + เพิ่มเครื่อง
        </Button>
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
          try {
            setLoading(true);
            const result = await UpdateMachineStatus(
              machineToBeUpdate!.machine_serial,
              updateStatusValue
            );
            if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");
            await fetchAllMachines();
            setLoading(false);
            setMachineToBeUpdate(null);
            setOpenUpdateStatusModal(false);
          } catch (error) {
            console.error(error);
          }
        }}
        onClose={() => {
          setMachineToBeUpdate(null);
          setOpenUpdateStatusModal(false);
        }}
        variant="confirm"
        loading={loading}
      />
      <ConfirmModal
        isOpen={openDeleteModal}
        title="โปรดตรวจสอบก่อนทำการลบ"
        message={[
          `คุณต้องการลบข้อมูลนี้ใช่หรือไม่ ${machineToBeUpdate?.machine_serial}`,
          "คุณมั่นใจแล้วใช่ไหมว่าต้องการลบออกจากระบบ",
        ]}
        onOk={async () => {
          try {
            setLoading(true);
            if (!machineToBeUpdate) throw new Error("ไม่พบข้อมูลสาขา");
            const result = await DeleteMachine(
              machineToBeUpdate.machine_serial
            );
            if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");
            await fetchAllMachines();
            setOpenDeleteModal(false);
            setLoading(false);
          } catch (error) {
            console.error(error);
          }
        }}
        onClose={() => {
          setMachineToBeUpdate(null);
          setOpenDeleteModal(false);
        }}
        variant="delete"
        loading={loading}
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
