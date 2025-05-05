import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
  RefreshCcw,
} from "lucide-react";
import {
  useGetOrdersQuery,
  useRetryPaymentMutation,
  useVerifyPaymentMutation,
} from "@/store/api/userApiSlice";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { handleRazorpayPayment } from "@/utils/razorPay";
import { useSelector } from "react-redux";

const Orders = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [retryPayment] = useRetryPaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZOR_KEY_ID;
  const { data, isLoading, error, refetch } = useGetOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    sortBy,
    sortOrder,
    search: searchTerm,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "shipped":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-amber-100 text-amber-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReturnStatusColor = (returnStatus) => {
    switch (returnStatus) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "none":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRetryPayment = async (orderId) => {
    try {
      const result = await retryPayment({ orderId }).unwrap();
      await handleRazorpayPayment({
        result,
        user,
        RAZORPAY_KEY_ID,
        verifyPayment,
        onSuccess: (orderId) => {
          navigate(`/user/checkout/order-confirmation/${orderId}`);
        },
        onError: (error) => {
          navigate(`/user/checkout/order-failure/${orderId}`, {
            state: {
              errorMessage: error.message,
              errorCode: error.code,
            },
          });
        },
      });
    } catch (error) {
      console.error("Retry payment error:", error);
      navigate(`/user/checkout/order-failure/${orderId}`, {
        state: {
          errorMessage:
            error.data?.message || "Failed to retry payment. Please try again.",
          errorCode: "RETRY_PAYMENT_FAILED",
        },
      });
    }
  };

  // Card content for mobile view
  const renderOrderCards = () => {
    return orders.map((order) => (
      <div key={order.orderId} className="mb-4 border rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">#{order.orderId}</span>
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">{order.status}</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Date:</div>
          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
          
          <div>Items:</div>
          <div>{order.items.length}</div>
          
          <div>Total:</div>
          <div>₹{order.total.toFixed(2)}</div>
          
          <div>Return:</div>
          <div>
            <Badge className={`text-xs ${getReturnStatusColor(order.returnRequest.status)}`}>
              {order.returnRequest.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          {order.paymentStatus === "pending" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRetryPayment(order.orderId)}
            >
              Retry Payment
              <RefreshCcw className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <div></div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/user/orders/${order.orderId}`)}
            className="text-primary hover:bg-primary/10"
          >
            Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-xl md:text-2xl font-bold text-primary">
            My Orders
          </CardTitle>
          <CardDescription>View and track all your orders</CardDescription>
        </div>

        {/* Search and filters - stacked on mobile, row on larger screens */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Order ID..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-28">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="orderId">Order ID</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-28">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => refetch()}
              className="h-10 w-10 flex-shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh orders</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load orders. Please try again.</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <h3 className="text-lg font-medium">No orders yet</h3>
            <p className="text-muted-foreground">
              When you place orders, they will appear here.
            </p>
            <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={()=> navigate('/shop')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Table view for larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Return Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-medium">
                        {order.orderId}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize ${getReturnStatusColor(
                            order.returnRequest.status
                          )}`}
                        >
                          {order.returnRequest.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {order.paymentStatus === "failed" ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRetryPayment(order.orderId)}
                            >
                              Retry Payment
                              <RefreshCcw className="ml-1 h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/user/orders/${order.orderId}`)
                            }
                            className="text-primary hover:bg-primary/10"
                          >
                            Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Card view for mobile screens */}
            <div className="md:hidden">
              {renderOrderCards()}
            </div>
            
            {/* Pagination - simplified and responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                Showing {orders.length} of {total} orders
              </div>
              <div className="flex items-center gap-2 justify-center w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Orders;