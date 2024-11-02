import { IoIosLogOut } from "react-icons/io";
import { useAuth } from "../context/auth.context";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="bg-secondaryblue-100 w-screen flex flex-row justify-between py-4 lg:py-0 px-6 items-center">
      <img
        src="/images/logo-withname.png"
        className="w-auto h-24 hidden lg:block"
      />
      <img src="/images/logo.png" className="w-auto h-12 lg:hidden" />
      <div className="flex flex-row items-center gap-x-4">
        <img
          src={auth?.authContext.profile_image_url || "/images/user.png"}
          className="lg:size-10 xl:size-14 rounded-full hidden lg:block"
          alt="Profile"
        />
        <div className="flex flex-col">
          <div className="text-lg text-text-3">
            {auth?.authContext.firstname.toUpperCase()}{" "}
            {auth?.authContext.lastname.toUpperCase()}
          </div>
          <div className="text-sm text-text-4">{auth?.authContext.email}</div>
        </div>
        <IoIosLogOut
          className="size-8 text-primaryblue-300 cursor-pointer"
          onClick={async () => {
            await auth?.logout();
            navigate("/");
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
