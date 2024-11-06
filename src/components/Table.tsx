import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

type TableProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnsType<any>;
  dataSource: object[];
  loading: boolean;
};

const TableInfo: React.FC<TableProps> = (props) => {
  return (
    <>
      <Table
        locale={{
          emptyText: "ไม่พบข้อมูล",
        }}
        columns={props.columns}
        loading={props.loading}
        dataSource={props.dataSource}
      />
    </>
  );
};

export default TableInfo;
