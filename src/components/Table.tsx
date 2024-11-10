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
    <div style={{ overflowX: "auto" }}>
      <Table
        locale={{
          emptyText: "ไม่พบข้อมูล",
        }}
        columns={props.columns}
        loading={props.loading}
        dataSource={props.dataSource}
      />
    </div>
  );
};

export default TableInfo;
