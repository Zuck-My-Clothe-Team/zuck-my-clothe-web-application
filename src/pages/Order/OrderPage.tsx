import { Input, Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BsTelephoneFill } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { GetAllBranch } from "../../api/branch.api";
import {
  GetAllOrder,
  GetOrderByBranch,
  updateStatusOrder,
} from "../../api/order.api";
import { GetUserById } from "../../api/users.api";
import BasketCard from "../../components/Card/BasketCard";
import SummaryOrderCard from "../../components/Card/SummaryOrderCard";
import CollapseMenu, { CollapseMenuItems } from "../../components/CollapseMenu";
import DataShowingWrapper from "../../components/DataShowingWrapper";
import ConfirmModal from "../../components/Modal/confirmation.modal";
import StatusCheckBox from "../../components/StatusCheckBox";
import { ToastNotification } from "../../components/Toast/Toast";
import { useAuth } from "../../context/auth.context";
import { IBranch } from "../../interface/branch.interface";
import {
  EOrderStatus,
  EServiceType,
  EWorkingStatus,
  IOrder,
  IOrderUpdateDTO,
} from "../../interface/order.interface";
import { Role, UserDetail } from "../../interface/userdetail.interface";
import { DateFormatter } from "../../utils/datetime";
import { GetStatusOrderFromOrderDetails } from "../../utils/utils";
import LoadingPage from "../LoadingPage";

enum FWorkingStatus {
  All = "All",
  Waiting = "Waiting",
  Pickup = "Pickup",
  BackToStore = "BackToStore",
  Processing = "Processing",
  OutForDelivery = "OutForDelivery",
  Completed = "Completed",
  Canceled = "Canceled",
}

export enum FWorkingStatusTH {
  All = "ทั้งหมด",
  Waiting = "รอดำเนินการ",
  Pickup = "รับผ้า",
  BackToStore = "ผ้ากลับมาถึงร้าน",
  Processing = "กำลังดำเนินการ",
  OutForDelivery = "กำลังจัดส่ง",
  Completed = "เสร็จสิ้น",
  Canceled = "ยกเลิก",
}

const OrderPage = () => {
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();
  const [searchValue, setSearchValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [branchName, setBranchName] = useState<string>("");
  const [branchData, setBranchData] = useState<IBranch[]>([]);
  const [contentLoading, setContentLoading] = useState<boolean>(false);
  const [selectedDeliveryData, setSelectedDeliveryData] = useState<IOrder>();
  const [statusSelectedDeliveryData, setStatusSelectedDeliveryData] =
    useState<EWorkingStatus>();
  const [filteredOrderData, setFilteredOrderData] = useState<IOrder[]>([]);
  const [displayWeight, setDisplayWeight] = useState<number>(0);
  const [orderData, setOrderData] = useState<IOrder[]>([]);
  const [userData, setUserData] = useState<UserDetail[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [loadingCancel, setLoadingCancel] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<FWorkingStatus>(
    FWorkingStatus.All
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

  const fetchOrderData = useCallback(
    async (branch_id: string) => {
      try {
        setContentLoading(true);
        let res;
        if (auth?.authContext?.role === Role.SuperAdmin) {
          res = await GetAllOrder();
        } else if (
          auth?.authContext?.role === Role.BranchManager &&
          branch_id
        ) {
          res = await GetOrderByBranch(branch_id, "paid");
        }

        if (!res) return;

        if (res.status != 200) throw new Error("Cannot Get Order Data");
        const data: IOrder[] = res.data;

        const filterDateData = data
          .filter(
            (order: IOrder) =>
              new Date(order.created_at).getTime() >=
                new Date().getTime() - 1 * 24 * 60 * 60 * 1000 &&
              !order.zuck_onsite &&
              order.order_details.find(
                (order) => order.order_status !== EOrderStatus.Expired
              )
          )
          .sort((a, b) => b.created_at.localeCompare(a.created_at));

        setOrderData(filterDateData);
        setFilteredOrderData(filterDateData);
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setContentLoading(false);
      }
    },
    [auth]
  );

  const fetchUserData = useCallback(async (userId: string) => {
    setContentLoading(true);
    try {
      const result = await GetUserById(userId);
      if (!result || result.status !== 200) {
        throw new Error("Error fetching user data");
      }
      setUserData((prev) => [...prev, result.data]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setContentLoading(false);
    }
  }, []);

  const findUserData = useCallback(
    async (userId: string) => {
      if (userData.find((user) => user.user_id === userId)) {
        return;
      } else {
        await fetchUserData(userId);
      }
    },
    [fetchUserData, userData]
  );

  const handleUpdateOrder = useCallback(
    async (updateOrder: IOrderUpdateDTO) => {
      try {
        const result = await updateStatusOrder(updateOrder);
        if (!result || result.status !== 200)
          throw new Error(result.statusText);

        setOrderData((prev) =>
          prev.map((order) => ({
            ...order,
            order_details: order.order_details.map((detail) =>
              detail.order_basket_id === updateOrder.order_basket_id
                ? { ...detail, order_status: updateOrder.order_status }
                : detail
            ),
          }))
        );

        setSelectedDeliveryData((prev) => {
          if (prev) {
            return {
              ...prev,
              order_details: prev.order_details.map((detail) =>
                detail.order_basket_id === updateOrder.order_basket_id
                  ? { ...detail, order_status: updateOrder.order_status }
                  : detail
              ),
            };
          }
          return prev;
        });

        ToastNotification.success({
          config: {
            message: "อับเดตสถานะสำเร็จ",
            description: `สถานะของ ORDER #${updateOrder.order_basket_id.substring(
              0,
              8
            )} ถูกเปลี่ยนเป็น ${updateOrder.order_status}`,
          },
        });
      } catch (error) {
        ToastNotification.error({
          config: {
            message: "ไม่สามารถอับเดตสถานะได้",
            description: `เกิดข้อผิดพลาด: ${error}`,
          },
        });
        console.error("Error updating status:", error);
      }
    },
    []
  );

  useEffect(() => {
    let filteredData = orderData;

    if (searchValue) {
      filteredData = orderData.filter((order) => {
        const user = order.user_detail;
        return (
          user?.firstname.toLowerCase().includes(searchValue.toLowerCase()) ||
          user?.lastname.toLowerCase().includes(searchValue.toLowerCase()) ||
          user?.phone.toLowerCase().includes(searchValue.toLowerCase()) ||
          order.order_header_id
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          order.delivery_address
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        );
      });
    }

    if (branchName) {
      filteredData = orderData.filter(
        (order) => order.branch_id === branchName
      );
    }

    setSelectedDeliveryData(undefined);
    setFilteredOrderData(filteredData);
  }, [orderData, searchValue, branchName]);

  useMemo(async () => {
    try {
      setLoading(true);
      if (auth?.authContext?.role === Role.SuperAdmin) {
        await fetchBranchData();
      }
      await fetchOrderData(branch_id!);
      setLoading(false);
    } catch (error) {
      ToastNotification.error({
        config: {
          message: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลได้ได้ " + error,
          duration: 5,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [auth?.authContext?.role, fetchBranchData, branch_id]);

  const items = useMemo(() => {
    const allItems: CollapseMenuItems[] = [];
    const pendingItems: CollapseMenuItems[] = [];
    const pickupItems: CollapseMenuItems[] = [];
    const backToStoreItems: CollapseMenuItems[] = [];
    const processingItems: CollapseMenuItems[] = [];
    const outForDeliveryItems: CollapseMenuItems[] = [];
    const completedItems: CollapseMenuItems[] = [];
    const canceledItems: CollapseMenuItems[] = [];

    filteredOrderData.map((order) => {
      const item = {
        title: "ORDER #" + order.order_header_id.substring(0, 8),
        onClick: async () => {
          setSelectedDeliveryData(order);
          const staffId = order.order_details.find(
            (item) =>
              item.service_type === EServiceType.Pickup &&
              item.order_status !== EOrderStatus.Waiting
          )?.updated_by;
          if (staffId) {
            await findUserData(staffId);
          }
        },
        createdDate: new Date(order.created_at),
      };
      allItems.push(item);
      const workingStatus = GetStatusOrderFromOrderDetails(order.order_details);

      switch (workingStatus) {
        case EWorkingStatus.Waiting:
          pendingItems.push(item);
          break;
        case EWorkingStatus.Pickup:
          pickupItems.push(item);
          break;
        case EWorkingStatus.BackToStore:
          backToStoreItems.push(item);
          break;
        case EWorkingStatus.Processing:
          processingItems.push(item);
          break;
        case EWorkingStatus.OutForDelivery:
          outForDeliveryItems.push(item);
          break;
        case EWorkingStatus.Completed:
          completedItems.push(item);
          break;
        case EWorkingStatus.Canceled:
          canceledItems.push(item);
          break;
        default:
          break;
      }
    });

    return {
      [FWorkingStatus.All]: allItems,
      [EWorkingStatus.Waiting]: pendingItems,
      [EWorkingStatus.Pickup]: pickupItems,
      [EWorkingStatus.BackToStore]: backToStoreItems,
      [EWorkingStatus.Processing]: processingItems,
      [EWorkingStatus.OutForDelivery]: outForDeliveryItems,
      [EWorkingStatus.Completed]: completedItems,
      [EWorkingStatus.Canceled]: canceledItems,
    };
  }, [filteredOrderData, findUserData]);

  const calculateWeightsAndStatus = (deliveryData: IOrder) => {
    const dryingWeight = deliveryData.order_details
      .filter((order) => order.service_type === EServiceType.Drying)
      .reduce((total, order) => total + order.weight, 0);

    const washingWeight = deliveryData.order_details
      .filter((order) => order.service_type === EServiceType.Washing)
      .reduce((total, order) => total + order.weight, 0);

    const status = GetStatusOrderFromOrderDetails(deliveryData.order_details);

    const displayWeight =
      dryingWeight > 0 && washingWeight > 0
        ? washingWeight
        : dryingWeight + washingWeight;

    return { status, displayWeight };
  };

  useEffect(() => {
    if (selectedDeliveryData) {
      const { status, displayWeight } =
        calculateWeightsAndStatus(selectedDeliveryData);
      setStatusSelectedDeliveryData(status);
      setDisplayWeight(displayWeight);
    }
  }, [selectedDeliveryData]);

  if (loading) return <LoadingPage />;

  return (
    <>
      <div className="py-4">
        <h2 className="text-2xl font-kanit font-medium text-text-1">
          คำสั่งซัก
        </h2>

        <div className="flex flex-col lg:flex-row justify-between gap-x-4 mt-4">
          <Input
            placeholder="ค้นหา ชื่อ นามสกุล เบอร์โทร หรือรหัส ORDER"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            className="w-1/4 mt-2 text-sm h-8"
          />
          {auth?.authContext?.role === Role.SuperAdmin && (
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
          )}
        </div>
        <div className="flex flex-row overflow-x-auto gap-x-4 mt-4">
          {Object.keys(FWorkingStatus).map((key) => (
            <div
              className={`py-1 px-3 ${
                selectedFilter === key
                  ? "bg-background-2"
                  : "bg-primaryblue-100"
              } text-white rounded-[25px] cursor-pointer hover:bg-secondaryblue-200`}
              onClick={() => {
                setSelectedFilter(key as FWorkingStatus);
                setSelectedDeliveryData(undefined);
              }}
            >
              <p>
                {FWorkingStatusTH[key as keyof typeof FWorkingStatusTH]} (
                {items[key as keyof typeof FWorkingStatus].length})
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-7 gap-y-4 lg:gap-y-0 lg:gap-x-4 mt-7">
          <div className="col-span-3 lg:col-span-2">
            <CollapseMenu
              isOpen={true}
              setOpen={() => {}}
              headerText={FWorkingStatusTH[selectedFilter]}
              items={items[selectedFilter]}
            />
          </div>
          <div className="col-span-5 h-full">
            <DataShowingWrapper
              title={
                selectedDeliveryData
                  ? "ORDER #" + selectedDeliveryData.order_header_id
                  : "รายละเอียด"
              }
            >
              {contentLoading ? (
                <LoadingPage />
              ) : !selectedDeliveryData ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-text-4 font-kanit font-normal text-lg">
                    กรุณาเลือกรายการ
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-y-1.5 lg:gap-y-3 text-[14px] lg:text-lg text-black font-normal">
                  {/* Selected order data detail */}
                  <div className="flex flex-col md:flex-row gap-x-6 gap-y-4 md:gap-y-1 items-start lg:items-center">
                    <h3 className="font-medium">
                      ชื่อ{" "}
                      {selectedDeliveryData.user_detail?.firstname +
                        " " +
                        selectedDeliveryData.user_detail?.lastname}
                    </h3>
                    <Link
                      to={`tel:${selectedDeliveryData.user_detail?.phone}`}
                      className="flex flex-row items-center md:flex-row gap-2 px-6 lg:px-4 lg:py-1.5 text-[14px] text-primaryblue-200 justify-center bg-secondaryblue-100 hover:bg-secondaryblue-200 cursor-pointer rounded-[25px]"
                      onClick={() => {
                        ToastNotification.info({
                          config: {
                            message: "คัดลอกเบอร์โทรศัพท์สำเร็จ",
                            description: `ทำการคัดลอกเบอร์โทรศัพท์ของ ${selectedDeliveryData.user_detail.firstname} ${selectedDeliveryData.user_detail.lastname}`,
                          },
                        });
                        navigator.clipboard.writeText(
                          selectedDeliveryData.user_detail.phone
                        );
                      }}
                    >
                      <BsTelephoneFill className="size-3 lg:size-5 cursor-pointer -rotate-90" />
                      <p>ติดต่อลูกค้า</p>
                    </Link>
                  </div>
                  <p className="text-text-1">ที่อยู่</p>
                  <Link
                    target="_blank"
                    to={`https://www.google.com/maps/place/${selectedDeliveryData.delivery_lat},${selectedDeliveryData.delivery_long}/`}
                    className="cursor-pointer bg-background-1 rounded-[30px] px-6 py-3 flex flex-row gap-x-4 items-center"
                  >
                    <img src="/images/mapMarker.png" alt="map" />
                    <p className="text-text-1 text-sm">
                      {selectedDeliveryData.delivery_address}
                    </p>
                  </Link>
                  <div className="flex flex-col lg:flex-row gap-x-6">
                    <p>
                      {"แจ้งเมื่อ " +
                        DateFormatter.getTime(
                          new Date(selectedDeliveryData.created_at)
                        )}
                      <span className="text-gray-400 ml-4">
                        {DateFormatter.getTimeDifference(
                          new Date(selectedDeliveryData.created_at),
                          new Date()
                        )}
                      </span>
                    </p>
                    <p>
                      {"วันที่ " +
                        DateFormatter.getDateThaiFomatted(
                          new Date(selectedDeliveryData.created_at)
                        )}
                    </p>
                  </div>
                  <p className="text-text-1">จำนวนผ้า {displayWeight} kg.</p>
                  {statusSelectedDeliveryData !== EWorkingStatus.Waiting && (
                    <div className="flex flex-col md:flex-row gap-x-4 gap-y-4 md:gap-y-1 items-start lg:items-center">
                      <p className="text-text-1">
                        รับออเดอร์โดย{" "}
                        {userData.find(
                          (user) =>
                            user.user_id ===
                            selectedDeliveryData.order_details.find(
                              (order) =>
                                order.service_type === EServiceType.Pickup
                            )?.updated_by
                        )?.firstname +
                          " " +
                          userData.find(
                            (user) =>
                              user.user_id ===
                              selectedDeliveryData.order_details.find(
                                (order) =>
                                  order.service_type === EServiceType.Pickup
                              )?.updated_by
                          )?.lastname}
                      </p>
                      <Link
                        to={`tel:${selectedDeliveryData.user_detail?.phone}`}
                        className="flex flex-row items-center md:flex-row gap-2 px-6 lg:px-4 lg:py-1.5 text-[14px] text-primaryblue-200 justify-center bg-secondaryblue-100 hover:bg-secondaryblue-200 cursor-pointer rounded-[25px]"
                        onClick={() => {
                          ToastNotification.info({
                            config: {
                              message: "คัดลอกเบอร์โทรศัพท์สำเร็จ",
                              description: `ทำการคัดลอกเบอร์โทรศัพท์ของ ${selectedDeliveryData.user_detail.firstname} ${selectedDeliveryData.user_detail.lastname}`,
                            },
                          });
                          navigator.clipboard.writeText(
                            selectedDeliveryData.user_detail.phone
                          );
                        }}
                      >
                        <BsTelephoneFill className="size-5 cursor-pointer -rotate-90" />
                        <p>ติดต่อคนพนักงาน</p>
                      </Link>
                    </div>
                  )}
                  {/*End of selection order detail header*/}
                  <div className="flex lg:grid lg:grid-cols-5 mt-4 justify-center items-center">
                    {/* Waiting Section */}
                    {statusSelectedDeliveryData === EWorkingStatus.Waiting && (
                      <div className="w-full md:w-3/5 lg:w-full lg:col-span-3 lg:col-start-2 lg:col-end-5">
                        <SummaryOrderCard
                          data={selectedDeliveryData}
                          status={statusSelectedDeliveryData}
                        />
                        <div className="flex flex-col gap-y-2 mt-4">
                          <StatusCheckBox
                            id={selectedDeliveryData.order_header_id}
                            label="รับออเดอร์"
                            onChange={async () => {
                              const basketId =
                                selectedDeliveryData.order_details.find(
                                  (order) =>
                                    order.service_type === EServiceType.Pickup
                                )?.order_basket_id;

                              if (basketId) {
                                const updateDTO: IOrderUpdateDTO = {
                                  finished_at: new Date().toISOString(),
                                  machine_serial: null,
                                  order_basket_id: basketId,
                                  order_status: EOrderStatus.Processing,
                                };
                                await handleUpdateOrder(updateDTO);
                              }
                            }}
                          />
                          <button
                            className="rounded-[4px] bg-customred-1 hover:bg-red-600/80 text-text-2 text-lg px-4 py-1"
                            onClick={() => {
                              setOpenDeleteModal(true);
                            }}
                          >
                            ยกเลิกออเดอร์
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pickup Section */}

                    {statusSelectedDeliveryData === EWorkingStatus.Pickup && (
                      <div className="w-full md:w-3/5 lg:w-full lg:col-span-3 lg:col-start-2 lg:col-end-5">
                        <SummaryOrderCard
                          data={selectedDeliveryData}
                          status={statusSelectedDeliveryData}
                        />
                        <div className="flex flex-col gap-y-2 mt-4">
                          <StatusCheckBox
                            id={selectedDeliveryData.order_header_id}
                            label="รับผ้าสำเร็จ"
                            onChange={async () => {
                              const basketId =
                                selectedDeliveryData.order_details.find(
                                  (order) =>
                                    order.service_type === EServiceType.Pickup
                                )?.order_basket_id;

                              if (basketId) {
                                const updateDTO: IOrderUpdateDTO = {
                                  finished_at: new Date().toISOString(),
                                  machine_serial: null,
                                  order_basket_id: basketId,
                                  order_status: EOrderStatus.Completed,
                                };
                                await handleUpdateOrder(updateDTO);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Processing Section */}
                    {(statusSelectedDeliveryData ===
                      EWorkingStatus.BackToStore ||
                      statusSelectedDeliveryData ===
                        EWorkingStatus.Processing) && (
                      <div className="w-full md:w-3/5 lg:w-full col-span-5 flex flex-col gap-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 justify-center items-center">
                          {selectedDeliveryData.order_details
                            .sort((a, b) =>
                              b.service_type.localeCompare(a.service_type)
                            )
                            .filter(
                              (item) =>
                                item.service_type === EServiceType.Drying ||
                                item.service_type === EServiceType.Washing
                            )
                            .map((order, index) => {
                              return (
                                <div className="flex flex-col gap-y-2">
                                  <p className="text-center font-medium text-xl">
                                    ตระกร้าที่ {index + 1}
                                  </p>
                                  <BasketCard
                                    data={order}
                                    title={
                                      order.order_status ===
                                      EOrderStatus.Processing
                                        ? (order.service_type ===
                                          EServiceType.Washing
                                            ? "เครื่องซัก "
                                            : "เครื่องอบ ") +
                                          order.machine_serial
                                        : undefined
                                    }
                                  />
                                </div>
                              );
                            })}
                        </div>
                        <StatusCheckBox
                          id={
                            selectedDeliveryData.order_header_id + "-processing"
                          }
                          label="ดำเนินการจัดส่งผ้า"
                          disabled={
                            !selectedDeliveryData.order_details
                              .filter(
                                (item) =>
                                  item.service_type === EServiceType.Drying ||
                                  item.service_type === EServiceType.Washing
                              )
                              .every(
                                (item) =>
                                  item.order_status === EOrderStatus.Completed
                              )
                          }
                          onChange={async () => {
                            const basketId =
                              selectedDeliveryData.order_details.find(
                                (order) =>
                                  order.service_type === EServiceType.Delivery
                              )?.order_basket_id;

                            if (basketId) {
                              const updateDTO: IOrderUpdateDTO = {
                                finished_at: new Date().toISOString(),
                                machine_serial: null,
                                order_basket_id: basketId,
                                order_status: EOrderStatus.Processing,
                              };
                              await handleUpdateOrder(updateDTO);
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Out for Delivery Section */}
                    {statusSelectedDeliveryData ===
                      EWorkingStatus.OutForDelivery && (
                      <div className="w-full md:w-3/5 lg:w-full lg:col-span-3 lg:col-start-2 lg:col-end-5">
                        <SummaryOrderCard
                          data={selectedDeliveryData}
                          status={statusSelectedDeliveryData}
                        />
                        <div className="flex flex-col gap-y-2 mt-4">
                          <StatusCheckBox
                            id={selectedDeliveryData.order_header_id}
                            label="จัดส่งสำเร็จ"
                            onChange={async () => {
                              const basketId =
                                selectedDeliveryData.order_details.find(
                                  (order) =>
                                    order.service_type === EServiceType.Delivery
                                )?.order_basket_id;

                              if (basketId) {
                                const updateDTO: IOrderUpdateDTO = {
                                  finished_at: new Date().toISOString(),
                                  machine_serial: null,
                                  order_basket_id: basketId,
                                  order_status: EOrderStatus.Completed,
                                };
                                await handleUpdateOrder(updateDTO);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {(statusSelectedDeliveryData === EWorkingStatus.Canceled ||
                      statusSelectedDeliveryData ===
                        EWorkingStatus.Completed) && (
                      <div className="w-full md:w-3/5 lg:w-full lg:col-span-3 lg:col-start-2 lg:col-end-5">
                        <SummaryOrderCard
                          data={selectedDeliveryData}
                          status={statusSelectedDeliveryData}
                        />
                      </div>
                    )}
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

          if (!selectedDeliveryData) return;

          await Promise.all(
            selectedDeliveryData.order_details.map(async (orderDetail) => {
              const updateDTO: IOrderUpdateDTO = {
                finished_at: new Date().toISOString(),
                machine_serial: null,
                order_basket_id: orderDetail.order_basket_id,
                order_status: EOrderStatus.Canceled,
              };

              await handleUpdateOrder(updateDTO);
            })
          );

          setLoadingCancel(false);
          setOpenDeleteModal(false);
        }}
        title={`ยืนยันการยกเลิก ORDER #${selectedDeliveryData?.order_header_id} `}
        message={["คุณต้องการยกเลิก ORDER นี้ใช่หรือไม่"]}
        loading={loadingCancel}
        variant="delete"
      />
    </>
  );
};

export default OrderPage;
