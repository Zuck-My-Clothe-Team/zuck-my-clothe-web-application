import { Button, Input, Select } from "antd";
import { ColumnsType } from "antd/es/table";
import { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { AiTwotoneDelete } from "react-icons/ai";
import { BsTelephoneFill } from "react-icons/bs";
import { useParams } from "react-router-dom";
import {
  DeleteEmployee,
  DeleteUser,
  GetAllUsers,
  GetBranchEmployee,
} from "../../api/users.api";
import TableInfo from "../../components/Table";
import { ToastNotification } from "../../components/Toast/Toast";
import { useAuth } from "../../context/auth.context";
import {
  ContractType,
  IUser,
  Role,
  UserDetail,
} from "../../interface/userdetail.interface";
import LoadingPage from "../LoadingPage";

const CreateUserModal = lazy(
  () => import("../../components/Modal/createUser.modal")
);
const ConfirmModal = lazy(
  () => import("../../components/Modal/confirmation.modal")
);

const UsersManagePage = () => {
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<
    "Client" | "SuperAdmin" | "BranchManager" | ""
  >("");
  const [datasource, setDatasource] = useState<IUser[]>([]);
  const [filterData, setFilterData] = useState<IUser[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [openCreateUserModal, setOpenCreateUserModal] =
    useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [userToBeDelete, setUserToBeDelete] = useState<IUser | null>(null);

  const columns: ColumnsType<IUser> = [
    {
      title: "ลำดับ",
      key: "key",
      dataIndex: "key",
      render: (key: number) => key + 1,
    },
    {
      title: "ชื่อ",
      render: (record: UserDetail) => (
        <div className="flex flex-row gap-x-4">
          {record.firstname} {record.lastname}
        </div>
      ),
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
      responsive: ["lg" as const],
    },
    ...(auth?.authContext.role === Role.SuperAdmin
      ? [
          {
            title: "สาขา",
            width: "25%",
            render: (data: IUser) => {
              return (
                <div>
                  {!data.branch || data.branch.length === 0
                    ? "-"
                    : data.branch.map((branch) => (
                        <div className="my-1" key={branch.branch_id}>
                          <span className={`text-sm py-1`}>
                            {branch.branch_name}
                          </span>
                        </div>
                      ))}
                </div>
              );
            },
          },
        ]
      : []),
    {
      title: "ตำแหน่ง",
      width: "20%",
      sorter: (a: IUser, b: IUser) => a.role.localeCompare(b.role),
      render: (data: IUser) => {
        return (
          <div>
            {auth?.authContext.role === Role.SuperAdmin && (
              <div className="my-5 text-center">
                <div
                  className={`text-sm lg:text-[16px] rounded-full py-0.5
                      ${
                        data.role === Role.Client
                          ? "text-[#219506] bg-[#B0FFC8]"
                          : data.role === Role.Employee
                          ? "text-customred-1 bg-[#FFC2BB]"
                          : data.role === Role.BranchManager
                          ? "text-primaryblue-300 bg-secondaryblue-100"
                          : data.role === Role.SuperAdmin
                          ? "text-[#cb11ff] bg-[#e9b3ff]"
                          : ""
                      }`}
                >
                  {data.role === Role.Client && "ลูกค้า"}
                  {data.role === Role.Employee && "พนักงาน"}
                  {data.role === Role.BranchManager && "ผู้จัดการสาขา"}
                  {data.role === Role.SuperAdmin && "ผู้ดูแลระบบ"}
                </div>
              </div>
            )}
            {auth?.authContext.role === Role.BranchManager && (
              <div>
                {data.contracts?.map((contract) => (
                  <div className="my-5 text-center">
                    <span
                      key={contract.contract_id}
                      className={`text-sm lg:text-[16px] py-1 rounded-full 
                      ${
                        contract.position_id === ContractType.Worker
                          ? "text-[#219506] bg-[#B0FFC8] px-3 lg:px-4"
                          : "text-customred-1 bg-[#FFC2BB] px-2 lg:px-3"
                      }`}
                    >
                      {contract.position_id === ContractType.Worker
                        ? "พนักงาน"
                        : "คนส่งของ"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      width: "15%",
      render: (data: IUser, __: unknown, index: number) => (
        <div
          className="flex flex-col lg:flex-row gap-4 text-primaryblue-100 justify-center"
          key={index}
        >
          <BsTelephoneFill
            className="size-6 cursor-pointer"
            onClick={() => {
              ToastNotification.info({
                config: {
                  message: "คัดลอกเบอร์โทรศัพท์สำเร็จ",
                  description: `ทำการคัดลอกเบอร์โทรศัพท์ของ ${data.firstname} ${data.lastname}`,
                },
              });
              navigator.clipboard.writeText(data.phone);
            }}
          />
          <AiTwotoneDelete
            className="size-6 cursor-pointer"
            onClick={() => {
              setUserToBeDelete(data);
              setOpenDeleteModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  const fetchAllUsers = useCallback(async () => {
    try {
      let result;
      if (auth?.authContext.role === Role.SuperAdmin) {
        result = await GetAllUsers();
      }
      if (auth?.authContext.role === Role.BranchManager && branch_id) {
        result = await GetBranchEmployee(branch_id);
      }

      if (result?.status !== 200 && result?.status !== 204)
        throw new Error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      let usersData: IUser[] = [];
      if (result.data) {
        usersData = result.data;
      }
      const mappedData = usersData.map((data, index) => {
        return {
          ...data,
          key: index,
        };
      });

      setFilterData(mappedData);
      setDatasource(mappedData);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, [auth?.authContext.role, branch_id]);

  const searchUser = useCallback(
    (value: string) => {
      const filterData = datasource.filter((data) => {
        const matchSearch =
          data.firstname.toLowerCase().includes(value.toLowerCase()) ||
          data.lastname.toLowerCase().includes(value.toLowerCase()) ||
          data.email.toLowerCase().includes(value.toLowerCase()) ||
          (data.branch &&
            data.branch.some((branch) =>
              branch.branch_name.toLowerCase().includes(value.toLowerCase())
            ));

        const matchesRole = selectedRole ? data.role === selectedRole : true;

        return matchSearch && matchesRole;
      });
      setFilterData(filterData);
    },
    [datasource, selectedRole]
  );

  useMemo(async () => {
    await fetchAllUsers();
  }, [fetchAllUsers]);

  useEffect(() => {
    searchUser(searchValue);
  }, [searchValue, selectedRole, searchUser]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <h3 className="text-text-1 text-4xl py-4">ระบบจัดการพนักงาน</h3>
      <section className="flex flex-col lg:flex-row justify-between py-6 lg:px-6">
        <div className="flex flex-col lg:flex-row items-center w-full lg:w-2/5 mb-4 lg:mb-0">
          <Input
            placeholder="ค้นหาชื่อพนักงาน, สาขา"
            size="large"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            className="mb-4 lg:mb-0 lg:mr-4 w-full lg:w-auto"
          />
          {/* <Button type="primary" size="large" className="w-full lg:w-auto">
            <FaSearch className="text-white size-4" />
          </Button> */}
        </div>
        <div className="flex flex-col lg:flex-row justify-between w-full lg:w-2/5 gap-x-4">
          <Select
            className="w-full lg:w-1/2 mb-4 lg:mb-0"
            placeholder="ตำแหน่ง"
            size="large"
            onChange={(value) => {
              setSelectedRole(value);
            }}
          >
            <Select.Option value="">ทั้งหมด</Select.Option>
            {Object.values(Role).map((role) => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            size="large"
            className="w-full lg:w-auto"
            onClick={() => {
              setOpenCreateUserModal(true);
            }}
          >
            + เพิ่มพนักงาน
          </Button>
        </div>
      </section>
      <TableInfo columns={columns} loading={loading} dataSource={filterData} />
      <ConfirmModal
        isOpen={openDeleteModal}
        title="โปรดตรวจสอบก่อนทำการลบ"
        message={[
          `คุณต้องการลบข้อมูลนี้ใช่หรือไม่ ${userToBeDelete?.firstname} ${userToBeDelete?.lastname}`,
          "คุณมั่นใจแล้วใช่ไหมว่าต้องการลบออกจากระบบ",
        ]}
        onOk={async () => {
          setLoadingDelete(true);
          setLoadingDelete(true);
          try {
            if (!userToBeDelete) throw new Error("ไม่พบข้อมูลสาขา");
            let result;
            if (auth?.authContext.role === Role.BranchManager && branch_id) {
              result = await DeleteEmployee(branch_id, userToBeDelete.user_id);
            } else if (auth?.authContext.role === Role.SuperAdmin) {
              result = await DeleteUser(userToBeDelete.user_id);
            }
            if (!result || result.status !== 200)
              throw new Error("เกิดข้อผิดพลาด");
            setOpenDeleteModal(false);
            setLoadingDelete(false);
            setDatasource((prev) =>
              prev.filter((data) => data.user_id !== userToBeDelete.user_id)
            );
            ToastNotification.success({
              config: {
                message: "ลบข้อมูลสำเร็จ",
                description: `ลบข้อมูล ${userToBeDelete.firstname} ${userToBeDelete.lastname} ออกจากระบบ`,
              },
            });
          } catch (error) {
            ToastNotification.error({
              config: {
                message: "ไม่สามารถลบข้อมูลได้",
                description: `เกิดข้อผิดพลาด: ${error}`,
              },
            });
            console.error(error);
          }
        }}
        onClose={() => setOpenDeleteModal(false)}
        variant="delete"
        loading={loadingDelete}
      />
      <CreateUserModal
        isOpen={openCreateUserModal}
        onClose={() => {
          setOpenCreateUserModal(false);
        }}
        fetchUser={async () => await fetchAllUsers()}
      />
    </>
  );
};
export default UsersManagePage;
