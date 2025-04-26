import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { User, ShoppingBag, CreditCard, Ticket, Heart, Users, MapPin } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const UserPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/user/")[1]?.split("/")[0] || "profile";

  const handleTabChange = (value) => {
    navigate(`/user/${value}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 mt-12">
      <Card className="p-6 shadow-lg">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden md:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden md:inline">Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="refer" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Refer & Earn</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Outlet /> {/* Render nested routes here */}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserPanel;