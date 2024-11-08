import React, { createContext, useContext, useState } from "react";
import { UserDetail } from "../interface/userdetail.interface";

export interface IAuthContext extends UserDetail {
  branch_id: string;
}

export const initialAuth: IAuthContext = {
  user_id: "",
  email: "",
  firstname: "",
  role: "",
  lastname: "",
  profile_image_url: "",
  phone: "",
  branch_id: "",
};

interface AuthContextType {
  authContext: IAuthContext;
  setAuthContext: (value: IAuthContext) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authContext, setAuthContext] = useState<IAuthContext>(initialAuth);

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      setAuthContext(initialAuth);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ authContext, setAuthContext, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
