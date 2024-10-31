import React, { createContext, useContext, useState } from "react";
import { UserDetail } from "../interface/userdetail.interface";

export const initialAuth: UserDetail = {
  user_id: "",
  email: "",
  name: "",
  role: "",
  surname: "",
  profile_image_url: "",
  phone: "",
};

interface AuthContextType {
  authContext: UserDetail;
  setAuthContext: (value: UserDetail) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authContext, setAuthContext] = useState<UserDetail>(initialAuth);

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
