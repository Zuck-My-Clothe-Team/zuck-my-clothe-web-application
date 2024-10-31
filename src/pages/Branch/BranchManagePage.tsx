import { BsGeoAltFill } from "react-icons/bs";
import TableInfo from "../../components/Table";
import { AiFillEdit, AiFillMail, AiTwotoneDelete } from "react-icons/ai";
import { useCallback, useMemo, useState } from "react";
import { GetAllBranch } from "../../api/branch.api";
import { IBranch } from "../../interface/branch.interface";
import { Button, Input, Select } from "antd";
import { FaSearch } from "react-icons/fa";

const columns = [
  {
    title: "ลำดับ",
    dataIndex: "index",
    key: "index",
  },
  {
    title: "สาขา",
    dataIndex: "branch_name",
    key: "branch_name",
  },
  {
    title: "ตำแหน่ง",
    dataIndex: "branch_detail",
    key: "branch_detail",
  },
  {
    title: "",
    render: () => <BsGeoAltFill className="size-6 text-primaryblue-100" />,
  },
  {
    title: "ตำแหน่ง",
    dataIndex: "branch_detail",
    key: "branch_detail",
  },
  {
    title: "ผู้จัดการ",
    dataIndex: "owner_user_id",
    key: "owner_user_id",
  },
  {
    render: () => (
      <div className="flex flex-row gap-x-4 text-primaryblue-100">
        <AiFillMail className="size-6 cursor-pointer" />
        <AiFillEdit className="size-6 cursor-pointer" />
        <AiTwotoneDelete className="size-6 cursor-pointer" />
      </div>
    ),
  },
];

const BranchManagePage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [datasource, setDatasource] = useState<IBranch[]>([]);

  const fetchAllBranch = useCallback(async () => {
    try {
      const result = await GetAllBranch();
      if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");

      const branchData: IBranch[] = result.data;
      setDatasource(branchData);

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useMemo(async () => {
    await fetchAllBranch();
  }, [fetchAllBranch]);

  return (
    <>
      <h3 className="text-text-1 text-4xl py-4">ระบบจัดการสาขา</h3>
      <section className="flex flex-row justify-between py-6 px-6">
        <div className="flex flex-row items-center w-2/5">
          <Input placeholder="ค้นหารหัส, สาขา, ผู้จัดการ " size="large" />
          <Button type="primary" size="large">
            <FaSearch className="text-white size-4" />
          </Button>
        </div>
        <div className="flex flex-row justify-between w-1/5">
          <Select placeholder="จังหวัด" size="large" />
          <Button type="primary" size="large">
            + เพิ่มสาขา
          </Button>
        </div>
      </section>
      <TableInfo columns={columns} loading={loading} dataSource={datasource} />
    </>
  );
};
export default BranchManagePage;
