import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./footer";
import HomeHeader from "./header";
import Breadcrumbs from "../Bredcrumbs/Breadcrumbs";

function ShopLayout() {
    const location = useLocation();
    return (
        <>
            <HomeHeader/> 
            <main className={`flex flex-col w-full`}>
            {(location.pathname.includes("shop") || location.pathname.includes("account")) && !location.pathname.includes("product") && <Breadcrumbs />}

            <Outlet />
            </main>
            <Footer/>
        </>
    );
}

export default ShopLayout;