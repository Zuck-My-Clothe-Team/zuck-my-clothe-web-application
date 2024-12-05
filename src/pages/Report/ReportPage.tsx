import { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  GetAllReport,
  GetReportByBranchId,
  UpdateReportStatus,
} from "../../api/report.api";
import { GetUserById } from "../../api/users.api";
import CollapseMenu, { CollapseMenuItems } from "../../components/CollapseMenu";
import DataShowingWrapper from "../../components/DataShowingWrapper";
import StatusCheckBox from "../../components/StatusCheckBox";
import { useAuth } from "../../context/auth.context";
import { IReport, ReportStatus } from "../../interface/report.interface";
import { Role, UserDetail } from "../../interface/userdetail.interface";
import { DateFormatter } from "../../utils/datetime";
import { formatPhoneNumber } from "../../utils/utils";
import LoadingPage from "../LoadingPage";
import { IBranch } from "../../interface/branch.interface";
import { GetAllBranch } from "../../api/branch.api";
import { Input, Select } from "antd";
import { ToastNotification } from "../../components/Toast/Toast";

const ConfirmModal = lazy(
  () => import("../../components/Modal/confirmation.modal")
);

const ReportPage = () => {
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();
  const [openStates, setOpenStates] = useState<boolean[]>([
    true,
    true,
    false,
    false,
  ]);
  const [reportData, setReportData] = useState<IReport[]>([]);
  const [filteredReportData, setFilteredReportData] = useState<IReport[]>([]);
  const [branchData, setBranchData] = useState<IBranch[]>([]);
  const [selectedReportData, setSelectedReportData] = useState<IReport | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCancel, setLoadingCancel] = useState<boolean>(false);
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDetail[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [branchName, setBranchName] = useState<string>("");
  const [initialLoad, setInitialLoad] = useState(true);

  const toggleOpen = (index: number) => {
    setOpenStates((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const fetchReportAllData = useCallback(async () => {
    if (initialLoad) setLoading(true);
    try {
      const result = await GetAllReport();

      if (result && result.status === 200) {
        setReportData(result.data);
        setFilteredReportData(result.data);
      } else {
        throw new Error("Error fetching all reports");
      }
    } catch (error) {
      console.error("Error fetching all reports:", error);
    } finally {
      if (initialLoad) setLoading(false);
    }
  }, [initialLoad]);

  const fetchReportData = useCallback(
    async (id: string) => {
      if (initialLoad) setLoading(true);
      try {
        if (!id) throw new Error("Branch id is not provided");
        const result = await GetReportByBranchId(id);

        if (result && result.status === 200) {
          setReportData(result.data);
          setFilteredReportData(result.data);
        } else {
          console.log("Unexpected result:", result);
          throw new Error("Error fetching reports by branch id");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        if (initialLoad) setLoading(false);
      }
    },
    [initialLoad]
  );

  const fetchBranchData = useCallback(async () => {
    try {
      const result = await GetAllBranch();

      if (result && result.status === 200) {
        setBranchData(result.data);
      } else {
        throw new Error("Error fetching branch data");
      }
    } catch (error) {
      console.error("Error fetching branch data:", error);
    }
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    setContentLoading(true);
    try {
      const result = await GetUserById(userId);
      if (!result || result.status !== 200) {
        throw new Error("Error fetching user data");
      }
      setUserData((prev) => [...prev, result.data]);

      setContentLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  const displayData = useCallback(
    async (userId: string) => {
      if (userData.find((user) => user.user_id === userId)) {
        return;
      } else {
        await fetchUserData(userId);
      }
    },
    [fetchUserData, userData]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (auth?.authContext?.role === Role.SuperAdmin) {
          await fetchReportAllData();
          await fetchBranchData();
        } else if (
          auth?.authContext?.role === Role.BranchManager &&
          branch_id
        ) {
          await fetchReportData(branch_id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchData();
  }, [auth, fetchReportAllData, fetchReportData, branch_id, fetchBranchData]);

  useEffect(() => {
    if (!initialLoad) {
      const interval = setInterval(async () => {
        try {
          if (auth?.authContext?.role === Role.SuperAdmin) {
            await fetchReportAllData();
            await fetchBranchData();
          } else if (
            auth?.authContext?.role === Role.BranchManager &&
            branch_id
          ) {
            await fetchReportData(branch_id);
          }
        } catch (error) {
          console.error("Error during periodic data fetch:", error);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [
    auth,
    fetchReportAllData,
    fetchReportData,
    branch_id,
    fetchBranchData,
    initialLoad,
  ]);

  const updateStatus = useCallback(
    async (reportId: string, status: ReportStatus) => {
      try {
        const result = await UpdateReportStatus({
          report_id: reportId,
          report_status: status,
        });
        if (!result || result.status !== 200)
          throw new Error(result.statusText);

        setReportData((prev) =>
          prev.map((report) =>
            report.report_id === reportId
              ? { ...report, report_status: status }
              : report
          )
        );
        ToastNotification.success({
          config: {
            message: "อัปเดตสถานะสำเร็จ",
            description: `สถานะของ ISSUE #${reportId.substring(
              0,
              8
            )} ถูกเปลี่ยนเป็น ${status}`,
          },
        });
      } catch (error) {
        ToastNotification.error({
          config: {
            message: "ไม่สามารถอัปเดตสถานะได้",
            description: `เกิดข้อผิดพลาด: ${error}`,
          },
        });
        console.error("Error updating status:", error);
      }
    },
    []
  );

  useEffect(() => {
    let filteredData = reportData;

    if (searchValue) {
      filteredData = reportData.filter((report) => {
        const user = userData.find((item) => item.user_id === report.user_id);
        return (
          user?.firstname.toLowerCase().includes(searchValue.toLowerCase()) ||
          user?.lastname.toLowerCase().includes(searchValue.toLowerCase()) ||
          user?.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          user?.phone.toLowerCase().includes(searchValue.toLowerCase()) ||
          report.report_desc
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          report.report_id.toLowerCase().includes(searchValue.toLowerCase())
        );
      });
    }

    if (branchName) {
      filteredData = reportData.filter(
        (report) => report.branch.branch_id === branchName
      );
    }

    if (searchValue || branchName) {
      setOpenStates([false, false, false, false]);
      setTimeout(() => {
        setOpenStates([true, true, false, false]);
      }, 300);
    }

    setFilteredReportData(filteredData);
  }, [reportData, searchValue, userData, branchName]);

  const items = useMemo(() => {
    const pendingItems: CollapseMenuItems[] = [];
    const inProgressItems: CollapseMenuItems[] = [];
    const fixedItems: CollapseMenuItems[] = [];
    const canceledItems: CollapseMenuItems[] = [];
    filteredReportData.forEach((report) => {
      const item = {
        title: "ISSUE #" + report.report_id.substring(0, 8),
        onClick: async () => {
          await displayData(report.user_id);
          setSelectedReportData(report);
        },
        createdDate: new Date(report.created_at),
      };

      switch (report.report_status) {
        case ReportStatus.Pending:
          pendingItems.push(item);
          break;
        case ReportStatus.InProgress:
          inProgressItems.push(item);
          break;
        case ReportStatus.Fixed:
          fixedItems.push(item);
          break;
        case ReportStatus.Canceled:
          canceledItems.push(item);
          break;
        default:
          break;
      }
    });

    return {
      [ReportStatus.Pending]: pendingItems,
      [ReportStatus.InProgress]: inProgressItems,
      [ReportStatus.Fixed]: fixedItems,
      [ReportStatus.Canceled]: canceledItems,
    };
  }, [filteredReportData, displayData]);

  let user: UserDetail | undefined;
  if (selectedReportData) {
    user = userData.find((item) => item.user_id === selectedReportData.user_id);
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>
      <div className="py-4">
        <h2 className="text-2xl font-kanit font-medium text-text-1">
          การแจ้งปัญหา
        </h2>

        {auth?.authContext?.role === Role.SuperAdmin && (
          <div className="flex flex-col lg:flex-row justify-between gap-x-4 px-4 mt-4">
            <Input
              placeholder="ค้นหา ชื่อ นามสกุล อีเมล เบอร์โทร หรือรหัส ISSUE"
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              className="w-1/4 mt-2 text-sm h-8"
            />
            <Select
              className="w-1/4 mt-2 text-sm h-8"
              placeholder="สาขา"
              disabled={loading}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              onChange={(value) => {
                setBranchName(value);
              }}
            >
              {branchData.map((branch: IBranch, index: number) => (
                <Select.Option key={index} value={branch.branch_id}>
                  {branch.branch_name}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        <div className="grid grid-cols-3 lg:grid-cols-7 gap-y-4 lg:gap-y-0 lg:gap-x-4 mt-7">
          <div className="col-span-3 lg:col-span-2">
            <CollapseMenu
              isOpen={openStates[0]}
              setOpen={() => toggleOpen(0)}
              headerText={"มาใหม่"}
              items={items[ReportStatus.Pending]}
            />
            <CollapseMenu
              isOpen={openStates[1]}
              setOpen={() => toggleOpen(1)}
              headerText={"กำลังดำเนินการ"}
              headerBgStyle={"bg-primaryblue-200 hover:bg-primaryblue-200/80"}
              items={items[ReportStatus.InProgress]}
            />
            <CollapseMenu
              isOpen={openStates[2]}
              setOpen={() => toggleOpen(2)}
              headerText={"แก้ไขแล้ว"}
              headerBgStyle={"bg-primaryblue-100 hover:bg-primaryblue-100/80"}
              items={items[ReportStatus.Fixed]}
            />
            <CollapseMenu
              isOpen={openStates[3]}
              setOpen={() => toggleOpen(3)}
              headerText={"ยกเลิก"}
              headerBgStyle={
                "bg-secondaryblue-300 hover:bg-secondaryblue-300/80"
              }
              items={items[ReportStatus.Canceled]}
            />
          </div>
          <div className="col-span-5 h-full">
            <DataShowingWrapper
              title={
                selectedReportData
                  ? "ISSUE #" + selectedReportData.report_id.substring(0, 8)
                  : "รายละเอียด"
              }
            >
              {contentLoading ? (
                <LoadingPage />
              ) : !selectedReportData ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-text-4 font-kanit font-normal text-lg">
                    กรุณาเลือกรายการ
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-y-1.5 lg:gap-y-3 text-[14px] lg:text-lg text-black font-normal">
                  <div className="flex flex-col lg:flex-row gap-x-6">
                    <h3 className="font-medium">
                      ชื่อ {user?.firstname + " " + user?.lastname}
                    </h3>
                    <p>{"โทร " + formatPhoneNumber(user?.phone ?? "")}</p>
                  </div>
                  <p className="text-text-4">{user?.email}</p>
                  <div className="flex flex-col lg:flex-row gap-x-6">
                    <p>
                      {"แจ้งเมื่อ " +
                        DateFormatter.getTime(
                          new Date(selectedReportData.created_at)
                        )}
                      <span className="text-gray-400 ml-4">
                        {DateFormatter.getTimeDifference(
                          new Date(selectedReportData.created_at),
                          new Date()
                        )}
                      </span>
                    </p>
                    <p>
                      {"วันที่ " +
                        DateFormatter.getDateThaiFomatted(
                          new Date(selectedReportData.created_at)
                        )}
                    </p>
                  </div>
                  <p>{"สาขา " + selectedReportData.branch.branch_detail}</p>
                  <p>รายละเอียด</p>
                  <p className="text-sm lg:text-[16px] text-text-4">
                    {selectedReportData.report_desc}
                  </p>
                  <div className="flex flex-col gap-y-4 mt-4">
                    <StatusCheckBox
                      id={selectedReportData.report_id}
                      label="กำลังดำเนินการ"
                      checked={
                        selectedReportData.report_status ===
                          ReportStatus.InProgress ||
                        selectedReportData.report_status === ReportStatus.Fixed
                      }
                      disabled={
                        selectedReportData.report_status ===
                          ReportStatus.Canceled ||
                        selectedReportData.report_status ===
                          ReportStatus.Fixed ||
                        selectedReportData.report_status ===
                          ReportStatus.InProgress
                      }
                      onChange={async () => {
                        setSelectedReportData((prev) =>
                          prev
                            ? {
                                ...prev,
                                report_status: ReportStatus.InProgress,
                              }
                            : prev
                        );
                        setTimeout(async () => {
                          await updateStatus(
                            selectedReportData!.report_id,
                            ReportStatus.InProgress
                          );
                        }, 100);
                      }}
                    />
                    <StatusCheckBox
                      id={selectedReportData.report_id}
                      label="แก้ไขแล้ว"
                      checked={
                        selectedReportData.report_status === ReportStatus.Fixed
                      }
                      disabled={
                        selectedReportData.report_status !==
                        ReportStatus.InProgress
                      }
                      onChange={async () => {
                        setSelectedReportData((prev) =>
                          prev
                            ? { ...prev, report_status: ReportStatus.Fixed }
                            : prev
                        );
                        await updateStatus(
                          selectedReportData!.report_id,
                          ReportStatus.Fixed
                        );
                      }}
                    />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button
                      className="border border-primaryblue-200 rounded-[4px] bg-customred-1 hover:bg-red-600/80 text-text-2 text-lg px-4 py-1 disabled:cursor-not-allowed disabled:bg-customgray-400 disabled:border-customgray-400"
                      disabled={
                        selectedReportData.report_status ===
                          ReportStatus.Canceled ||
                        selectedReportData.report_status ===
                          ReportStatus.Fixed ||
                        loadingCancel
                      }
                      onClick={() => {
                        setOpenDeleteModal(true);
                      }}
                    >
                      ยกเลิกการแจ้งปัญหา
                    </button>
                  </div>
                </div>
              )}
            </DataShowingWrapper>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onOk={async () => {
          setLoadingCancel(true);
          await updateStatus(
            selectedReportData!.report_id,
            ReportStatus.Canceled
          );
          setLoadingCancel(false);
          setOpenDeleteModal(false);
        }}
        title={`ยืนยันการยกเลิก ISSUE #${selectedReportData?.report_id.substring(
          0,
          8
        )} `}
        message={["คุณต้องการยกเลิก ISSUE นี้ใช่หรือไม่"]}
        loading={loadingCancel}
        variant="delete"
      />
    </>
  );
};

export default ReportPage;
