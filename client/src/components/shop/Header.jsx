import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  useLogoutMutation,
  userApiSlice,
  useAddToCartMutation,
} from "@/store/api/userApiSlice";
import { addToCart } from "@/store/slices/userSlice/cartSlice";
import { logoutUser } from "@/store/slices/userSlice/userSlice";
import {
  Menu,
  Search,
  Heart,
  ShoppingCart,
  X,
  User,
  LogOut,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logo2dark } from "@/assets/category/index";
import { useDrop } from "react-dnd";

function HomeHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useSelector((state) => state.user.user);
  const cart = useSelector((state) => state.cart);
  console.log("user data from store", user);

  console.log("cart data at header", cart);

  const [logout, { isLoading }] = useLogoutMutation();
  const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await logout().unwrap();
      if (response.success) {
        dispatch(logoutUser());
        dispatch(userApiSlice.util.resetApiState());
        toast.success("Successfully logged out");
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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PRODUCT",
    drop: async (item) => {
      await addToCartApi(item).unwrap();
      dispatch(
        addToCart({
          productId: item.productId,
          variantId: item.variantId,
          price: item.price,
        })
      );
      console.log("Dropped product:", item);
      toast.success("Item added to cart!");
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <>
      {/* Main Header */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src={logo2dark}
                  alt="Logo"
                  className="h-8 hidden md:block"
                />
                <img
                  src='/mobileLogo.png'
                  alt="Mobile Logo"
                  className="h-8 md:hidden"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="rounded-full px-3 py-2 text-sm font-medium tracking-wide text-black hover:bg-gray-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-black hover:bg-gray-100"
                onClick={() => navigate("/search")}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-black hover:bg-gray-100"
                onClick={() => navigate("/user/wishlist")}
              >
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>

              {/* Cart Button */}
              <div ref={drop}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full text-black hover:bg-gray-100 relative ${
                    isOver ? "bg-primary/10 ring-2 ring-primary" : ""
                  }`}
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingCart
                    className={`h-5 w-5 transition-transform ${
                      isOver ? "scale-125" : ""
                    }`}
                  />
                  {user && cart.items.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-medium text-white flex items-center justify-center">
                      {cart.items.length}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
              </div>

              {/* Cart Total */}
              {user && cart.total > 0 && (
                <span className="hidden md:block text-sm font-medium text-black">
                  ₹{cart.total.toFixed(2)}
                </span>
              )}

              {/* User Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-black hover:bg-gray-100 flex items-center gap-2"
                    >
                      {user.image_url ? (
                        <img
                          src={user.image_url}
                          alt={user.username}
                          className="h-8 w-8 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                          {user?.username?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/user/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/user/orders")}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoading ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex hover:bg-primary hover:text-white"
                  onClick={() => navigate("/auth/login")}
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-black hover:bg-gray-100 md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header & Close Button */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={logo2dark} alt="Logo" className="h-7" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info (if logged in) */}
          {user && (
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                {user.image_url ? (
                  <img
                    src={user.image_url}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}

              {/* Show these only in mobile menu */}
              <Link
                to="/search"
                className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4 mr-3" />
                <span className="text-sm font-medium">Search</span>
              </Link>

              <Link
                to="/user/wishlist"
                className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4 mr-3" />
                <span className="text-sm font-medium">Wishlist</span>
              </Link>

              <Link
                to="/cart"
                className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-4 w-4 mr-3" />
                <span className="text-sm font-medium">Cart</span>
                {user && cart.items.length > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {cart.items.length}
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t">
            {user ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoading ? "Logging out..." : "Logout"}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  navigate("/auth/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Login / Register
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default HomeHeader;
