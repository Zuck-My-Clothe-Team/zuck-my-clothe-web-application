import {
  FileExclamationFilled,
  FundFilled,
  HomeFilled,
  MehFilled,
  ToolFilled,
} from "@ant-design/icons";
import { BsBasket3Fill, BsCart } from "react-icons/bs";
import { IoIosLogOut } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth.context";

const Sidebar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { branch_id } = useParams<{ branch_id: string }>();

  const isSuperAdmin = auth?.authContext.role === "SuperAdmin";
  const isEmployee = auth?.authContext.role === "Employee";

  const getPath = (basePath: string) => {
    if (isSuperAdmin) {
      return `/admin/${basePath}`;
    } else if (isEmployee) {
      return `/employee/${branch_id}/${basePath}`;
    } else {
      return `/manager/${branch_id}/${basePath}`;
    }
  };

  const restrictedPagesForEmployees = ["branch", "staff", "dashboard"];

  const sidebarItems = [
    {
      icon: <FundFilled style={{ fontSize: "130%" }} />,
      label: "Dashboard",
      path: getPath("dashboard"),
    },
    {
      icon: <BsBasket3Fill style={{ fontSize: "130%" }} />,
      label: "Order",
      path: getPath("order"),
    },
    {
      icon: <BsCart style={{ fontSize: "130%" }} />,
      label: "Delivery",
      path: getPath("delivery"),
    },
    {
      icon: <FileExclamationFilled style={{ fontSize: "130%" }} />,
      label: "Report",
      path: getPath("report"),
    },
    {
      icon: <ToolFilled style={{ fontSize: "130%" }} />,
      label: "Machine",
      path: getPath("machine"),
    },
    {
      icon: <MehFilled style={{ fontSize: "130%" }} />,
      label: "Staff",
      path: getPath("staff"),
    },
    {
      icon: <HomeFilled style={{ fontSize: "130%" }} />,
      label: "Branch",
      path: isSuperAdmin ? "/admin/home" : `/manager/home`,
    },
  ].filter(
    (item) =>
      !(
        isEmployee &&
        restrictedPagesForEmployees.includes(item.label.toLowerCase())
      )
  );

  return (
    <div className="w-[70px] lg:w-[255px] xl:w-[300px] h-screen sticky top-0 py-4">
      <div
        className="h-full bg-white rounded-[30px] text-gray-500 p-4 transition-transform duration-300 ease-in-out transform translate-x-3 lg:translate-x-2 xl:translate-x-4"
        style={{ boxShadow: "0px 4px 14.2px 3px rgba(0, 0, 0, 0.25)" }}
      >
        <nav className="flex flex-col justify-between h-full relative space-y-1">
          <div>
            <img
              src="/images/logo-withname.png"
              alt="Logo"
              className="w-full hidden lg:block"
            />
            <img
              src="/images/logo.png"
              alt="Logo"
              className="size-10 aspect-square lg:hidden my-4"
            />

            <ul>
              {sidebarItems.map((item, index) => (
                <li
                  key={index}
                  className={`px-2 py-2 mt-1.5 lg:mt-0 lg:py-2.5 rounded-full lg:rounded-md cursor-pointer whitespace-pre ${
                    location.pathname.includes(item.path)
                      ? "bg-sky-400 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="flex flex-row gap-x-2">
                    {item.icon} <p className="hidden lg:block">{item.label}</p>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-2 xl:gap-4 w-full">
            <div className="rounded-full bg-gray-400 hidden lg:block">
              <img
                src={auth?.authContext.profile_image_url || "/images/user.png"}
                className="lg:size-8 xl:size-12 rounded-full"
                alt="Profile"
              />
            </div>
            <div className="lg:flex lg:flex-col hidden">
              <div className="text-lg text-text-3">
                {auth?.authContext.firstname.toUpperCase()}{" "}
                {auth?.authContext.lastname.substring(0, 4).toUpperCase()}
              </div>
              <div className="text-sm text-text-4">
                {auth?.authContext.email}
              </div>
            </div>
            <div className="">
              <IoIosLogOut
                className="size-8 cursor-pointer"
                onClick={async () => {
                  await auth?.logout();
                  navigate("/");
                }}
              />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
