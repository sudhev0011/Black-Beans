import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useProcessReturnMutation,
  useProcessItemReturnMutation,
} from "@/store/api/adminApiSlice";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [returnAction, setReturnAction] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedReturnItems, setSelectedReturnItems] = useState({});
  const [itemReturnAction, setItemReturnAction] = useState("");
  const [itemReturnNotes, setItemReturnNotes] = useState("");

  const itemsPerPage = 10;
  const { data, isLoading, error, refetch } = useGetAdminOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [processReturn] = useProcessReturnMutation();
  const [processItemReturn] = useProcessItemReturnMutation();

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setReturnAction("");
    setAdminNotes("");
    setSelectedReturnItems({});
    setItemReturnAction("");
    setItemReturnNotes("");
  };

  const handleUpdateOrderStatus = async () => {
    try {
      const response = await updateOrderStatus({
        orderId: selectedOrder.orderId,
        status: newStatus,
      }).unwrap();

      if (response.success) {
        setSelectedOrder((prev) => ({
          ...prev,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        }));
        toast.success(response.message || "Order status updated successfully!");
      } else {
        toast.error(response.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error(
        err.data?.message || err.message || "Failed to update order status"
      );
    }
  };

  const handleProcessReturn = async () => {
    try {
      await processReturn({
        orderId: selectedOrder.orderId,
        action: returnAction,
        adminNotes,
      }).unwrap();
      setSelectedOrder({
        ...selectedOrder,
        returnRequest: {
          ...selectedOrder.returnRequest,
          status: returnAction === "approve" ? "approved" : "rejected",
          adminNotes,
          processedAt: new Date(),
        },
      });
      toast.success(`Return request ${returnAction}d successfully!`);
      setReturnAction("");
      setAdminNotes("");
    } catch (err) {
      console.error("Failed to process return:", err);
      toast.error(
        err.data?.message || err.message || "Failed to process return"
      );
    }
  };

  
  const handleItemReturnToggle = (itemKey) => {
    setSelectedReturnItems((prev) => {
      const newState = {
        ...prev,
        [itemKey]: !prev[itemKey], // Toggle the item's selection state
      };
      console.log("Updated selected items for return process:", newState); // Log after state update
      return newState;
    });
  };

  const handleProcessItemReturn = async () => {
    const itemIds = Object.keys(selectedReturnItems).filter(
      (id) => selectedReturnItems[id]
    );
    console.log(itemIds);
    

    if (itemIds.length === 0) {
      toast.error("Please select at least one item to process return");
      return;
    }

    try {
      await processItemReturn({
        orderId: selectedOrder.orderId,
        itemIds,
        action: itemReturnAction,
        adminNotes: itemReturnNotes,
      }).unwrap();

      // Update the local state to reflect the changes
      const updatedItems = selectedOrder.items.map((item) => {
        const itemKey = `${item.productId}-${item.variantId || "noVariant"}`;
        if (selectedReturnItems[itemKey]) {
          return {
            ...item,
            returnStatus:
              itemReturnAction === "approve" ? "approved" : "rejected",
            returnNotes: itemReturnNotes,
          };
        }
        return item;
      });

      setSelectedOrder({
        ...selectedOrder,
        items: updatedItems,
      });

      toast.success(`Item return request ${itemReturnAction}d successfully!`);
      setSelectedReturnItems({});
      setItemReturnAction("");
      setItemReturnNotes("");
    } catch (err) {
      console.error("Failed to process item return:", err);
      toast.error(
        err.data?.message || err.message || "Failed to process item return"
      );
    }
  };

  const hasItemReturnRequests = selectedOrder?.items?.some(
    (item) => item.returnStatus === "requested"
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh orders</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="item_return_requested">
                      Item Return Requested
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading orders: {error.message}</div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Return Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.user?.username || "Unknown"}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.returnRequest.status === "none"
                            ? "bg-gray-100 text-gray-800"
                            : order.returnRequest.status === "requested"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.returnRequest.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : order.returnRequest.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.returnRequest.status === "none"
                          ? order.items?.some(
                              (item) => item.returnStatus === "requested"
                            )
                            ? "Item Returns"
                            : "N/A"
                          : order.returnRequest.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>
                              Order Details - {selectedOrder?.orderId}
                            </DialogTitle>
                            <DialogDescription>
                              View and manage order information.
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <Tabs defaultValue="details">
                              <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="details">
                                  Details
                                </TabsTrigger>
                                <TabsTrigger value="items">Items</TabsTrigger>
                                <TabsTrigger value="shipping">
                                  Shipping
                                </TabsTrigger>
                                <TabsTrigger value="return">Return</TabsTrigger>
                                <TabsTrigger
                                  value="item-returns"
                                  className={
                                    hasItemReturnRequests ? "bg-yellow-100" : ""
                                  }
                                >
                                  Item Returns
                                </TabsTrigger>
                              </TabsList>
                              <TabsContent
                                value="details"
                                className="space-y-4 py-4"
                              >
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Customer</Label>
                                    <div className="font-medium">
                                      {selectedOrder.user?.username}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Date</Label>
                                    <div className="font-medium">
                                      {new Date(
                                        selectedOrder.createdAt
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Total</Label>
                                    <div className="font-medium">
                                      ₹{selectedOrder.total.toFixed(2)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Payment Method</Label>
                                    <div className="font-medium">
                                      {selectedOrder.paymentMethod}
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <Label>Status</Label>
                                    <Select
                                      value={newStatus}
                                      onValueChange={setNewStatus}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="processing">
                                          Processing
                                        </SelectItem>
                                        <SelectItem value="shipped">
                                          Shipped
                                        </SelectItem>
                                        <SelectItem value="delivered">
                                          Delivered
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="items" className="py-4">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Price</TableHead>
                                      <TableHead>Quantity</TableHead>
                                      <TableHead className="text-right">
                                        Total
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedOrder.items.map((item) => (
                                      <TableRow
                                        key={`${item.productId._id}-${
                                          item.variantId?._id || "noVariant"
                                        }`}
                                      >
                                        <TableCell>
                                          {item?.productId?.name}
                                        </TableCell>
                                        <TableCell>
                                          ₹{item.price.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell className="text-right">
                                          ₹
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TabsContent>
                              <TabsContent value="shipping" className="py-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label>Shipping Address</Label>
                                    <div className="mt-1 space-y-1">
                                      <div>
                                        {selectedOrder.shippingAddress.fullname}
                                      </div>
                                      <div>
                                        {selectedOrder.shippingAddress.email}
                                      </div>
                                      <div>
                                        {
                                          selectedOrder.shippingAddress
                                            .addressLine
                                        }
                                      </div>
                                      <div>
                                        {selectedOrder.shippingAddress.city},{" "}
                                        {selectedOrder.shippingAddress.state}{" "}
                                        {
                                          selectedOrder.shippingAddress
                                            .postalCode
                                        }
                                      </div>
                                      <div>
                                        {selectedOrder.shippingAddress.country}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <div>
                                      {selectedOrder.shippingAddress.phone}
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="return" className="py-4">
                                {selectedOrder.returnRequest.status ===
                                "none" ? (
                                  <p>No return request for this order.</p>
                                ) : (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Return Status</Label>
                                      <div className="font-medium capitalize">
                                        {selectedOrder.returnRequest.status}
                                      </div>
                                    </div>
                                    {selectedOrder.returnRequest.reason && (
                                      <div>
                                        <Label>Reason</Label>
                                        <div>
                                          {selectedOrder.returnRequest.reason}
                                        </div>
                                      </div>
                                    )}
                                    {selectedOrder.returnRequest.status ===
                                      "requested" && (
                                      <>
                                        <div>
                                          <Label>Action</Label>
                                          <Select
                                            value={returnAction}
                                            onValueChange={setReturnAction}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="approve">
                                                Approve
                                              </SelectItem>
                                              <SelectItem value="reject">
                                                Reject
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>Admin Notes</Label>
                                          <Input
                                            value={adminNotes}
                                            onChange={(e) =>
                                              setAdminNotes(e.target.value)
                                            }
                                            placeholder="Add notes (optional)"
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent
                                value="item-returns"
                                className="py-4"
                              >
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-lg font-medium">
                                      Item Return Requests
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Process return requests for individual
                                      items
                                    </p>

                                    {!selectedOrder.items.some(
                                      (item) =>
                                        item.returnRequest.status ===
                                        "requested"
                                    ) ? (
                                      <p>
                                        No item return requests for this order.
                                      </p>
                                    ) : (
                                      <>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="w-12">
                                                Select
                                              </TableHead>
                                              <TableHead>Item</TableHead>
                                              <TableHead>
                                                Return Reason
                                              </TableHead>
                                              <TableHead>Status</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedOrder.items.map((item) => {
                                              // Generate itemKey consistently
                                              const itemKey = `${
                                                item?.productId?._id ||
                                                "unknown-product"
                                              }-${
                                                item?.variantId?._id ||
                                                "noVariant"
                                              }`;
                                              return item.returnRequest
                                                .status === "requested" ? (
                                                <TableRow key={itemKey}>
                                                  <TableCell>
                                                    <Checkbox
                                                      checked={
                                                        !!selectedReturnItems[
                                                          itemKey
                                                        ]
                                                      } // Ensure checked reflects state
                                                      onCheckedChange={() =>
                                                        handleItemReturnToggle(
                                                          itemKey
                                                        )
                                                      }
                                                    />
                                                  </TableCell>
                                                  <TableCell>
                                                    {item?.productId?.name ||
                                                      "Unknown Product"}
                                                    <div className="text-sm text-muted-foreground">
                                                      Qty: {item.quantity} × ₹
                                                      {item.price.toFixed(2)}
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    {item.returnRequest
                                                      .reason ||
                                                      "Not specified"}
                                                  </TableCell>
                                                  <TableCell>
                                                    <span
                                                      className={`inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800`}
                                                    >
                                                      Requested
                                                    </span>
                                                  </TableCell>
                                                </TableRow>
                                              ) : null;
                                            })}
                                          </TableBody>
                                        </Table>

                                        <div className="mt-6 space-y-4">
                                          <div>
                                            <Label>
                                              Action for Selected Items
                                            </Label>
                                            <Select
                                              value={itemReturnAction}
                                              onValueChange={
                                                setItemReturnAction
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select action" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="approve">
                                                  Approve Return
                                                </SelectItem>
                                                <SelectItem value="reject">
                                                  Reject Return
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div>
                                            <Label>Admin Notes</Label>
                                            <Textarea
                                              value={itemReturnNotes}
                                              onChange={(e) =>
                                                setItemReturnNotes(
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Add notes about this return decision (optional)"
                                              rows={3}
                                            />
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedOrder(null)}
                            >
                              Close
                            </Button>
                            {selectedOrder?.status !== newStatus && (
                              <Button onClick={handleUpdateOrderStatus}>
                                Update Status
                              </Button>
                            )}
                            {selectedOrder?.returnRequest.status ===
                              "requested" &&
                              returnAction && (
                                <Button onClick={handleProcessReturn}>
                                  Process Return
                                </Button>
                              )}
                            {Object.keys(selectedReturnItems).some(
                              (key) => selectedReturnItems[key]
                            ) &&
                              itemReturnAction && (
                                <Button onClick={handleProcessItemReturn}>
                                  Process Item Returns
                                </Button>
                              )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {orders.length} of {total} orders
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
