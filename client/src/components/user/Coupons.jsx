import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket, Copy, Clock, CheckCircle, Search } from "lucide-react";
import { useGetAllAvailableCouponsQuery, useGetUsedCouponsQuery } from "@/store/api/userApiSlice";
import { toast } from "sonner";

const CouponsComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availablePage, setAvailablePage] = useState(1);
  const [usedPage, setUsedPage] = useState(1);
  const limit = 5; // Number of coupons per page

  // Fetch available coupons
  const { data: availableData, isLoading: isLoadingAvailable, error: availableError } = useGetAllAvailableCouponsQuery({
    page: availablePage,
    limit,
    search: searchTerm,
  });

  const { coupons: availableCoupons = [], total: availableTotal = 0, totalPages: availableTotalPages = 1 } = availableData || {};

  // Fetch used coupons
  const { data: usedData, isLoading: isLoadingUsed, error: usedError } = useGetUsedCouponsQuery({
    page: usedPage,
    limit,
    search: searchTerm,
  });
  console.log("used coupond",usedData);
  

  const { coupons: usedCoupons = [], total: usedTotal = 0, totalPages: usedTotalPages = 1 } = usedData || {};

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied coupon code: ${code}`);
  };

  // Client-side filtering for available coupons (to include description search)
  const filteredAvailableCoupons = availableCoupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">My Coupons</CardTitle>
          <CardDescription>View your available and used coupons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search-coupons">Search Coupons</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-coupons"
                  placeholder="Search by code or description"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setAvailablePage(1); // Reset to page 1 on search
                    setUsedPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Coupons</TabsTrigger>
          <TabsTrigger value="used">Used Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-6">
          {isLoadingAvailable ? (
            <div className="text-center py-8">Loading available coupons...</div>
          ) : availableError ? (
            <div className="text-center py-8 text-red-500">
              Error loading available coupons: {availableError.data?.message || availableError.message}
            </div>
          ) : filteredAvailableCoupons.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No coupons found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No coupons match your search criteria." : "You don't have any available coupons."}
              </p>
            </div>
          ) : (
            <>
              {filteredAvailableCoupons.map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-primary p-6 text-white flex flex-col items-center justify-center md:w-1/4">
                      <Ticket className="h-8 w-8 mb-2" />
                      <h3 className="text-xl font-bold">{coupon.discount}</h3>
                      <p className="text-sm text-center">Min. Purchase: ₹{coupon.minPurchase}</p>
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium">{coupon.description}</h3>
                          <div className="flex items-center mt-2">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm text-muted-foreground">
                              {coupon.validUntil
                                ? `Valid until ${new Date(coupon.validUntil).toLocaleDateString()}`
                                : "No expiry"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-muted px-3 py-2 rounded-md font-mono text-sm">{coupon.code}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  disabled={availablePage === 1}
                  onClick={() => setAvailablePage(availablePage - 1)}
                >
                  Previous
                </Button>
                <span>Page {availablePage} of {availableTotalPages}</span>
                <Button
                  disabled={availablePage >= availableTotalPages}
                  onClick={() => setAvailablePage(availablePage + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-4 mt-6">
          {isLoadingUsed ? (
            <div className="text-center py-8">Loading used coupons...</div>
          ) : usedError ? (
            <div className="text-center py-8 text-red-500">
              Error loading used coupons: {usedError.data?.message || usedError.message}
            </div>
          ) : usedCoupons.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">No used coupons</h3>
              <p className="text-muted-foreground">You haven't used any coupons yet.</p>
            </div>
          ) : (
            <>
              {usedCoupons.map((coupon) => (
                <Card key={coupon.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {coupon.code} - {coupon.discount}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Used on {new Date(coupon.usedOn).toLocaleDateString()} for Order #{coupon.orderId}
                          </p>
                        </div>
                      </div>
                      <div className="text-green-600 font-medium">Saved ₹{coupon.savedAmount.toFixed(2)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  disabled={usedPage === 1}
                  onClick={() => setUsedPage(usedPage - 1)}
                >
                  Previous
                </Button>
                <span>Page {usedPage} of {usedTotalPages}</span>
                <Button
                  disabled={usedPage >= usedTotalPages}
                  onClick={() => setUsedPage(usedPage + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CouponsComponent;