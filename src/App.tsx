import { DatePicker } from "antd";
import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";

function App() {
  const [accessToken, setAccessToken] = useState<string>("");

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken") ?? "");
  }, []);
  return (
    <div className="h-screen flex">
      <div className="m-auto">
        <h4 className="text-bold text-2xl">Hello สวัสดี</h4>
        <DatePicker />
        {accessToken === "" ? (
          <LoginForm />
        ) : (
          <>
            <p>Current : {accessToken}</p>
            <button
              type="button"
              className="bg-blue-500 text-white px-6 py-2 rounded-sm text-lg disabled:bg-blue-300/60"
              onClick={() => {
                setAccessToken("");
                localStorage.removeItem("accessToken");
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
