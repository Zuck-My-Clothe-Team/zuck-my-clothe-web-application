import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import { Routes, Route, Outlet, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth.context";
import ProtectedLogin from "./components/auth/ProtectedLogin";
import NotFoundPage from "./pages/NotFoundPage";
import { ConfigProvider } from "antd";
import { theme } from "./config/antdTheme";
import BranchManagePage from "./pages/Branch/BranchManagePage";
import UsersManagePage from "./pages/Users/UsersManagePage";

const AppPage = () => {
  return (
    <ProtectedLogin>
      <div className="flex flex-row gap-x-4 lg:gap-x-8 w-screen">
        <div className="w-[70px] lg:w-[250px] xl:w-[350px]">
          <Sidebar />
        </div>
        <div className="py-6 px-4 lg:px-12 w-full">
          <Outlet />
        </div>
      </div>
    </ProtectedLogin>
  );
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter basename="/">
          <Routes>
            <Route element={<AppPage />}>
              <Route path="home" element={<BranchManagePage />} />
              <Route path="dashboard" element={<>dashboard</>} />
              <Route path="machine" element={<>machine</>} />
              <Route path="staff" element={<UsersManagePage />} />
              <Route path="report" element={<>report</>} />
              <Route path="help" element={<>help</>} />
              <Route path="settings" element={<>settings</>} />
            </Route>
            <Route path="" element={<LoginPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
