import { Button, Input, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { BsGeoAltFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { DeleteBranch, GetAllBranch } from "../../api/branch.api";
import { GetAllManagers } from "../../api/users.api";
import { ConfirmModal } from "../../components/Modal/confirmation.modal";
import { CreateBranchModal } from "../../components/Modal/createBranch.modal";
import TableInfo from "../../components/Table";
import { IBranch } from "../../interface/branch.interface";
import { UserDetail } from "../../interface/userdetail.interface";

import { Link } from "react-router-dom";
import PROVINCE from "../../assets/json/province.json";
import UpdateBranchModal from "../../components/Modal/updateBranch.modal";

const BranchManagePage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [datasource, setDatasource] = useState<IBranch[]>([]);
  const [filterData, setFilterData] = useState<IBranch[]>([]);
  const [managers, setManagers] = useState<UserDetail[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openCreateBranchModal, setOpenCreateBranchModal] =
    useState<boolean>(false);
  const [openEditModel, setOpenEditModel] = useState<boolean>(false);
  const [branchToBeUsed, setBranchToBeUsed] = useState<IBranch | null>(null);

  const columns = [
    {
      title: "ลำดับ",
      dataIndex: "index",
      key: "index",
      render: (_: IBranch, __: unknown, index: number) => (
        <span key={index}>{index + 1}</span>
      ),
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
      render: (data: IBranch, __: unknown, index: number) => (
        <Link
          className="cursor-pointer"
          target="_blank"
          to={`https://www.google.com/maps/place/${data.branch_lat},${data.branch_long}/`}
        >
          <BsGeoAltFill className="size-6 text-primaryblue-100" key={index} />
        </Link>
      ),
    },
    {
      title: "ผู้จัดการ",
      dataIndex: "owner_user_id",
      key: "owner_user_id",
      render: (data: string) => {
        const manager = managers.find((manager) => manager.user_id === data);
        return manager?.firstname + " " + manager?.lastname;
      },
    },
    {
      render: (data: IBranch, __: unknown, index: number) => (
        <div className="flex flex-row gap-x-4 text-primaryblue-100" key={index}>
          <AiFillEdit
            className="size-6 cursor-pointer"
            onClick={() => {
              setBranchToBeUsed(data);
              setOpenEditModel(true);
            }}
          />
          <AiTwotoneDelete
            className="size-6 cursor-pointer"
            onClick={() => {
              setBranchToBeUsed(data);
              setOpenDeleteModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  const fetchAllBranch = useCallback(async () => {
    try {
      const result = await GetAllBranch();
      if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");

      const branchData: IBranch[] = result.data;
      setDatasource(branchData);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const result = await GetAllManagers();
      if (!result || result.status !== 200) throw new Error("เกิดข้อผิดพลาด");
      const managers: UserDetail[] = result.data;
      setManagers(managers);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const searchBranch = useCallback(
    (value: string) => {
      const filterData = datasource.filter((data) => {
        return (
          (data.branch_name.toLowerCase().includes(value.toLowerCase()) ||
            data.branch_detail.toLowerCase().includes(value.toLowerCase())) &&
          data.branch_detail.toLowerCase().includes(province.toLowerCase())
        );
      });
      setFilterData(filterData);
    },
    [datasource, province]
  );

  useEffect(() => {
    searchBranch(searchValue);
  }, [searchValue, province, searchBranch]);

  useMemo(() => {
    Promise.all([fetchManagers(), fetchAllBranch()]);
    setLoading(false);
  }, [fetchAllBranch, fetchManagers]);

  return (
    <>
      <h3 className="text-text-1 text-4xl py-4">ระบบจัดการสาขา</h3>
      <section className="flex flex-row justify-between py-6 px-6">
        <div className="flex flex-row items-center w-2/5">
          <Input
            placeholder="ค้นหารหัส, สาขา, ผู้จัดการ "
            size="large"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
          <Button type="primary" size="large">
            <FaSearch className="text-white size-4" />
          </Button>
        </div>
        <div className="flex flex-row justify-between w-1/3 gap-x-2">
          <Select
            className="w-full text-sm h-8"
            placeholder="จังหวัด"
            disabled={loading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children ?? "")
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => {
              setProvince(value);
            }}
            size="large"
          >
            {PROVINCE.map((item, index: number) => (
              <Select.Option key={index} value={item.name_th}>
                {item.name_th}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              setOpenCreateBranchModal(true);
            }}
          >
            + เพิ่มสาขา
          </Button>
        </div>
      </section>
      <TableInfo columns={columns} loading={loading} dataSource={filterData} />
      <ConfirmModal
        isOpen={openDeleteModal}
        title="โปรดตรวจสอบก่อนทำการลบ"
        message={[
          `คุณต้องการลบข้อมูลนี้ใช่หรือไม่ ${branchToBeUsed?.branch_name}`,
          "คุณมั่นใจแล้วใช่ไหมว่าต้องการลบออกจากระบบ",
        ]}
        onOk={async () => {
          try {
            if (!branchToBeUsed) throw new Error("ไม่พบข้อมูลสาขา");
            const result = await DeleteBranch(branchToBeUsed.branch_id);
            if (result.status !== 200) throw new Error("เกิดข้อผิดพลาด");
            await fetchAllBranch();
            setOpenDeleteModal(false);
          } catch (error) {
            console.error(error);
          }
        }}
        onClose={() => {
          setOpenDeleteModal(false);
          setBranchToBeUsed(null);
        }}
        variant="delete"
        loading={loading}
      />
      <CreateBranchModal
        isOpen={openCreateBranchModal}
        onClose={() => setOpenCreateBranchModal(false)}
        managers={managers}
      />
      <UpdateBranchModal
        isOpen={openEditModel}
        onClose={() => setOpenEditModel(false)}
        data={branchToBeUsed as IBranch}
        managers={managers}
      />
    </>
  );
};
export default BranchManagePage;
