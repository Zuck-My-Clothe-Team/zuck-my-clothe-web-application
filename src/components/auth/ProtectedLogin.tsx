import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckToken } from "../../api/auth.api";
import { GetEmployeeContractsByUserID } from "../../api/employee-contract.api";
import { useAuth } from "../../context/auth.context";
import { IUserDetail, Role } from "../../interface/userdetail.interface";

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

        let branch_id = "";

        if (userRole === Role.Employee) {
          const result = await GetEmployeeContractsByUserID(
            UserDetail.data.user_id as string
          );
          branch_id = result.data[0].branch_id;
        }

        switch (userRole) {
          case Role.Client:
            localStorage.removeItem("accessToken");
            navigate("/login");
            break;
          case Role.Employee:
            if (
              location.pathname.startsWith("/admin") ||
              location.pathname.startsWith("/manager")
            ) {
              navigate(`/employee/${branch_id}/dashboard`);
            }
            break;
          case Role.BranchManager:
            if (
              location.pathname.startsWith("/admin") ||
              location.pathname.startsWith("/employee")
            ) {
              navigate("/manager/home");
            }
            break;
          case Role.SuperAdmin:
            if (
              location.pathname.startsWith("/manager") ||
              location.pathname.startsWith("/employee")
            ) {
              navigate("/admin/home");
            }
            break;
          default:
            localStorage.removeItem("accessToken");
            navigate("/login");
            break;
        }

        auth?.setAuthContext({ ...UserDetail.data, branch_id: branch_id });
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
