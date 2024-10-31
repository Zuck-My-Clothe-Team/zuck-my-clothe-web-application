import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

type TableProps = {
  columns: ColumnsType;
  dataSource: object[];
  loading: boolean;
};

const TableInfo: React.FC<TableProps> = (props) => {
  return (
    <>
      <Table
        columns={props.columns}
        loading={props.loading}
        dataSource={props.dataSource}
      />
    </>
  );
};

export default TableInfo;
