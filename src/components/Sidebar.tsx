import {
  HomeFilled,
  MehFilled,
  FundFilled,
  ToolFilled,
  SettingFilled,
  BulbFilled,
  FileExclamationFilled,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth.context";
import { IoIosLogOut } from "react-icons/io";

const Sidebar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { branch_id } = useParams<{ branch_id: string }>();

  const isSuperAdmin = auth?.authContext.role === "SuperAdmin";

  const sidebarItems = [
    {
      icon: <HomeFilled style={{ fontSize: "130%" }} />,
      label: "Home Page",
      path: isSuperAdmin ? "/admin/home" : `/manager/home`,
    },
    {
      icon: <FundFilled style={{ fontSize: "130%" }} />,
      label: "Dashboard",
      path: isSuperAdmin
        ? "/admin/dashboard"
        : `/manager/${branch_id}/dashboard`,
    },
    {
      icon: <ToolFilled style={{ fontSize: "130%" }} />,
      label: "Machine",
      path: isSuperAdmin ? "/admin/machine" : `/manager/${branch_id}/machine`,
    },
    {
      icon: <MehFilled style={{ fontSize: "130%" }} />,
      label: "Staff",
      path: isSuperAdmin ? "/admin/staff" : `/manager/${branch_id}/staff`,
    },
    {
      icon: <FileExclamationFilled style={{ fontSize: "130%" }} />,
      label: "Report",
      path: isSuperAdmin ? "/admin/report" : `/manager/${branch_id}/report`,
    },
    {
      icon: <BulbFilled style={{ fontSize: "130%" }} />,
      label: "Help",
      path: isSuperAdmin ? "/admin/help" : `/manager/${branch_id}/help`,
    },
    {
      icon: <SettingFilled style={{ fontSize: "130%" }} />,
      label: "Settings",
      path: isSuperAdmin ? "/admin/settings" : `/manager/${branch_id}/settings`,
    },
  ];

  return (
    <div className="w-[70px] lg:w-[255px] xl:w-[300px] h-screen sticky py-4">
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
                  className={`px-2 py-2.5 rounded-full lg:rounded-md cursor-pointer whitespace-pre ${
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
                className="lg:size-10 xl:size-14 rounded-full"
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
