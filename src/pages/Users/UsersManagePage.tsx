import { Button, Input, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { BsTelephoneFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { GetAllUsers } from "../../api/users.api";
import TableInfo from "../../components/Table";
import { UserDetail } from "../../interface/userdetail.interface";

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
    render: (_: string, __: unknown, index: number) => (
      <div className="flex flex-row gap-x-4 text-primaryblue-100" key={index}>
        <BsTelephoneFill className="size-6 cursor-pointer" />
        <AiFillEdit className="size-6 cursor-pointer" />
        <AiTwotoneDelete className="size-6 cursor-pointer" />
      </div>
    ),
  },
];

const UsersManagePage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<
    "Client" | "SuperAdmin" | "BranchManager" | ""
  >("");
  const [datasource, setDatasource] = useState<UserDetail[]>([]);
  const [filterData, setFilterData] = useState<UserDetail[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

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
          <Button type="primary" size="large">
            + เพิ่มพนักงาน
          </Button>
        </div>
      </section>
      <TableInfo columns={columns} loading={loading} dataSource={filterData} />
    </>
  );
};
export default UsersManagePage;
