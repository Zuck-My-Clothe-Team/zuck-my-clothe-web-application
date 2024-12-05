import { useState } from "react";
import LoginForm from "../components/LoginForm";
import LoadingPage from "./LoadingPage";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="h-screen flex justify-center items-center relative">
      <div className="absolute flex justify-center items-center z-[-1] w-full h-full">
        <div
          style={{
            backgroundImage: "url('/images/loginFormBG.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            maxWidth: "60rem",
            width: "100%",
            height: "100%",
          }}
        ></div>
      </div>
      <div className="flex flex-col justify-center items-center w-3/4 lg:w-1/2 xl:w-1/3">
        <img
          src="/images/logo-withname.png"
          className="h-28 lg:h-52"
          loading="lazy"
        />
        <div className="w-full max-w-[1280px]">
          <LoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
