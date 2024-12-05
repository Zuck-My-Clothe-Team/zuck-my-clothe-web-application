import { ConfigProvider } from "antd";
import { lazy, Suspense } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import ProtectedLogin from "./components/auth/ProtectedLogin";
import Sidebar from "./components/Sidebar";
import { theme } from "./config/antdTheme";
import { AuthProvider } from "./context/auth.context";
import LoadingPage from "./pages/LoadingPage";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const BranchManagePage = lazy(() => import("./pages/Branch/BranchManagePage"));
const UsersManagePage = lazy(() => import("./pages/Users/UsersManagePage"));
const MachineManagePage = lazy(
  () => import("./pages/Machine/MachineManagePage")
);
const ShowBranchPage = lazy(() => import("./pages/Branch/ShowBranchPage"));
const ReportPage = lazy(() => import("./pages/Report/ReportPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard/Dashboard"));
const OrderPage = lazy(() => import("./pages/Order/OrderPage"));

const AppPage = () => {
  return (
    <div className="flex justify-center w-screen ">
      <div className="flex flex-row w-full max-w-[1920px]">
        <div className="flex h-screen w-[70px] md:w-[100px] lg:w-[255px] xl:w-[300px] fixed slide-in">
          <Sidebar />
        </div>
        <div className="max-w-[1600px] ml-[75px] md:ml-[100px] lg:ml-[272.5px] xl:ml-[315px] container py-4 px-4 lg:px-6 xl:px-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const adminRoutes = [
  { path: "home", element: <BranchManagePage /> },
  { path: "dashboard", element: <DashboardPage /> },
  { path: "machine", element: <MachineManagePage /> },
  { path: "staff", element: <UsersManagePage /> },
  { path: "report", element: <ReportPage /> },
  { path: "order", element: <OrderPage /> },
];

const managerRoutes = [
  { path: ":branch_id/dashboard", element: <DashboardPage /> },
  { path: ":branch_id/machine", element: <MachineManagePage /> },
  { path: ":branch_id/staff", element: <UsersManagePage /> },
  { path: ":branch_id/report", element: <ReportPage /> },
  { path: ":branch_id/order", element: <OrderPage /> },
];

const employeeRoutes = [
  { path: ":branch_id/order", element: <OrderPage /> },
  { path: ":branch_id/report", element: <ReportPage /> },
  { path: ":branch_id/machine", element: <MachineManagePage /> },
];

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter basename="/">
          <Suspense fallback={<LoadingPage />}>
            <ProtectedLogin>
              <Routes>
                <Route element={<AppPage />} path="admin">
                  {adminRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <Suspense fallback={<LoadingPage />}>
                          {route.element}
                        </Suspense>
                      }
                    />
                  ))}
                </Route>
                <Route path="manager">
                  <Route path="home" element={<ShowBranchPage />} />
                  <Route element={<AppPage />}>
                    {managerRoutes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          <Suspense fallback={<LoadingPage />}>
                            {route.element}
                          </Suspense>
                        }
                      />
                    ))}
                  </Route>
                </Route>
                <Route path="employee">
                  <Route element={<AppPage />}>
                    {employeeRoutes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          <Suspense fallback={<LoadingPage />}>
                            {route.element}
                          </Suspense>
                        }
                      />
                    ))}
                  </Route>
                </Route>
                <Route path="" element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ProtectedLogin>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
