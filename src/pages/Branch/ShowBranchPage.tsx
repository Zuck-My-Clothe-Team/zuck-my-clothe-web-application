import { Spin } from "antd";
import { useCallback, useMemo, useState } from "react";
import { GetOwnBranch } from "../../api/branch.api";
import BranchCard from "../../components/BranchCard";
import Navbar from "../../components/Navbar";
import { IBranch } from "../../interface/branch.interface";

const ShowBranchPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [datasource, setDatasource] = useState<IBranch[]>([]);

  const fetchBranch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await GetOwnBranch();
      if (response.status !== 200 && response.status !== 204) {
        throw new Error("เกิดข้อผิดพลาด");
      }

      if (response.status === 204) {
        setDatasource([]);
        setLoading(false);
        return;
      }

      setDatasource(response.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useMemo(async () => {
    await fetchBranch();
  }, [fetchBranch]);

  return (
    <div>
      <Navbar />
      <div className="container lg:mx-auto max-w-[1560px] px-6 my-4">
        <section>
          <h2 className="text-text-1 font-medium text-2xl">รายการสาขาของคุณ</h2>
          <p className="text-text-4 text-lg">
            โปรดเลือกสาขาที่คุณต้องการเข้าถึง
          </p>
        </section>
        <div className="grid grid-cols-12 gap-x-4 gap-y-6 py-4">
          {loading ? (
            <div className="col-span-12 flex justify-center items-center h-screen">
              <Spin size="large" />
            </div>
          ) : datasource.length === 0 ? (
            <div className="col-span-12 flex justify-center items-center h-screen">
              <p className="text-text-4 text-lg">ไม่พบข้อมูลสาขา</p>
            </div>
          ) : (
            datasource.map((branch) => (
              <div
                key={branch.branch_id}
                className="col-span-12 lg:col-span-4 xl:col-span-3"
              >
                <BranchCard
                  branch_id={branch.branch_id}
                  branch_name={branch.branch_name}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowBranchPage;
