import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth.context";
import { IUserDetail, Role } from "../../interface/userdetail.interface";
import { CheckToken } from "../../api/auth.api";

const ProtectedLogin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          navigate("/login");
          return;
        }

        const result = await CheckToken();
        const UserDetail = result.data as IUserDetail;

        if (!UserDetail || !UserDetail.data || !UserDetail.data.role) {
          localStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }

        const userRole = UserDetail.data.role;
        switch (userRole) {
          case Role.Client:
            localStorage.removeItem("accessToken");
            navigate("/login");
            break;
          case Role.BranchManager:
            if (location.pathname.startsWith("/admin")) {
              navigate("/manager/home");
            }
            break;
          case Role.SuperAdmin:
            if (location.pathname.startsWith("/manager")) {
              navigate("/admin/home");
            }
            break;
          default:
            localStorage.removeItem("accessToken");
            navigate("/login");
            break;
        }

        auth?.setAuthContext(UserDetail.data);
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedLogin;
