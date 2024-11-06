import { Button, Input, notification, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { BsTelephoneFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import {
  DeleteUser,
  GetAllUsers,
  GetBranchEmployee,
} from "../../api/users.api";
import { ConfirmModal } from "../../components/Modal/confirmation.modal";
import { CreateUserModal } from "../../components/Modal/createUser.modal";
import TableInfo from "../../components/Table";
import {
  ContractType,
  IUser,
  Role,
  UserDetail,
} from "../../interface/userdetail.interface";
import { useAuth } from "../../context/auth.context";
import { useParams } from "react-router-dom";
import { ColumnsType } from "antd/es/table";

const UsersManagePage = () => {
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
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
      dataIndex: "index",
      key: "index",
      render: (_: string, __: unknown, index: number) => index + 1,
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
              notification.success({
                message: "คัดลอกเบอร์โทรศัพท์สำเร็จ",
                description: `ทำการคัดลอกเบอร์โทรศัพท์ของ ${data.firstname} ${data.lastname}`,
                placement: "bottomRight",
              });
              navigator.clipboard.writeText(data.phone);
            }}
          />
          <AiFillEdit className="size-6 cursor-pointer" />
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

      if (result?.status !== 200)
        throw new Error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      let usersData: IUser[] = [];
      if (result.data) {
        usersData = result.data;
      }

      setFilterData(usersData);
      setDatasource(usersData);

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

  return (
    <>
      <h3 className="text-text-1 text-4xl py-4">ระบบจัดการพนักงาน</h3>
      <section className="flex flex-row justify-between py-6 px-6">
        <div className="flex flex-row items-center w-2/5">
          <Input
            placeholder="ค้นหาชื่อพนักงาน, สาขา"
            size="large"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
          <Button type="primary" size="large">
            <FaSearch className="text-white size-4" />
          </Button>
        </div>
        <div className="flex flex-row justify-between w-2/5 gap-x-4">
          <Select
            className="w-1/2"
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
          try {
            if (!userToBeDelete) throw new Error("ไม่พบข้อมูลสาขา");
            const result = await DeleteUser(userToBeDelete.user_id);
            if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");
            await fetchAllUsers();
            setOpenDeleteModal(false);
          } catch (error) {
            console.error(error);
          }
        }}
        onClose={() => setOpenDeleteModal(false)}
        variant="delete"
        loading={loading}
      />
      <CreateUserModal
        isOpen={openCreateUserModal}
        onClose={() => {
          setOpenCreateUserModal(false);
        }}
      />
    </>
  );
};
export default UsersManagePage;
