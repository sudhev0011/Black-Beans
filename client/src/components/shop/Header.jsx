import { Menu, Search, Heart, ShoppingCart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logo2dark } from "@/assets/category/index";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useLogoutMutation } from "@/store/api/userApiSlice";
import { logoutUser } from "@/store/slices/userSlice/userSlice";
import { toast } from "sonner";

function HomeHeader() {
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useSelector((state) => state.user.user);
  console.log("userData at header", user);

  const [logout, { isLoading }] = useLogoutMutation();

  const items = [{}, {}, {}];
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandle = async () => {
    try {
      const response = await logout().unwrap(); // Execute the logout mutation
      if (response.success) {
        dispatch(logoutUser()); // Clear user data from Redux store
        toast.success("Logout Successful");
        navigate("/");
      } else {
        toast.error(response.message || "Logout failed");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Logout failed");
      console.error("Logout Error:", error);
    }
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full py-1 transition-colors duration-300  ${
        isScrolled ? "bg-white home-header" : "bg-transparent"
      }`}
    >
      <div className="flex h-16 items-center px-4">
        <Button
          variant="transparent"
          size="icon"
          className={`md:hidden  ${isScrolled ? "text-black" : "text-white"}`}
        >
          <Menu className="h-9 w-9" style={{ width: "20px", height: "24px" }} />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <nav className="hidden md:flex items-center space-x-6 ml-6 ">
          <Link to="/" className="text-sm font-medium text-black">
            HOME
          </Link>
          <Link to="/shop" className="text-sm font-medium text-black">
            SHOP
          </Link>
          <Link to="/contact" className="text-sm font-medium text-black">
            CONTACT US
          </Link>
          <Link to="/about" className="text-sm font-medium text-black">
            ABOUT US
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo2dark}
              alt="Logo"
              className="hidden md:block lg:h-9 h-8"
            />
          </Link>
        </div>

        <div className="flex items-center md:me-6">
          <Link
            to={user ? "/account" : "auth/login"}
            className="text-sm font-medium text-black hidden md:block"
          >
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full flex items-center justify-center bg-red-500 h-8 w-8 text-white"
                  >
                    {user.image_url ? (
                      <img
                        src={user.image_url}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      user.name.substring(0, 2).toUpperCase()
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logoutHandle}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              "LOGIN/REGISTER"
            )}
          </Link>
          <Button
            variant="transparent"
            size="icon"
            onClick={() => navigate("/search")}
          >
            <Search className={`h-5 w-5 text-black fw-bold`} />
            <span className="sr-only">Search</span>
          </Button>
          <Button
            variant="transparent"
            size="icon"
            onClick={() => navigate("#")}
          >
            <Heart className={`h-5 w-5 text-black} fw-bold`} />
            <span className="sr-only">Wishlist</span>
          </Button>
          <Button variant="transparent" size="icon" className="relative">
            <ShoppingCart className={`h-5 w-5 text-black fw-bold`} />
            <span className="sr-only">Cart</span>
            <span className="absolute right-0 -top-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
              {items.length}
            </span>
          </Button>
          <span className={`hidden md:block text-sm font-bold text-black`}>
            ₹{5000}
          </span>
        </div>
      </div>
      {/* <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} /> */}
    </header>
  );
}

export default HomeHeader;
