import { Button, Input, notification, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { BsTelephoneFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { DeleteUser, GetAllUsers } from "../../api/users.api";
import TableInfo from "../../components/Table";
import { UserDetail } from "../../interface/userdetail.interface";
import { ConfirmModal } from "../../components/Modal/confirmation.modal";
import { CreateUserModal } from "../../components/Modal/createUser.modal";

const UsersManagePage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<
    "Client" | "SuperAdmin" | "BranchManager" | ""
  >("");
  const [datasource, setDatasource] = useState<UserDetail[]>([]);
  const [filterData, setFilterData] = useState<UserDetail[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [openCreateUserModal, setOpenCreateUserModal] =
    useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [userToBeDelete, setUserToBeDelete] = useState<UserDetail | null>(null);

  const columns = [
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
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        return <div>{role}</div>;
      },
    },
    {
      render: (data: UserDetail, __: unknown, index: number) => (
        <div className="flex flex-row gap-x-4 text-primaryblue-100" key={index}>
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
      const result = await GetAllUsers();
      if (result.status !== 200)
        throw new Error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");

      const usersData: UserDetail[] = result.data;
      setFilterData(usersData);
      setDatasource(usersData);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const searchUser = useCallback(
    (value: string) => {
      const filterData = datasource.filter((data) => {
        const matchSearch =
          data.firstname.toLowerCase().includes(value.toLowerCase()) ||
          data.lastname.toLowerCase().includes(value.toLowerCase()) ||
          data.email.toLowerCase().includes(value.toLowerCase());

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
            <Select.Option value="Client">Client</Select.Option>
            <Select.Option value="BranchManager">BranchManager</Select.Option>
            <Select.Option value="SuperAdmin">SuperAdmin</Select.Option>
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
