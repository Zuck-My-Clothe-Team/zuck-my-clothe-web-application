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

const AppPage = () => {
  return (
    <div className="flex flex-row gap-x-4 lg:gap-x-8 w-screen">
      <div className="w-[70px] lg:w-[250px] xl:w-[350px] fixed h-full">
        <Sidebar />
      </div>
      <div className="py-6 px-4 lg:px-12 w-full ml-[70px] lg:ml-[250px] xl:ml-[350px]">
        <Outlet />
      </div>
    </div>
  );
};

const adminRoutes = [
  { path: "home", element: <BranchManagePage /> },
  { path: "dashboard", element: <>dashboard</> },
  { path: "machine", element: <MachineManagePage /> },
  { path: "staff", element: <UsersManagePage /> },
  { path: "report", element: <>report</> },
  { path: "help", element: <>help</> },
  { path: "settings", element: <>settings</> },
];

const managerRoutes = [
  { path: ":branch_id/dashboard", element: <>dashboard</> },
  { path: ":branch_id/machine", element: <MachineManagePage /> },
  { path: ":branch_id/staff", element: <UsersManagePage /> },
  { path: ":branch_id/report", element: <>report</> },
  { path: ":branch_id/help", element: <>help</> },
  { path: ":branch_id/settings", element: <>settings</> },
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
