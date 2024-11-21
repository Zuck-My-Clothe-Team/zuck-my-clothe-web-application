import { AiFillHome } from "react-icons/ai";
import { Link } from "react-router-dom";

type BranchCardProps = {
  branch_id: string;
  branch_name: string;
};

const BranchCard: React.FC<BranchCardProps> = (props) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-center h-[300px]">
      <div className="bg-background-1 py-12 px-6 flex flex-row justify-center">
        <AiFillHome className="text-customgray-300 size-32" />
      </div>
      <div className="mt-4">
        <Link
          to={`/manager/${props.branch_id}/dashboard`}
          className="text-text-3 hover:text-primaryblue-100 text-xl font-medium block overflow-hidden text-ellipsis whitespace-nowrap"
        >
          สาขา {props.branch_name}
        </Link>
      </div>
    </div>
  );
};

export default BranchCard;
