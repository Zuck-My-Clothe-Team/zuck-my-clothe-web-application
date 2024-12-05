/* eslint-disable @typescript-eslint/no-explicit-any */
import { Select } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { GetAllOrder, GetOrderByBranch } from "../../api/order.api";
import { useAuth } from "../../context/auth.context";
import {
  EServiceType,
  IOrder,
  MachinePrice,
} from "../../interface/order.interface";
import { Role } from "../../interface/userdetail.interface";
import LoadingPage from "../LoadingPage";
import LineChart from "./LineChart";
import DonutChart from "./DonutChart";
import { ToastNotification } from "../../components/Toast/Toast";

interface IDashboardStat {
  order_number: string;
  revenue: string;
  client_number: string;
  review: string;
  line_chart: any;
  donut_chart: any;
}

// const onlyUnique = (value: IOrder, index: number, array: IOrder[]) => {
//   return array.indexOf(value) === index;
// };

export default function ManagerDashboard() {
  const auth = useAuth();
  const { branch_id } = useParams<{ branch_id: string }>();

  const [timeframe, setTimeframe] = useState<"day" | "month" | "year">("month");
  const [zuckType, setZuckType] = useState<"all" | "online" | "onsite">("all");
  const [orderData, setOrderData] = useState<IOrder[]>([]);
  const [filteredData, setFilteredData] = useState<IOrder[]>([]);
  const [dbData, setDbData] = useState<IDashboardStat>({
    order_number: "0",
    revenue: "0",
    client_number: "0",
    review: "0",
    line_chart: null,
    donut_chart: null,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      // if (!branch_id) throw new Error("branch id undefined");
      let res;
      if (auth?.authContext?.role === Role.SuperAdmin) {
        res = await GetAllOrder();
      } else if (auth?.authContext?.role === Role.BranchManager && branch_id) {
        res = await GetOrderByBranch(branch_id);
      }

      if (!res) return;

      if (res.status != 200) throw new Error("Cannot Get Order Data");

      setOrderData(res.data);
      setFilteredData(res.data);

      setLoading(false);
    } catch (error) {
      console.error(error);
      ToastNotification.error({
        config: {
          message: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลได้ได้ " + error,
          duration: 5,
        },
      });
      throw error;
    }
  }, [auth, branch_id]);

  useMemo(async () => {
    await fetchData();
  }, [fetchData]);

  useMemo(() => {
    // ---------- order number ----------
    const order_number = filteredData.length;

    // ---------- revenue ----------
    const orderdetail = filteredData.map((item) => item.order_details).flat();
    let revenue = 0;
    orderdetail.map((item) => {
      if (
        item.service_type == EServiceType.Delivery ||
        item.service_type == EServiceType.Pickup ||
        item.service_type == EServiceType.Agents
      ) {
        revenue += 20;
      } else if (
        item.service_type == EServiceType.Washing ||
        item.service_type == EServiceType.Drying
      ) {
        if ([7, 14, 21].includes(item.weight)) {
          revenue += MachinePrice[item.weight];
        }
      }
    });
    // console.log(orderdetail);

    // ---------- client number ----------
    const clients = filteredData.map((item) => item.user_id);
    const client_number = clients.filter(
      (user_id, index) => clients.indexOf(user_id) === index
    );

    // ---------- reviews ----------
    let review_score = 0;
    const reviews = filteredData.filter((item) => item.star_rating != null);

    reviews.map((item) => {
      review_score += item.star_rating;
    });

    review_score /= reviews.length;

    // ---------- line chart ----------

    // const dates = filteredData.map((item) => item.created_at);
    // const date_label = dates.filter(
    //   (item, index) => dates.indexOf(item) === index
    // );

    let date_label = Array.from({ length: 30 }, (_, i) => i + 1);

    if (timeframe == "day") {
      date_label = Array.from({ length: 24 }, (_, i) => i + 1);
    } else if (timeframe == "year") {
      date_label = Array.from({ length: 12 }, (_, i) => i);
    }

    const order_by_date = date_label.map(
      (item) =>
        filteredData.filter(
          timeframe == "day"
            ? (data) => new Date(data.created_at).getHours() == item
            : timeframe == "month"
            ? (data) => new Date(data.created_at).getDate() == item
            : (data) => new Date(data.created_at).getMonth() == item
        ).length
    );

    if (timeframe == "year") {
      date_label = date_label.map((item) => item + 1);
    }

    // console.log(date_label, order_by_date);

    const linechart = {
      labels: date_label,
      datasets: [
        {
          label: "Orders Quantity",
          data: order_by_date,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const donutData = {
      labels: ["Delivery", "Onsite"], // Label names
      datasets: [
        {
          label: "Order Types",
          data: [
            filteredData.filter((item) => !item.zuck_onsite).length,
            filteredData.filter((item) => item.zuck_onsite).length,
          ],
          backgroundColor: ["#4BC0C0", "#36A2EB"], // Hover colors
          borderWidth: 1,
        },
      ],
    };

    // ---------- set data ----------
    const numberWithCommas = (x: number) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    setDbData({
      order_number: numberWithCommas(order_number),
      revenue: numberWithCommas(revenue),
      client_number: numberWithCommas(client_number.length),
      review: review_score.toFixed(1),
      line_chart: linechart,
      donut_chart: donutData,
    });
    // console.log(dbData);
  }, [filteredData, timeframe, zuckType]);

  useEffect(() => {
    let data = orderData;

    if (timeframe == "day") {
      data = data.filter(
        (item) =>
          new Date(item.created_at).getFullYear() == new Date().getFullYear() &&
          new Date(item.created_at).getMonth() == new Date().getMonth() &&
          new Date(item.created_at).getDate() == new Date().getDate()
      );
    } else if (timeframe == "month") {
      data = data.filter(
        (item) =>
          new Date(item.created_at).getFullYear() == new Date().getFullYear() &&
          new Date(item.created_at).getMonth() == new Date().getMonth()
      );
    } else if (timeframe == "year") {
      data = data.filter(
        (item) =>
          new Date(item.created_at).getFullYear() == new Date().getFullYear()
      );
    }

    if (zuckType == "online") {
      data = data.filter((item) => !item.zuck_onsite);
    } else if (zuckType == "onsite") {
      data = data.filter((item) => item.zuck_onsite);
    }

    // console.log(data);
    setFilteredData(data);
  }, [timeframe, zuckType]);

  const dataNumber = [
    {
      key: "order",
      label: "ออเดอร์ทั้งหมด",
      number: <span>{dbData.order_number}</span>,
      unit: "ออเดอร์",
    },
    {
      key: "revenue",
      label: "รายได้",
      number: <span>{dbData.revenue}</span>,
      unit: "บาท",
    },
    {
      key: "client",
      label: "จำนวนลูกค้า",
      number: <span>{dbData.client_number}</span>,
      unit: "คน",
    },
    {
      key: "review",
      label: "คะแนนรีวิวเฉลี่ย",
      number: (
        <span className="flex justify-center items-center">
          {dbData.review != "0.0" && dbData.review != "NaN" ? (
            <>
              {dbData.review}
              <FaStar className="inline text-4xl text-yellow-400" />
            </>
          ) : (
            <span className="text-3xl">ยังไม่มีรีวิว</span>
          )}
        </span>
      ),
    },
  ];

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-kanit font-medium text-text-1">
        สรุปยอดการซัก
      </h2>

      <div className="flex flex-wrap gap-x-6 p-6 gap-y-2">
        <div>
          <h2>ระยะเวลา</h2>
          <Select
            defaultValue="เดือนนี้"
            style={{ width: 160 }}
            onChange={(value) =>
              setTimeframe(value as "day" | "month" | "year")
            }
            options={[
              { value: "day", label: "วันนี้" },
              { value: "month", label: "เดือนนี้" },
              { value: "year", label: "ปีนี้" },
            ]}
          />
        </div>

        <div>
          <h2>ประเภทออเดอร์</h2>
          <Select
            defaultValue="ทั้งหมด"
            style={{ width: 160 }}
            onChange={(value) =>
              setZuckType(value as "all" | "online" | "onsite")
            }
            options={[
              { value: "all", label: "ทั้งหมด" },
              { value: "online", label: "เดลิเวอรี่" },
              { value: "onsite", label: "ซักที่ร้าน" },
            ]}
          />
        </div>
      </div>

      <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dataNumber.map((item) => (
          <div
            key={item.key}
            className="bg-white aspect-square p-4 rounded-md shadow-md flex flex-col justify-between h-full"
          >
            <div>{item.label}</div>
            <div className="text-center">
              <span className="text-5xl font-semibold ">{item.number}</span>
              <div className="text-lg">{item.unit}</div>
            </div>
            <div className="text-center">
              {timeframe == "day"
                ? "วันนี้"
                : timeframe == "month"
                ? "เดือนนี้"
                : "ปีนี้"}
            </div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 px-6 gap-4 overflow-x-auto">
        {/* <div className=" col-span-2 bg-white p-4 rounded-md shadow-md"></div> */}

        <div className="col-span-2 bg-white p-6 rounded-md shadow-md">
          <h1 className="text-xl font-semibold">จำนวนออเดอร์</h1>
          <div className="flex flex-col justify-center items-center">
            <LineChart data={dbData.line_chart} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-md">
          <h1 className="text-xl font-semibold">ประเภทออเดอร์</h1>
          <div className="flex flex-col justify-center items-center">
            <DonutChart data={dbData.donut_chart} />
          </div>
        </div>
      </div>
    </div>
  );
}
