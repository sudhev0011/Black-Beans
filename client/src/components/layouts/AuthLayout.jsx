import { Outlet } from "react-router-dom";
import { Footer } from "../shop/Footer";
import HomeHeader from "../shop/Header";
import Breadcrumbs from "../Bredcrumbs/Breadcrumbs";

function AuthLayout() {
  return (
    <>
    <HomeHeader/>
    <div className="min-h-screen w-full shop-header">
    <Breadcrumbs/>
      <div className="flex flex-1 items-center justify-center bg-background px-10 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
      <Footer/> 
    </div>
    </>
  );
}

export default AuthLayout;