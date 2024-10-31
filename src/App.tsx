import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import { Routes, Route, Outlet, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth.context";
import ProtectedLogin from "./components/auth/ProtectedLogin";
import NotFoundPage from "./pages/NotFoundPage";

const AppPage = () => {
  return (
    <ProtectedLogin>
      <div className="flex gap-x-8">
        <div className="lg:w-[275px] xl:w-[350px]">
          <Sidebar />
        </div>
        <div className="w-full py-6">
          <Outlet />
        </div>
      </div>
    </ProtectedLogin>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/">
        <Routes>
          <Route element={<AppPage />}>
            <Route path="home" element={<>Home</>} />
            <Route path="dashboard" element={<>dashboard</>} />
            <Route path="machine" element={<>machine</>} />
            <Route path="staff" element={<>staff</>} />
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
  );
}

export default App;
