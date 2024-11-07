import { GoogleMap, Libraries, useLoadScript } from "@react-google-maps/api";
import { Button, Form, Input, Modal, Select, Spin } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { UpdateBranch } from "../../api/branch.api";
import { IBranch } from "../../interface/branch.interface";
import { UserDetail } from "../../interface/userdetail.interface";
import {
  DEFAULT_CENTER,
  DEFAULT_LAT,
  DEFAULT_LONG,
  DEFAULT_ZOOM,
} from "../../utils/const";

type UpdateBranchModalType = {
  isOpen: boolean;
  onClose: () => unknown;
  data: IBranch;
  managers: UserDetail[];
};

const libraries: Libraries = ["marker"];

const UpdateBranchModal: React.FC<UpdateBranchModalType> = (props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: IBranch) => {
    setLoading(true);
    try {
      values.branch_id = props.data.branch_id;
      const result = await UpdateBranch(values);
      if (!result || result.status !== 200) throw new Error("เกิดข้อผิดพลาด");
      form.resetFields();
      props.onClose();
      window.location.reload();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

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

  useEffect(() => {
    if (props.data) {
      form.setFieldsValue(props.data);
      setMarkerPosition({
        lat: props.data.branch_lat ?? DEFAULT_LAT,
        lng: props.data.branch_long ?? DEFAULT_LONG,
      });
    }
  }, [props.data]);

  return (
    <Modal
      title={
        <div className="text-center">
          <h4 className="font-medium text-3xl">แก้ไขข้อมูลสาขา</h4>
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
                disabled={loading}
              />
            </Form.Item>
            <Form.Item<IBranch>
              label="ที่อยู่สาขา"
              name="branch_detail"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกที่อยู่สาขา",
                },
              ]}
            >
              <Input
                className=" w-full mt-2 text-sm h-8"
                placeholder="ที่อยู่สาขา"
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

            <Button htmlType="submit" type="primary" disabled={loading}>
              {loading ? <Spin /> : "แก้ไขผู้จัดการสาขา"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default UpdateBranchModal;
