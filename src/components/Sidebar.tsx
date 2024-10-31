import {
  HomeFilled,
  MehFilled,
  FundFilled,
  ToolFilled,
  SettingFilled,
  BulbFilled,
  FileExclamationFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.context";
import { IoIosLogOut } from "react-icons/io";

const Sidebar = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const sidebarItems = [
    {
      icon: <HomeFilled style={{ fontSize: "130%" }} />,
      label: "Home Page",
      path: "/home",
    },
    {
      icon: <FundFilled style={{ fontSize: "130%" }} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <ToolFilled style={{ fontSize: "130%" }} />,
      label: "Machine",
      path: "/machine",
    },
    {
      icon: <MehFilled style={{ fontSize: "130%" }} />,
      label: "Staff",
      path: "/staff",
    },
    {
      icon: <FileExclamationFilled style={{ fontSize: "130%" }} />,
      label: "Report",
      path: "/report",
    },
    {
      icon: <BulbFilled style={{ fontSize: "130%" }} />,
      label: "Help",
      path: "/help",
    },
    {
      icon: <SettingFilled style={{ fontSize: "130%" }} />,
      label: "Settings",
      path: "/settings",
    },
  ];

  return (
    <div className="lg:w-[275px] xl:w-[350px] h-screen py-4">
      <div
        className="relative h-full bg-white rounded-[30px] text-gray-500 p-4 transition-transform duration-300 ease-in-out transform lg:translate-x-2 xl:translate-x-4"
        style={{ boxShadow: "0px 4px 14.2px 3px rgba(0, 0, 0, 0.25)" }}
      >
        <nav>
          <img
            src="/images/logo-withname.png"
            alt="Logo"
            className="w-full h-full"
          />

          <ul className="space-y-1">
            {sidebarItems.map((item, index) => (
              <li
                key={index}
                className={`px-2 py-2.5 rounded-md cursor-pointer whitespace-pre ${
                  location.pathname.includes(item.path)
                    ? "bg-sky-400 text-white"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute transform lg:translate-x-2 xl:translate-x-4 bottom-6 w-full">
          <div className="flex flex-row items-center lg:gap-x-2 xl:gap-x-4 w-full">
            <div className="rounded-full bg-gray-400">
              <img
                src={auth?.authContext.profile_image_url}
                className="lg:size-10 xl:size-14 rounded-full"
                alt="Profile"
              />
            </div>
            <div className="flex flex-col">
              <div className="text-lg text-text-3">
                {auth?.authContext.firstname.toUpperCase()}{" "}
                {auth?.authContext.lastname.substring(0, 4).toUpperCase()}
              </div>
              <div className="text-sm text-text-4">
                {auth?.authContext.email}
              </div>
            </div>
            <div>
              <IoIosLogOut
                className="size-8 cursor-pointer"
                onClick={async () => {
                  await auth?.logout();
                  navigate("/");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
