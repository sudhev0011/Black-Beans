import { Menu, Search, Heart, ShoppingCart, X } from "lucide-react";
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
import { useLogoutMutation, userApiSlice } from "@/store/api/userApiSlice";
import { logoutUser } from "@/store/slices/userSlice/userSlice";
import { toast } from "sonner";

function HomeHeader() {
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const cart = useSelector((state) => state.cart);
  console.log('cart at header',cart);
  
  const hasLoggedOut = useSelector((state) => state.user.hasLoggedOut);
  
  const [logout, { isLoading }] = useLogoutMutation();
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
      const response = await logout().unwrap();
      if (response.success) {
        dispatch(logoutUser());
        dispatch(userApiSlice.util.resetApiState());
        toast.success("Logout Successful");
        navigate("/auth/login");
      } else {
        toast.error(response.message || "Logout failed");
      }
    } catch (error) {
      toast.error(error?.data?.message || "An error occurred during logout");
      dispatch(logoutUser());
      dispatch(userApiSlice.util.resetApiState());
      navigate("/auth/login");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full py-1 transition-colors duration-300 ${
          isScrolled ? "bg-white home-header" : "bg-transparent"
        }`}
      >
        <div className="flex h-16 items-center px-4">
          <Button
            variant="transparent"
            size="icon"
            className={`md:hidden ${isScrolled ? "text-black" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-9 w-9" style={{ width: "20px", height: "24px" }} />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <nav className="hidden md:flex items-center space-x-6 ml-6">
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
                className="h-8 md:h-9"
              />
            </Link>
          </div>

          <div className="flex items-center md:me-6">
            <Link
              to={user ? "/" : "auth/login"}
              className="text-sm font-medium text-black hidden md:block"
            >
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full flex items-center justify-center bg-customGreen h-8 w-8 text-white"
                    >
                      {user.image_url ? (
                        <img
                          src={user?.image_url }
                          alt={user.username}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        user?.username?.substring(0, 2).toUpperCase()
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to={'/user/profile'}><DropdownMenuItem>Profile</DropdownMenuItem></Link>
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
              <Search className="h-5 w-5 text-black ms-2" />
              <span className="sr-only">Search</span>
            </Button>
            <Button
              variant="transparent"
              size="icon"
              onClick={() => navigate("/user/wishlist")}
            >
              <Heart className="h-5 w-5 text-black" />
              <span className="sr-only">Wishlist</span>
            </Button>
            <Button
              variant="transparent"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5 text-black" />
              <span className="sr-only">Cart</span>
              <span className="absolute right-0 -top-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                {user ? cart.items.length : 0}
              </span>
            </Button>
            <span className="hidden md:block text-sm font-bold text-black ms-1">
              ₹{user ? cart?.total?.toFixed(2) : 0}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={logo2dark} alt="Logo" className="h-8" />
          </Link>
          <Button
            variant="transparent"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">
          <Link
            to="/"
            className="text-sm font-medium text-black"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            HOME
          </Link>
          <Link
            to="/shop"
            className="text-sm font-medium text-black"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            SHOP
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-black"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            CONTACT US
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-black"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ABOUT US
          </Link>
          {user ? (
            <>
              <Link
                to="/user"
                className="text-sm font-medium text-black"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                PROFILE
              </Link>
              <button
                className="text-sm font-medium text-black text-left"
                onClick={() => {
                  logoutHandle();
                  setIsMobileMenuOpen(false);
                }}
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link
              to="/auth/login"
              className="text-sm font-medium text-black"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              LOGIN/REGISTER
            </Link>
          )}
        </nav>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default HomeHeader;