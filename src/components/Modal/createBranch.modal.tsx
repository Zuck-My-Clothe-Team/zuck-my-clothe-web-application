import { GoogleMap, Libraries, useLoadScript } from "@react-google-maps/api";
import { Button, Form, Input, Modal, Select } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreateBranch } from "../../api/branch.api";
import DISTRICT from "../../assets/json/district.json";
import PROVINCE from "../../assets/json/province.json";
import SUBDISTRICT from "../../assets/json/subdistrict.json";
import { IBranch, IBranchCreate } from "../../interface/branch.interface";
import { UserDetail } from "../../interface/userdetail.interface";
import {
  DEFAULT_CENTER,
  DEFAULT_LAT,
  DEFAULT_LONG,
  DEFAULT_ZOOM,
} from "../../utils/const";
import { ToastNotification } from "../Toast/Toast";

type CreateBranchModalType = {
  isOpen: boolean;
  onClose: () => unknown;
  managers: UserDetail[];
  fetchData: () => Promise<void>;
};

const libraries: Libraries = ["marker"];

const CreateBranchModal: React.FC<CreateBranchModalType> = (props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [postcode, setPostcode] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("");

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  }>(DEFAULT_CENTER);

  const onMapDrag = useCallback(() => {
    if (mapRef.current) {
      const lat = mapRef.current.getCenter()?.lat();
      const lng = mapRef.current.getCenter()?.lng();
      if (lat && lng) {
        setMarkerPosition({ lat, lng });
        form.setFieldsValue({
          branch_lat: lat,
          branch_long: lng,
        });
      }
    }
  }, [form]);

  useEffect(() => {
    if (props.isOpen) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setFieldsValue({
            branch_lat: position.coords.latitude ?? 0,
            branch_long: position.coords.longitude ?? 0,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.error(
              "Geolocation permission denied. Please enable it in your browser settings."
            );
            ToastNotification.error({
              config: {
                message: "ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้",
                description: "กรุณาเปิดการเข้าถึงตำแหน่งปัจจุบันของคุณ",
                duration: 5,
                showProgress: true,
              },
            });
            form.setFieldsValue({
              branch_lat: DEFAULT_LAT,
              branch_long: DEFAULT_LONG,
            });
          } else {
            console.error(
              "An error occurred while retrieving geolocation: ",
              error.message
            );
          }
        }
      );
    }
  }, [props.isOpen, form]);

  useEffect(() => {
    if (isLoaded && mapRef.current && markerPosition) {
      if (markerRef.current) {
        markerRef.current.map = null;
      }

      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: markerPosition,
        map: mapRef.current,
      });
    }
  }, [isLoaded, markerPosition]);

  useMemo(() => {
    form.setFieldsValue({
      subdistrict: null,
      district: null,
      province: null,
    });
  }, [postcode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    const data: IBranchCreate = {
      branch_name: values.branch_name,
      branch_lat: values.branch_lat,
      branch_long: values.branch_long,
      owner_user_id: values.owner_user_id,
      branch_detail:
        values.no +
        " " +
        values.soi +
        " " +
        values.road +
        " " +
        values.subdistrict +
        " " +
        values.district +
        " " +
        values.province +
        " " +
        values.postcode,
    };
    setLoading(true);
    try {
      const result = await CreateBranch(data);
      if (!result || result.status !== 201) throw new Error("เกิดข้อผิดพลาด");
      form.resetFields();
      props.onClose();
      await props.fetchData();
      ToastNotification.success({
        config: {
          message: "สร้างสาขาสำเร็จ",
          description: `สาขา ${values.branch_name} ถูกเพิ่มเข้าสู่ระบบแล้ว`,
        },
      });
      setLoading(false);
    } catch (error) {
      ToastNotification.error({
        config: {
          message: "ไม่สามารถสร้างสาขาได้",
          description: `เกิดข้อผิดพลาด: ${error}`,
        },
      });
      console.log(error);
    }
  };
  return (
    <Modal
      title={
        <div className="text-center">
          <h4 className="font-medium text-3xl">สร้างสาขาใหม่</h4>
        </div>
      }
      open={props.isOpen}
      onCancel={props.onClose}
      width={480}
      footer={null}
      centered
    >
      <div className="my-4">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="flex flex-col gap-y-4">
            <Form.Item<IBranch>
              label="ชื่อสาขา"
              name="branch_name"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกชื่อสาขา",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="ชื่อสาขา"
                maxLength={64}
                disabled={loading}
              />
            </Form.Item>
            <Form.Item<IBranch>
              label="ผู้จัดการสาขา"
              name="owner_user_id"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกเลือกผู้จัดการสาขา",
                },
              ]}
            >
              <Select
                className="w-full mt-2 text-sm h-8"
                placeholder="ผู้จัดการสาขา"
                disabled={loading}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {props.managers.map((manager: UserDetail, index: number) => (
                  <Select.Option key={index} value={manager.user_id}>
                    {manager.firstname + " " + manager.lastname}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <hr />
            <h5 className="font-medium text-xl">ตำแหน่งสาขา</h5>
            <div>
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "350px" }}
                  zoom={DEFAULT_ZOOM}
                  center={markerPosition}
                  options={{ mapId: "23bbfe3d1c0e069d" }}
                  onLoad={(map) => {
                    mapRef.current = map;
                  }}
                  onDragEnd={onMapDrag}
                ></GoogleMap>
              )}
            </div>
            <div className="flex flex-row gap-x-4 justify-between">
              <div className="w-full">
                <Form.Item<IBranch>
                  label="ตำแหน่ง (ละติจูด)"
                  name="branch_lat"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกตำแหน่ง (ละติจูด)",
                    },
                  ]}
                >
                  <Input
                    className=" w-full mt-2 text-sm h-8"
                    placeholder="ตำแหน่ง (ละติจูด)"
                    disabled={true}
                  />
                </Form.Item>
              </div>
              <div className="w-full">
                <Form.Item<IBranch>
                  label="ตำแหน่ง (ลองจิจูด)"
                  name="branch_long"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกตำแหน่ง (ลองจิจูด)",
                    },
                  ]}
                >
                  <Input
                    className=" w-full mt-2 text-sm h-8"
                    placeholder="ตำแหน่ง (ลองจิจูด)"
                    disabled={true}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex flex-row gap-x-4 justify-between">
              <div className="w-full">
                <Form.Item
                  label="เลขที่"
                  name="no"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกเลขที่",
                    },
                  ]}
                >
                  <Input
                    className=" w-full mt-2 text-sm h-8"
                    placeholder="เลขที่"
                    maxLength={8}
                    disabled={loading}
                  />
                </Form.Item>
              </div>
              <div className="w-full">
                <Form.Item
                  label="ซอย"
                  name="soi"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกซอย",
                    },
                  ]}
                >
                  <Input
                    className=" w-full mt-2 text-sm h-8"
                    placeholder="ซอย"
                    maxLength={32}
                    disabled={loading}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex flex-row gap-x-4 justify-between">
              <div className="w-full">
                <Form.Item
                  label="ถนน"
                  name="road"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกถนน",
                    },
                  ]}
                >
                  <Input
                    className=" w-full mt-2 text-sm h-8"
                    placeholder="ถนน"
                    maxLength={64}
                    disabled={loading}
                  />
                </Form.Item>
              </div>
              <div className="w-full">
                <Form.Item
                  label="เลขไปรษณีย์"
                  name="postcode"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกเลขไปรษณีย์",
                    },
                    {
                      min: 5,
                      max: 5,
                      message: "กรุณากรอกเลขไปรษณีย์ให้ถูกต้อง",
                    },
                  ]}
                >
                  <Input
                    className=" w-full mt-2 text-sm h-8"
                    placeholder="เลขไปรษณีย์"
                    disabled={loading}
                    minLength={5}
                    maxLength={5}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex flex-row gap-x-4 justify-between">
              <div className="w-full">
                <Form.Item
                  label="ตำบล / แขวง"
                  name="subdistrict"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกเลือกตำบล / แขวง",
                    },
                  ]}
                >
                  <Select
                    className="w-full mt-2 text-sm h-8"
                    placeholder="ตำบล / แขวง"
                    disabled={loading}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children ?? "")
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={(value) =>
                      setDistrictId(
                        String(
                          SUBDISTRICT.find(
                            (item) =>
                              item.name_th == value &&
                              item.zip_code == Number(postcode)
                          )?.amphure_id
                        ) || ""
                      )
                    }
                  >
                    {SUBDISTRICT.filter(
                      (item) => item.zip_code == Number(postcode)
                    ).map((item, index: number) => (
                      <Select.Option key={index} value={item.name_th}>
                        {item.name_th}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="w-full">
                <Form.Item
                  label="อำเภอ / เขต"
                  name="district"
                  rules={[
                    {
                      required: true,
                      message: "กรุณากรอกเลือกอำเภอ / เขต",
                    },
                  ]}
                >
                  <Select
                    className="w-full mt-2 text-sm h-8"
                    placeholder="อำเภอ / เขต"
                    disabled={loading}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children ?? "")
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={() =>
                      setProvinceId(
                        String(
                          DISTRICT.find(
                            (item) =>
                              item.id ==
                              SUBDISTRICT.find(
                                (item) =>
                                  item.name_th ==
                                    form.getFieldValue("subdistrict") &&
                                  item.zip_code == Number(postcode)
                              )?.amphure_id
                          )?.province_id
                        ) || ""
                      )
                    }
                  >
                    {DISTRICT.filter(
                      (item) => item.id == Number(districtId)
                    ).map((item, index: number) => (
                      <Select.Option key={index} value={item.name_th}>
                        {item.name_th}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className="w-full">
              <Form.Item
                label="จังหวัด"
                name="province"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเลือกจังหวัด",
                  },
                ]}
              >
                <Select
                  className="w-full mt-2 text-sm h-8"
                  placeholder="จังหวัด"
                  disabled={loading}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children ?? "")
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {PROVINCE.filter((item) => item.id == Number(provinceId)).map(
                    (item, index: number) => (
                      <Select.Option key={index} value={item.name_th}>
                        {item.name_th}
                      </Select.Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </div>
            <Button
              htmlType="submit"
              type="primary"
              disabled={loading}
              className="disabled:!bg-primaryblue-300/90 disabled:!border-disabled disabled:!text-white"
            >
              {loading ? "กำลังเพิ่มสาขาใหม่" : "สร้างสาขา"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateBranchModal;
