// import { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card } from "@/components/ui/card";
// import { User, ShoppingBag, CreditCard, Ticket, Heart, Users, MapPin } from "lucide-react";
// import { Outlet, useNavigate, useLocation } from "react-router-dom";

// const UserPanel = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const activeTab = location.pathname.split("/user/")[1]?.split("/")[0] || "profile";

//   const handleTabChange = (value) => {
//     navigate(`/user/${value}`);
//   };

//   return (
//     <div className="container mx-auto py-8 px-4 mt-12">
//       <Card className="p-6 shadow-lg">
//         <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
//           <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-8">
//             <TabsTrigger value="profile" className="flex items-center gap-2">
//               <User className="h-4 w-4" />
//               <span className="hidden md:inline">Profile</span>
//             </TabsTrigger>
//             <TabsTrigger value="addresses" className="flex items-center gap-2">
//               <MapPin className="h-4 w-4" />
//               <span className="hidden md:inline">Addresses</span>
//             </TabsTrigger>
//             <TabsTrigger value="orders" className="flex items-center gap-2">
//               <ShoppingBag className="h-4 w-4" />
//               <span className="hidden md:inline">Orders</span>
//             </TabsTrigger>
//             <TabsTrigger value="wallet" className="flex items-center gap-2">
//               <CreditCard className="h-4 w-4" />
//               <span className="hidden md:inline">Wallet</span>
//             </TabsTrigger>
//             <TabsTrigger value="coupons" className="flex items-center gap-2">
//               <Ticket className="h-4 w-4" />
//               <span className="hidden md:inline">Coupons</span>
//             </TabsTrigger>
//             <TabsTrigger value="wishlist" className="flex items-center gap-2">
//               <Heart className="h-4 w-4" />
//               <span className="hidden md:inline">Wishlist</span>
//             </TabsTrigger>
//             <TabsTrigger value="refer" className="flex items-center gap-2">
//               <Users className="h-4 w-4" />
//               <span className="hidden md:inline">Refer & Earn</span>
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value={activeTab}>
//             <Outlet /> {/* Render nested routes here */}
//           </TabsContent>
//         </Tabs>
//       </Card>
//     </div>
//   );
// };

// export default UserPanel;





import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { User, ShoppingBag, CreditCard, Ticket, Heart, Users, MapPin, Menu } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const UserPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/user/")[1]?.split("/")[0] || "profile";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabChange = (value) => {
    navigate(`/user/${value}`);
    setIsMenuOpen(false);
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const tabs = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "wallet", label: "Wallet", icon: <CreditCard className="h-4 w-4" /> },
    { id: "coupons", label: "Coupons", icon: <Ticket className="h-4 w-4" /> },
    { id: "wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
    { id: "refer", label: "Refer & Earn", icon: <Users className="h-4 w-4" /> },
  ];

  // Find active tab info
  const activeTabInfo = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className="container mx-auto mt-20 py-4 sm:py-6 md:py-8 px-2 sm:px-4 mt-9 sm:mt-8 md:mt-12">
      <Card className="p-3 sm:p-4 md:p-6 shadow-lg">
        {/* Mobile View (Only shown on sm and below) */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-4 mobile-menu-container">
            <div className="flex items-center gap-2">
              {activeTabInfo.icon}
              <span className="font-medium">{activeTabInfo.label}</span>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          {isMenuOpen && (
            <div className="absolute z-10 bg-white shadow-lg rounded-md p-1 w-64 max-w-[calc(100%-2rem)] left-1/2 transform -translate-x-1/2 mobile-menu-container">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-md text-left ${
                    tab.id === activeTab ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Wrapping in Tabs component for mobile view */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsContent value={activeTab}>
              <Outlet />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Tablet/Desktop View (Hidden on mobile) */}
        <div className="hidden sm:block">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-6">
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab}>
              <Outlet />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default UserPanel;