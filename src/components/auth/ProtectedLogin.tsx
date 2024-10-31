import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckToken } from "../../api/auth.api";
import { initialAuth, useAuth } from "../../context/auth.context";
import { IUserDetail } from "../../interface/userdetail.interface";

type Props = {
  children: React.ReactNode;
};

const ProtectedLogin: React.FC<Props> = ({ children }) => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken") || "";

  useMemo(async () => {
    try {
      if (!token || token === "") {
        localStorage.removeItem("accessToken");
        navigate("");
      }

      const result = await CheckToken();

      if (!result) {
        localStorage.removeItem("accessToken");
        navigate("");
      }

      const UserDetail = result.data as IUserDetail;
      auth?.setAuthContext(UserDetail.data);

      setIsLogin(true);
    } catch (err) {
      console.log(err);
      auth?.setAuthContext(initialAuth);
      localStorage.removeItem("accessToken");
      navigate("");
    }
  }, []);

  if (!isLogin) return null;

  return children;
};

export default ProtectedLogin;
