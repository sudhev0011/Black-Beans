import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  XCircle,
  CreditCard,
  RotateCcw,
  RefreshCcw,
  CalendarClock,
  Receipt,
  ReceiptText,
  User,
  Phone,
  Mail,
  Info,
  Home
} from "lucide-react";
import { useGetOrderDetailsQuery, useRequestReturnMutation, useCancelOrderMutation, useCancelOrderItemMutation, useRequestItemReturnMutation, useDownloadInvoiceMutation } from "@/store/api/userApiSlice";
import { toast } from "sonner";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderDetailsQuery(orderId);
  console.log('single order data form the backend',order);
  
  const [downloadInvoice, { isLoading: isDownloadingInvoice }] = useDownloadInvoiceMutation();
  
  const [requestReturn, { isLoading: isRequestingReturn }] = useRequestReturnMutation();
  const [requestItemReturn, { isLoading: isRequestingItemReturn }] = useRequestItemReturnMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [cancelOrderItem] = useCancelOrderItemMutation();
  const [returnReason, setReturnReason] = useState("");
  const [itemReturnReason, setItemReturnReason] = useState("");
  const [returnError, setReturnError] = useState("");
  const [isCancelOrderDialogOpen, setIsCancelOrderDialogOpen] = useState(false);
  const [cancelItemId, setCancelItemId] = useState(null);
  const [returnItemId, setReturnItemId] = useState(null);
  const [activeTab, setActiveTab] = useState("items");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDownloadInvoice = async () => {
    try {
      const fileURL = await downloadInvoice(orderId).unwrap();
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileURL);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to download invoice");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      case "returned":
        return <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />;
      case "return-requested":
        return <RefreshCcw className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
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
      case "returned":
        return "bg-purple-100 text-purple-800";
      case "return-requested":
        return "bg-yellow-100 text-yellow-800";
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRequestReturn = async () => {
    try {
      setReturnError("");
      await requestReturn({ orderId, reason: returnReason }).unwrap();
      setReturnReason("");
      toast.success("Return request submitted successfully!");
      refetch();
    } catch (error) {
      setReturnError(error.data?.message || "Failed to request return");
    }
  };

  const handleRequestItemReturn = async (itemId) => {
    try {
      if (!itemReturnReason.trim()) {
        toast.error("Please provide a reason for return");
        return;
      }
      
      await requestItemReturn({ 
        orderId, 
        itemId,
        reason: itemReturnReason 
      }).unwrap();
      
      setItemReturnReason("");
      setReturnItemId(null);
      toast.success("Item return request submitted successfully!");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to request item return");
    }
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(orderId).unwrap();
      toast.success("Order cancelled successfully!");
      refetch();
      setIsCancelOrderDialogOpen(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to cancel order");
    }
  };

  const handleCancelItem = async (itemId) => {
    try {
      await cancelOrderItem({ orderId, itemId }).unwrap();
      toast.success("Item cancelled successfully!");
      refetch();
      setCancelItemId(null);
    } catch (error) {
      toast.error(error.data?.message || "Failed to cancel item");
    }
  };

  const handleBack = () => navigate("/user/orders");

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="h-10 w-10 sm:h-12 sm:w-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCcw className="h-full w-full text-primary" />
          </motion.div>
        </div>
        <p className="text-base sm:text-lg font-medium">Loading order details...</p>
      </motion.div>
    </div>
  );
  
  if (!order) return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8 sm:py-12 space-y-4 px-4"
    >
      <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto" />
      <h2 className="text-xl sm:text-2xl font-bold">Order not found</h2>
      <p className="text-sm sm:text-base text-muted-foreground">The order you're looking for doesn't exist or has been removed.</p>
      <Button onClick={handleBack} className="w-full sm:w-auto">Return to Orders</Button>
    </motion.div>
  );

  const canCancel = ["pending", "processing"].includes(order.status);
  const canReturn = order.status === "delivered";

  // Order status steps for the progress tracker
  const orderStatuses = ["pending", "processing", "shipped", "delivered"];
  const currentStatusIndex = orderStatuses.indexOf(order.status);
  
  // Special statuses that replace the normal flow
  const isSpecialStatus = ["cancelled", "returned", "return-requested"].includes(order.status);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <h2 className="text-lg sm:text-xl font-semibold truncate">Order #{order.orderId}</h2>
        <Badge className={`ml-auto ${getStatusColor(order.status)} text-xs sm:text-sm`}>
          <div className="flex items-center gap-1">
            {getStatusIcon(order.status)}
            <span className="capitalize">{order.status.replace("-", " ")}</span>
          </div>
        </Badge>
      </div>

      {/* Order Progress Tracker */}
      <Card>
        <CardContent className="pt-6">
          {!isSpecialStatus ? (
            <div className="relative">
              {/* Progress Bar */}
              <div className="sm:hidden absolute left-4 top-0 bottom-0 w-1 bg-gray-200 rounded-full z-0">
                <motion.div 
                  className="w-full bg-primary rounded-full"
                  initial={{ height: "0%" }}
                  animate={{ 
                    height: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` 
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
              <div className="hidden sm:block absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full z-0">
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` 
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
              
              {/* Status Icons */}
              <div className="flex flex-col sm:flex-row justify-between relative z-10 space-y-8 sm:space-y-0">
                {orderStatuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <div key={status} className="flex items-center sm:flex-col sm:items-center sm:mb-0 relative">
                      <motion.div 
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'border-4 border-primary-light' : ''} sm:mr-0 mr-4`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                        }}
                        transition={{ delay: index * 0.2, duration: 0.4 }}
                      >
                        {status === "pending" && <Package className="h-4 w-4 sm:h-5 sm:w-5" />}
                        {status === "processing" && <Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
                        {status === "shipped" && <Truck className="h-4 w-4 sm:h-5 sm:w-5" />}
                        {status === "delivered" && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </motion.div>
                      <div className="flex flex-col">
                        <motion.p 
                          className={`text-xs sm:text-sm font-medium capitalize ${
                            isCompleted ? 'text-primary' : 'text-gray-400'
                          } sm:mt-2`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 + 0.2, duration: 0.4 }}
                        >
                          {status}
                        </motion.p>
                        
                        {isCurrent && order.estimatedDeliveryDate && status !== "delivered" && (
                          <motion.p 
                            className="text-xs text-gray-500 sm:mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.4 }}
                          >
                            Est. {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className={`rounded-full ${getStatusColor(order.status)} p-3 sm:p-4 mr-0 sm:mr-4 mb-4 sm:mb-0`}>
                {getStatusIcon(order.status)}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold capitalize text-base sm:text-lg">
                  {order.status === "cancelled" ? "Order Cancelled" : 
                   order.status === "returned" ? "Order Returned" : 
                   "Return Requested"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {order.status === "cancelled" ? "This order has been cancelled" : 
                   order.status === "returned" ? "This order has been returned" : 
                   "Your return request is being processed"}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Tabs */}
      <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4 w-full">
          <TabsTrigger value="items" className="flex items-center gap-2 text-xs sm:text-sm">
            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Items</span>
            <span className="sm:hidden">Items</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Shipping</span>
            <span className="sm:hidden">Ship</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2 text-xs sm:text-sm">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Payment</span>
            <span className="sm:hidden">Pay</span>
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center gap-2 text-xs sm:text-sm">
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Returns</span>
            <span className="sm:hidden">Return</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Items Tab */}
            <TabsContent value="items" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-medium text-primary">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y divide-gray-100">
                  {order?.items?.map((item, index) => {
                    const itemId = item.variantId?._id || item.productId?._id;
                    return (
                      <motion.div 
                        key={`${item.productId?._id}-${item.variantId?._id || "no-variant"}`} 
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 first:pt-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md border bg-muted overflow-hidden flex-shrink-0">
                          <img 
                            src={item?.productId?.images[0] || "/placeholder.svg"} 
                            alt={item?.productId?.name} 
                            className="h-full w-full object-cover transition-transform hover:scale-110" 
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">{item?.productId?.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">Qty: {item?.quantity}</p>
                            {item.variantId?.size && (
                              <p className="text-xs sm:text-sm text-muted-foreground">Variant: {item.variantId.size}{item.variantId.unit}</p>
                            )}
                          </div>
                        </div>
                        <div className="font-medium text-sm sm:text-base whitespace-nowrap">₹{(item?.price * item?.quantity).toFixed(2)}</div>
                        
                        {/* Show status badge if item is cancelled or returned */}
                        {item.status === "cancelled" || item.status === "returned" || item.status === "return-requested" ? (
                          <Badge className={`${getStatusColor(item.status)} text-xs sm:text-sm w-full sm:w-auto text-center`}>
                            <div className="flex items-center gap-1 justify-center">
                              {getStatusIcon(item.status)}
                              <span className="capitalize">{item.status.replace("-", " ")}</span>
                            </div>
                          </Badge>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {/* Cancel Item Button */}
                            {canCancel && order.items.length > 1 && (
                              <AlertDialog
                                open={cancelItemId === itemId}
                                onOpenChange={(open) => setCancelItemId(open ? itemId : null)}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span>Cancel</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-base sm:text-lg">Cancel Item</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm sm:text-base">
                                      Are you sure you want to cancel "{item?.productId?.name}" from your order? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancelItem(itemId)} className="text-xs sm:text-sm">
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {/* Return Item Button */}
                            {canReturn && (
                              <AlertDialog
                                open={returnItemId === itemId}
                                onOpenChange={(open) => {
                                  setReturnItemId(open ? itemId : null);
                                  if (!open) setItemReturnReason("");
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span>Return</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-base sm:text-lg">Return Item</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm sm:text-base">
                                      Please provide a reason for returning "{item?.productId?.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="py-4">
                                    <Input
                                      placeholder="Reason for return"
                                      value={itemReturnReason}
                                      onChange={(e) => setItemReturnReason(e.target.value)}
                                      className="text-sm sm:text-base"
                                    />
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleRequestItemReturn(itemId)}
                                      disabled={!itemReturnReason.trim() || isRequestingItemReturn}
                                      className="text-xs sm:text-sm"
                                    >
                                      {isRequestingItemReturn ? "Submitting..." : "Submit Return Request"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-medium text-primary flex items-center gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>Name:</strong> {order.shippingAddress.fullname}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>Address:</strong> {order.shippingAddress.addressLine}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>City:</strong> {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <Info className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>Country:</strong> {order.shippingAddress.country}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>Phone:</strong> {order.shippingAddress.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>Email:</strong> {order.shippingAddress.email}</p>
                      </div>
                    </motion.div>
                  </div>
                  
                  {order.trackingNumber && (
                    <motion.div 
                      className="mt-6 p-4 border border-blue-100 bg-blue-50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        <h4 className="font-medium text-sm sm:text-base">Tracking Information</h4>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs sm:text-sm"><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                        <p className="text-xs sm:text-sm"><strong>Carrier:</strong> {order.shippingProvider || "Standard Shipping"}</p>
                        {order.estimatedDeliveryDate && (
                          <p className="text-xs sm:text-sm"><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-medium text-primary flex items-center gap-2">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 sm:gap-x-10">
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>Payment Method:</strong> {order.paymentMethod.replace(/-/g, " ").toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        <p className="text-xs sm:text-sm"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      {order.paymentDate && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                          <p className="text-xs sm:text-sm"><strong>Payment Date:</strong> {new Date(order.paymentDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-2 p-4 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span>Subtotal</span>
                        <span className='sm:text-sm'> ₹{order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span>Shipping</span>
                        <span>₹{order.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span>Tax</span>
                        <span>₹{order?.tax?.toFixed(2)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between items-center text-green-600 text-xs sm:text-sm">
                          <span>Discount</span>
                          <span>-₹{order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center font-bold text-sm sm:text-base">
                        <span>Total</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="mt-6 sm:mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
                      onClick={handleDownloadInvoice}
                      disabled={isDownloadingInvoice}
                    >
                      <ReceiptText className="h-3 w-3 sm:h-4 sm:w-4" />
                      {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Returns Tab */}
            <TabsContent value="returns" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-medium text-primary">Order Return Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.returnRequest.status !== "none" ? (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm sm:text-base">Return Status:</span>
                        <Badge className={`capitalize ${getReturnStatusColor(order.returnRequest.status)} text-xs sm:text-sm`}>
                          {order.returnRequest.status}
                        </Badge>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        {order.returnRequest.reason && (
                          <div>
                            <strong className="text-xs sm:text-sm text-gray-500">Reason:</strong>
                            <p className="mt-1 text-xs sm:text-sm">{order.returnRequest.reason}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.returnRequest.requestedAt && (
                            <div>
                              <strong className="text-xs sm:text-sm text-gray-500">Requested At:</strong>
                              <p className="mt-1 text-xs sm:text-sm">{new Date(order.returnRequest.requestedAt).toLocaleString()}</p>
                            </div>
                          )}
                          
                          {order.returnRequest.processedAt && (
                            <div>
                              <strong className="text-xs sm:text-sm text-gray-500">Processed At:</strong>
                              <p className="mt-1 text-xs sm:text-sm">{new Date(order.returnRequest.processedAt).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                        
                        {order.returnRequest.adminNotes && (
                          <div>
                            <strong className="text-xs sm:text-sm text-gray-500">Admin Notes:</strong>
                            <p className="mt-1 p-3 bg-white rounded border border-gray-100 text-xs sm:text-sm">{order.returnRequest.adminNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      {order.returnRequest.status === "approved" && (
                        <motion.div 
                          className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                        >
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <p className="font-medium text-sm sm:text-base">Return Approved</p>
                          </div>
                          <p className="mt-2 text-green-700 text-xs sm:text-sm">
                            Your return has been approved. Please follow the shipping instructions sent to your email.
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : order.status === "delivered" ? (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-medium flex items-center gap-2 text-blue-700 text-sm sm:text-base">
                          <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                          Return Policy
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-blue-700">
                          You can request a return for this order within 30 days of delivery. Please provide a reason below.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-xs sm:text-sm font-medium">Return Reason</label>
                        <Input
                          placeholder="Please explain why you're returning this order"
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          className="text-xs sm:text-sm"
                        />
                        {returnError && <p className="text-red-500 text-xs sm:text-sm">{returnError}</p>}
                      </div>
                      
                      <Button
                        onClick={handleRequestReturn}
                        disabled={!returnReason.trim() || isRequestingReturn}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                      >
                        {isRequestingReturn ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                            </motion.div>
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Request Return for Entire Order</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="flex flex-col items-center justify-center py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Info className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                      <p className="text-base sm:text-lg font-medium text-gray-600 text-center">Returns are only available for delivered orders.</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                        Once your order is delivered, you can request a return from this page.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Action Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          {canCancel && (
            <AlertDialog open={isCancelOrderDialogOpen} onOpenChange={setIsCancelOrderDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base sm:text-lg">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm sm:text-base">
                    This action will cancel your entire order. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder} className="text-xs sm:text-sm">
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
            onClick={handleDownloadInvoice}
            disabled={isDownloadingInvoice}
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
          </Button>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
          Contact Support
        </Button>
      </motion.div>

      {/* Order Timeline (optional addition) */}
      {order.timeline && order.timeline.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className="text-base sm:text-lg font-medium mb-4">Order Timeline</h3>
          <div className="relative border-l-2 border-primary pl-6 pb-6 space-y-6">
            {order.timeline.map((event, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="absolute -left-[2.1rem] top-0 h-4 w-4 rounded-full bg-primary"></div>
                <div className="bg-white rounded-lg p-4 shadow-sm border">
                  <p className="text-xs sm:text-sm text-gray-500">{new Date(event.date).toLocaleString()}</p>
                  <p className="font-medium mt-1 text-sm sm:text-base">{event.status}</p>
                  {event.description && <p className="text-xs sm:text-sm mt-1">{event.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderDetails;