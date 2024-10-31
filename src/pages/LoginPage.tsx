import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="h-screen flex">
      <div className="m-auto w-[60%]">
        <div className="relative">
          <img src="/images/loginFormBG.png" className="w-full z-[0]" />
          <div className="absolute flex flex-col justify-center items-center inset-0 w-full gap-16">
            <img src="/images/logo-withname.png" className="h-48" />
            <div className="w-[60%]">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
