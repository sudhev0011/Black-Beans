// import { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   ArrowLeft,
//   ArrowRight,
//   ShoppingBag,
//   Lock,
//   CheckCircle
// } from "lucide-react";
// import { clearCart } from "@/store/slices/userSlice/cartSlice";
// import AddressSelectionComponent from "./AddressSelectionComponent";
// import PaymentOptionsComponent from "./PaymentOptionsComponent";
// import OrderSummaryComponent from "./OrderSummeryComponent";
// import {
//   useGetCartQuery,
//   usePlaceOrderMutation,
//   useGetWalletQuery,
//   useVerifyPaymentMutation
// } from "@/store/api/userApiSlice";
// import { handleRazorpayPayment } from "@/utils/razorPay";

// const CheckoutComponent = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const user = useSelector((state) => state.user.user);
//   const cartstate = useSelector((state) => state.cart);
//   const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !user || !cartstate });
//   const { data: wallet } = useGetWalletQuery(undefined, { skip: !user });
//   const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
//   const [verifyPayment] = useVerifyPaymentMutation();

//   const [activeStep, setActiveStep] = useState("address");
//   const [orderComplete, setOrderComplete] = useState(false);
//   const [orderId, setOrderId] = useState(null);
//   const [appliedCoupon, setAppliedCoupon] = useState([]);

//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
//   const [orderNotes, setOrderNotes] = useState("");
//   const [addressError, setAddressError] = useState("");
//   const [paymentMethodError, setPaymentMethodError] = useState("");

//   const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZOR_KEY_ID;

//   const total = cart?.total;
  

//   const handleAddressSelect = (address) => {
//     setSelectedAddress(address);
//     setAddressError("");
//   };

//   const handlePaymentSelect = (method) => {
//     if (method.id === "wallet" && (wallet?.balance || 0) < total) {
//       setPaymentMethodError(
//         `Insufficient wallet balance. Required: ₹${total.toFixed(
//           2
//         )}, Available: ₹${(wallet?.balance || 0).toFixed(2)}`
//       );
//       return;
//     }
//     setSelectedPaymentMethod(method);
//     setPaymentMethodError("");
//   };

//   const handleOrderNotesChange = (notes) => {
//     setOrderNotes(notes);
//   };

//   const handleCouponChange = (coupon) => {
//     setAppliedCoupon(coupon);
//   };

//   const goToPayment = () => {
//     if (!selectedAddress) {
//       setAddressError("Please select a delivery address");
//       return;
//     }
//     setActiveStep("payment");
//   };

//   const goToReview = () => {
//     if (!selectedPaymentMethod) {
//       setPaymentMethodError("Please select a payment method");
//       return;
//     }
//     setActiveStep("review");
//   };

//   const goBack = () => {
//     if (activeStep === "payment") {
//       setActiveStep("address");
//     } else if (activeStep === "review") {
//       setActiveStep("payment");
//     }
//   };

//   const handlePlaceOrder = async () => {
//     if (!selectedAddress) {
//       setActiveStep("address");
//       setAddressError("Please select a delivery address");
//       return;
//     }

//     if (!selectedPaymentMethod) {
//       setActiveStep("payment");
//       setPaymentMethodError("Please select a payment method");
//       return;
//     }

//     try {
//       const orderData = {
//         addressId: selectedAddress,
//         paymentMethod: selectedPaymentMethod.id,
//         cart: cart,
//         orderNotes,
//         appliedCoupon: appliedCoupon || null,
//       };

//       if (selectedPaymentMethod.id === "razorpay") {
//         const result = await placeOrder(orderData).unwrap();
//         await handleRazorpayPayment({
//           result,
//           user,
//           RAZORPAY_KEY_ID,
//           verifyPayment,
//           onSuccess: (orderId) => {
//             setOrderId(orderId);
//             setOrderComplete(true);
//             dispatch(clearCart());
//             navigate(`/user/checkout/order-confirmation/${orderId}`);
//           },
//           onError: (error, orderId) => {
//             dispatch(clearCart());
//             navigate(`/user/checkout/order-failure/${orderId}`, {
//               state: {
//                 errorMessage: error.message,
//                 errorCode: error.code
//               }
//             });
//           }
//         });
//       } else {
//         const result = await placeOrder(orderData).unwrap();
//         setOrderId(result.orderId);
//         setOrderComplete(true);
//         dispatch(clearCart());
//         navigate(`/user/checkout/order-confirmation/${result.orderId}`);
//       }
//     } catch (error) {
//       console.error("Place order error:", error);
//       dispatch(clearCart());
//       navigate(`/user/checkout/order-failure/${error.data?.orderId || "unknown"}`, {
//         state: {
//           errorMessage: error.data?.message || "Failed to place order. Please try again.",
//           errorCode: "ORDER_PLACEMENT_FAILED"
//         }
//       });
//     }
//   };

//   const continueShopping = () => {
//     navigate("/shop");
//   };

//   const backToCart = () => {
//     navigate("/cart");
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!cart?.items?.length) {
//     return (
//       <div className="container mx-auto px-4 py-20">
//         <Card>
//           <CardContent className="p-6 text-center">
//             <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
//             <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
//             <p className="text-gray-500 mb-4">
//               Add some items to your cart before proceeding to checkout.
//             </p>
//             <Button onClick={continueShopping}>Start Shopping</Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-20">
//       <h1 className="text-3xl font-bold mb-6">Checkout</h1>

//       <Tabs value={activeStep} className="w-full">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger
//             value="address"
//             onClick={() => setActiveStep("address")}
//             disabled={orderComplete}
//             className="data-[state=active]:bg-primary data-[state=active]:text-white"
//           >
//             1. Delivery Address
//           </TabsTrigger>
//           <TabsTrigger
//             value="payment"
//             onClick={() => selectedAddress && setActiveStep("payment")}
//             disabled={!selectedAddress || orderComplete}
//             className="data-[state=active]:bg-primary data-[state=active]:text-white"
//           >
//             2. Payment Method
//           </TabsTrigger>
//           <TabsTrigger
//             value="review"
//             onClick={() =>
//               selectedAddress &&
//               selectedPaymentMethod &&
//               setActiveStep("review")
//             }
//             disabled={
//               !selectedAddress || !selectedPaymentMethod || orderComplete
//             }
//             className="data-[state=active]:bg-primary data-[state=active]:text-white"
//           >
//             3. Review & Place Order
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="address" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <AddressSelectionComponent
//                 selectedAddress={selectedAddress}
//                 onAddressSelect={handleAddressSelect}
//                 error={addressError}
//               />
//             </div>
//             <div className="lg:col-span-1">
//               <OrderSummaryComponent
//                 cart={ cart }
//               />
//               <div className="mt-6 flex justify-between">
//                 <Button variant="outline" onClick={backToCart}>
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Cart
//                 </Button>
//                 <Button onClick={goToPayment}>
//                   Continue to Payment
//                   <ArrowRight className="h-4 w-4 ml-2" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="payment" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <PaymentOptionsComponent
//                 selectedPaymentMethod={selectedPaymentMethod}
//                 onPaymentSelect={handlePaymentSelect}
//                 onOrderNotesChange={handleOrderNotesChange}
//                 orderNotes={orderNotes}
//                 error={paymentMethodError}
//                 cartTotal={total}
//               />
//             </div>
//             <div className="lg:col-span-1">
//               <OrderSummaryComponent
//                 cart={ cart }
//               />
//               <div className="mt-6 flex justify-between">
//                 <Button variant="outline" onClick={goBack}>
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Address
//                 </Button>
//                 <Button onClick={goToReview}>
//                   Review Order
//                   <ArrowRight className="h-4 w-4 ml-2" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="review" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <Card>
//                 <CardHeader className="border-b">
//                   <CardTitle>Review Your Order</CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-4 space-y-6">
//                   <div>
//                     <h3 className="font-semibold mb-2">Delivery Address</h3>
//                     {selectedAddress && (
//                       <div className="bg-gray-50 p-4 rounded-md">
//                         <p className="font-medium">
//                           {selectedAddress.fullname}
//                         </p>
//                         {selectedAddress.email && (
//                           <p>{selectedAddress.email}</p>
//                         )}
//                         <p>{selectedAddress.addressLine}</p>
//                         <p>
//                           {selectedAddress.city}, {selectedAddress.state}{" "}
//                           {selectedAddress.postalCode}
//                         </p>
//                         <p>{selectedAddress.country}</p>
//                         <p className="text-gray-500 mt-1">
//                           {selectedAddress.phone}
//                         </p>
//                         <Button
//                           variant="link"
//                           className="p-0 h-auto text-primary mt-2"
//                           onClick={() => setActiveStep("address")}
//                         >
//                           Change
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                   <Separator />
//                   <div>
//                     <h3 className="font-semibold mb-2">Payment Method</h3>
//                     {selectedPaymentMethod && (
//                       <div className="bg-gray-50 p-4 rounded-md flex items-center gap-3">
//                         <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
//                           {selectedPaymentMethod.icon}
//                         </div>
//                         <div>
//                           <p className="font-medium">
//                             {selectedPaymentMethod.name}
//                           </p>
//                           {selectedPaymentMethod.description && (
//                             <p className="text-sm text-gray-500">
//                               {selectedPaymentMethod.description}
//                             </p>
//                           )}
//                         </div>
//                         <Button
//                           variant="link"
//                           className="p-0 h-auto text-primary ml-auto"
//                           onClick={() => setActiveStep("payment")}
//                         >
//                           Change
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                   <Separator />
//                   <div>
//                     <h3 className="font-semibold mb-2">Order Items</h3>
//                     <div className="space-y-4">
//                       {cart.items.map((item) => (
//                         <div
//                           key={`${item?.productId._id}-${
//                             item.variantId?._id || "no-variant"
//                           }`}
//                           className="flex gap-4"
//                         >
//                           <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
//                             <img
//                               src={item?.productId?.images[0] || "/placeholder.svg"}
//                               alt={item?.productId?.name}
//                               className="w-full h-full object-contain"
//                             />
//                           </div>
//                           <div className="flex-1">
//                             <h4 className="font-medium">{item?.productId?.name}</h4>
//                             {item?.variantId?.size && item?.variantId?.unit && (
//                               <p className="text-sm text-gray-500">
//                                 Size: {item?.variantId?.size}
//                                 {item?.variantId?.unit}
//                               </p>
//                             )}
//                             <div className="flex justify-between mt-1">
//                               <p className="text-sm">
//                                 ₹{(item?.variantId ? item?.variantId?.salePrice?.toFixed(2) : item?.productId?.salePrice)} x {item.quantity}
//                               </p>  
//                               <p className="font-medium">
//                                 ₹{((item?.variantId ? item?.variantId?.salePrice?.toFixed(2) : item?.productId?.salePrice) * item.quantity).toFixed(2)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   {appliedCoupon && (
//                     <>
//                       <Separator />
//                       <div>
//                         <h3 className="font-semibold mb-2">Applied Coupon</h3>
//                         <div className="bg-gray-50 p-4 rounded-md">
//                           <p className="font-medium">{appliedCoupon.code}</p>
//                           <p className="text-sm">
//                             {appliedCoupon.discountType === "percentage"
//                               ? `${appliedCoupon.discountValue}% off`
//                               : appliedCoupon.discountType === "fixed"
//                               ? `₹${appliedCoupon.discountValue} off`
//                               : "Free Shipping"}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             Discount: ₹{appliedCoupon.discount?.toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                   {orderNotes && (
//                     <>
//                       <Separator />
//                       <div>
//                         <h3 className="font-semibold mb-2">Order Notes</h3>
//                         <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
//                           {orderNotes}
//                         </p>
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//             <div className="lg:col-span-1">
//               <OrderSummaryComponent
//                 cart={ cart}
//                 detailed={true}
//                 onCouponChange={handleCouponChange}
//               />
//               <div className="mt-6 flex justify-between">
//                 <Button variant="outline" onClick={goBack}>
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Payment
//                 </Button>
//                 <Button
//                   onClick={handlePlaceOrder}
//                   disabled={isPlacingOrder}
//                   className="bg-primary hover:bg-primary/90"
//                 >
//                   {isPlacingOrder ? (
//                     <>
//                       <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="h-4 w-4 mr-2" />
//                       Place Order
//                     </>
//                   )}
//                 </Button>
//               </div>
//               <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
//                 <Lock className="h-3 w-3" />
//                 <span>Your payment information is secure</span>
//               </div>
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default CheckoutComponent;




// import { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   ArrowLeft,
//   ArrowRight,
//   ShoppingBag,
//   Lock,
//   CheckCircle
// } from "lucide-react";
// import { clearCart } from "@/store/slices/userSlice/cartSlice";
// import AddressSelectionComponent from "./AddressSelectionComponent";
// import PaymentOptionsComponent from "./PaymentOptionsComponent";
// import OrderSummaryComponent from "./OrderSummeryComponent";
// import {
//   useGetCartQuery,
//   usePlaceOrderMutation,
//   useGetWalletQuery,
//   useVerifyPaymentMutation
// } from "@/store/api/userApiSlice";
// import { handleRazorpayPayment } from "@/utils/razorPay";

// const CheckoutComponent = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const user = useSelector((state) => state.user.user);
//   const cartstate = useSelector((state) => state.cart);
//   const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !user || !cartstate });
//   const { data: wallet } = useGetWalletQuery(undefined, { skip: !user });
//   const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
//   const [verifyPayment] = useVerifyPaymentMutation();

//   const [activeStep, setActiveStep] = useState("address");
//   const [orderComplete, setOrderComplete] = useState(false);
//   const [orderId, setOrderId] = useState(null);
//   const [appliedCoupons, setAppliedCoupons] = useState([]);

//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
//   const [orderNotes, setOrderNotes] = useState("");
//   const [addressError, setAddressError] = useState("");
//   const [paymentMethodError, setPaymentMethodError] = useState("");

//   const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZOR_KEY_ID;

//   const total = cart?.total;

//   const handleAddressSelect = (address) => {
//     setSelectedAddress(address);
//     setAddressError("");
//   };

//   const handlePaymentSelect = (method) => {
//     if (method.id === "wallet" && (wallet?.balance || 0) < total) {
//       setPaymentMethodError(
//         `Insufficient wallet balance. Required: ₹${total.toFixed(
//           2
//         )}, Available: ₹${(wallet?.balance || 0).toFixed(2)}`
//       );
//       return;
//     }
//     setSelectedPaymentMethod(method);
//     setPaymentMethodError("");
//   };

//   const handleOrderNotesChange = (notes) => {
//     setOrderNotes(notes);
//   };

//   const handleCouponChange = (coupons) => {
//     setAppliedCoupons(coupons);
//   };

//   const goToPayment = () => {
//     if (!selectedAddress) {
//       setAddressError("Please select a delivery address");
//       return;
//     }
//     setActiveStep("payment");
//   };

//   const goToReview = () => {
//     if (!selectedPaymentMethod) {
//       setPaymentMethodError("Please select a payment method");
//       return;
//     }
//     setActiveStep("review");
//   };

//   const goBack = () => {
//     if (activeStep === "payment") {
//       setActiveStep("address");
//     } else if (activeStep === "review") {
//       setActiveStep("payment");
//     }
//   };

//   const handlePlaceOrder = async () => {
//     if (!selectedAddress) {
//       setActiveStep("address");
//       setAddressError("Please select a delivery address");
//       return;
//     }

//     if (!selectedPaymentMethod) {
//       setActiveStep("payment");
//       setPaymentMethodError("Please select a payment method");
//       return;
//     }

//     try {
//       const orderData = {
//         addressId: selectedAddress,
//         paymentMethod: selected_paramethod.id,
//         cart: cart,
//         orderNotes,
//         appliedCoupons: appliedCoupons.length ? appliedCoupons : null,
//       };

//       if (selectedPaymentMethod.id === "razorpay") {
//         const result = await placeOrder(orderData).unwrap();
//         await handleRazorpayPayment({
//           result,
//           user,
//           RAZORPAY_KEY_ID,
//           verifyPayment,
//           onSuccess: (orderId) => {
//             setOrderId(orderId);
//             setOrderComplete(true);
//             dispatch(clearCart());
//             navigate(`/user/checkout/order-confirmation/${orderId}`);
//           },
//           onError: (error, orderId) => {
//             dispatch(clearCart());
//             navigate(`/user/checkout/order-failure/${orderId}`, {
//               state: {
//                 errorMessage: error.message,
//                 errorCode: error.code
//               }
//             });
//           }
//         });
//       } else {
//         const result = await placeOrder(orderData).unwrap();
//         setOrderId(result.orderId);
//         setOrderComplete(true);
//         dispatch(clearCart());
//         navigate(`/user/checkout/order-confirmation/${result.orderId}`);
//       }
//     } catch (error) {
//       console.error("Place order error:", error);
//       dispatch(clearCart());
//       navigate(`/user/checkout/order-failure/${error.data?.orderId || "unknown"}`, {
//         state: {
//           errorMessage: error.data?.message || "Failed to place order. Please try again.",
//           errorCode: "ORDER_PLACEMENT_FAILED"
//         }
//       });
//     }
//   };

//   const continueShopping = () => {
//     navigate("/shop");
//   };

//   const backToCart = () => {
//     navigate("/cart");
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!cart?.items?.length) {
//     return (
//       <div className="container mx-auto px-4 py-20">
//         <Card>
//           <CardContent className="p-6 text-center">
//             <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
//             <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
//             <p className="text-gray-500 mb-4">
//               Add some items to your cart before proceeding to checkout.
//             </p>
//             <Button onClick={continueShopping}>Start Shopping</Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-20">
//       <h1 className="text-3xl font-bold mb-6">Checkout</h1>

//       <Tabs value={activeStep} className="w-full">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger
//             value="address"
//             onClick={() => setActiveStep("address")}
//             disabled={orderComplete}
//             className="data-[state=active]:bg-primary data-[state=active]:text-white"
//           >
//             1. Delivery Address
//           </TabsTrigger>
//           <TabsTrigger
//             value="payment"
//             onClick={() => selectedAddress && setActiveStep("payment")}
//             disabled={!selectedAddress || orderComplete}
//             className="data-[state=active]:bg-primary data-[state=active]:text-white"
//           >
//             2. Payment Method
//           </TabsTrigger>
//           <TabsTrigger
//             value="review"
//             onClick={() =>
//               selectedAddress &&
//               selectedPaymentMethod &&
//               setActiveStep("review")
//             }
//             disabled={
//               !selectedAddress || !selectedPaymentMethod || orderComplete
//             }
//             className="data-[state=active]:bg-primary data-[state=active]:text-white"
//           >
//             3. Review & Place Order
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="address" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <AddressSelectionComponent
//                 selectedAddress={selectedAddress}
//                 onAddressSelect={handleAddressSelect}
//                 error={addressError}
//               />
//             </div>
//             <div className="lg:col-span-1">
//               <OrderSummaryComponent
//                 cart={ cart }
//                 // detailed={true}
//                 // onCouponChange={handleCouponChange}
//               />
//               <div className="mt-6 flex justify-between">
//                 <Button variant="outline" onClick={backToCart}>
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Cart
//                 </Button>
//                 <Button onClick={goToPayment}>
//                   Continue to Payment
//                   <ArrowRight className="h-4 w-4 ml-2" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="payment" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <PaymentOptionsComponent
//                 selectedPaymentMethod={selectedPaymentMethod}
//                 onPaymentSelect={handlePaymentSelect}
//                 onOrderNotesChange={handleOrderNotesChange}
//                 orderNotes={orderNotes}
//                 error={paymentMethodError}
//                 cartTotal={total}
//               />
//             </div>
//             <div className="lg:col-span-1">
//               <OrderSummaryComponent
//                 cart={ cart }
//                 // detailed={true}
//                 // onCouponChange={handleCouponChange}
//               />
//               <div className="mt-6 flex justify-between">
//                 <Button variant="outline" onClick={goBack}>
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Address
//                 </Button>
//                 <Button onClick={goToReview}>
//                   Review Order
//                   <ArrowRight className="h-4 w-4 ml-2" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="review" className="mt-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <Card>
//                 <CardHeader className="border-b">
//                   <CardTitle>Review Your Order</CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-4 space-y-6">
//                   <div>
//                     <h3 className="font-semibold mb-2">Delivery Address</h3>
//                     {selectedAddress && (
//                       <div className="bg-gray-50 p-4 rounded-md">
//                         <p className="font-medium">
//                           {selectedAddress.fullname}
//                         </p>
//                         {selectedAddress.email && (
//                           <p>{selectedAddress.email}</p>
//                         )}
//                         <p>{selectedAddress.addressLine}</p>
//                         <p>
//                           {selectedAddress.city}, {selectedAddress.state}{" "}
//                           {selectedAddress.postalCode}
//                         </p>
//                         <p>{selectedAddress.country}</p>
//                         <p className="text-gray-500 mt-1">
//                           {selectedAddress.phone}
//                         </p>
//                         <Button
//                           variant="link"
//                           className="p-0 h-auto text-primary mt-2"
//                           onClick={() => setActiveStep("address")}
//                         >
//                           Change
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                   <Separator />
//                   <div>
//                     <h3 className="font-semibold mb-2">Payment Method</h3>
//                     {selectedPaymentMethod && (
//                       <div className="bg-gray-50 p-4 rounded-md flex items-center gap-3">
//                         <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
//                           {selectedPaymentMethod.icon}
//                         </div>
//                         <div>
//                           <p className="font-medium">
//                             {selectedPaymentMethod.name}
//                           </p>
//                           {selectedPaymentMethod.description && (
//                             <p className="text-sm text-gray-500">
//                               {selectedPaymentMethod.description}
//                             </p>
//                           )}
//                         </div>
//                         <Button
//                           variant="link"
//                           className="p-0 h-auto text-primary ml-auto"
//                           onClick={() => setActiveStep("payment")}
//                         >
//                           Change
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                   <Separator />
//                   <div>
//                     <h3 className="font-semibold mb-2">Order Items</h3>
//                     <div className="space-y-4">
//                       {cart.items.map((item) => (
//                         <div
//                           key={`${item?.productId._id}-${
//                             item.variantId?._id || "no-variant"
//                           }`}
//                           className="flex gap-4"
//                         >
//                           <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
//                             <img
//                               src={item?.productId?.images[0] || "/placeholder.svg"}
//                               alt={item?.productId?.name}
//                               className="w-full h-full object-contain"
//                             />
//                           </div>
//                           <div className="flex-1">
//                             <h4 className="font-medium">{item?.productId?.name}</h4>
//                             {item?.variantId?.size && item?.variantId?.unit && (
//                               <p className="text-sm text-gray-500">
//                                 Size: {item?.variantId?.size}
//                                 {item?.variantId?.unit}
//                               </p>
//                             )}
//                             <div className="flex justify-between mt-1">
//                               <p className="text-sm">
//                                 ₹{(item?.variantId ? item?.variantId?.salePrice?.toFixed(2) : item?.productId?.salePrice)} x {item.quantity}
//                               </p>  
//                               <p className="font-medium">
//                                 ₹{((item?.variantId ? item?.variantId?.salePrice?.toFixed(2) : item?.productId?.salePrice) * item.quantity).toFixed(2)}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   {appliedCoupons.length > 0 && (
//                     <>
//                       <Separator />
//                       <div>
//                         <h3 className="font-semibold mb-2">Applied Coupons</h3>
//                         <div className="space-y-2">
//                           {appliedCoupons.map(coupon => (
//                             <div key={coupon.code} className="bg-gray-50 p-4 rounded-md">
//                               <p className="font-medium">{coupon.code}</p>
//                               <p className="text-sm">
//                                 {coupon.discountType === "percentage"
//                                   ? `${coupon.discountValue}% off`
//                                   : coupon.discountType === "fixed"
//                                   ? `₹${coupon.discountValue} off`
//                                   : "Free Shipping"}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 Discount: ₹{coupon.discount?.toFixed(2)}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </>
//                   )}
//                   {orderNotes && (
//                     <>
//                       <Separator />
//                       <div>
//                         <h3 className="font-semibold mb-2">Order Notes</h3>
//                         <p className="text-gray-700 bg-gray-50 rounded-md">
//                           {orderNotes}
//                         </p>
//                       </div>
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//             <div className="lg:col-span-1">
//               <OrderSummaryComponent
//                 cart={ cart }
//                 detailed={true}
//                 onCouponChange={handleCouponChange}
//               />
//               <div className="mt-6 flex justify-between">
//                 <Button variant="outline" onClick={goBack}>
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Payment
//                 </Button>
//                 <Button
//                   onClick={handlePlaceOrder}
//                   disabled={isPlacingOrder}
//                   className="bg-primary hover:bg-primary/90"
//                 >
//                   {isPlacingOrder ? (
//                     <>
//                       <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="h-4 w-4 mr-2" />
//                       Place Order
//                     </>
//                   )}
//                 </Button>
//               </div>
//               <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
//                 <Lock className="h-3 w-3" />
//                 <span>Your payment information is secure</span>
//               </div>
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default CheckoutComponent;





import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Lock,
  CheckCircle
} from "lucide-react";
import { clearCart } from "@/store/slices/userSlice/cartSlice";
import AddressSelectionComponent from "./AddressSelectionComponent";
import PaymentOptionsComponent from "./PaymentOptionsComponent";
import OrderSummaryComponent from "./OrderSummeryComponent";
import {
  useGetCartQuery,
  usePlaceOrderMutation,
  useGetWalletQuery,
  useVerifyPaymentMutation
} from "@/store/api/userApiSlice";
import { handleRazorpayPayment } from "@/utils/razorPay";

const CheckoutComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const cartstate = useSelector((state) => state.cart);
  const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !user || !cartstate });
  const { data: wallet } = useGetWalletQuery(undefined, { skip: !user });
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const [activeStep, setActiveStep] = useState("address");
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [appliedCoupons, setAppliedCoupons] = useState([]);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [addressError, setAddressError] = useState("");
  const [paymentMethodError, setPaymentMethodError] = useState("");

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZOR_KEY_ID;

  const total = cart?.total;

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setAddressError("");
  };

  const handlePaymentSelect = (method) => {
    if (method.id === "wallet" && (wallet?.balance || 0) < total) {
      setPaymentMethodError(
        `Insufficient wallet balance. Required: ₹${total.toFixed(
          2
        )}, Available: ₹${(wallet?.balance || 0).toFixed(2)}`
      );
      return;
    }
    setSelectedPaymentMethod(method);
    setPaymentMethodError("");
  };

  const handleOrderNotesChange = (notes) => {
    setOrderNotes(notes);
  };

  const handleCouponChange = (coupons) => {
    setAppliedCoupons(coupons);
  };

  const goToPayment = () => {
    if (!selectedAddress) {
      setAddressError("Please select a delivery address");
      return;
    }
    setActiveStep("payment");
  };

  const goToReview = () => {
    if (!selectedPaymentMethod) {
      setPaymentMethodError("Please select a payment method");
      return;
    }
    setActiveStep("review");
  };

  const goBack = () => {
    if (activeStep === "payment") {
      setActiveStep("address");
    } else if (activeStep === "review") {
      setActiveStep("payment");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setActiveStep("address");
      setAddressError("Please select a delivery address");
      return;
    }

    if (!selectedPaymentMethod) {
      setActiveStep("payment");
      setPaymentMethodError("Please select a payment method");
      return;
    }

    try {
      const orderData = {
        addressId: selectedAddress,
        paymentMethod: selectedPaymentMethod.id, // Fixed typo here: selected_paramethod -> selectedPaymentMethod
        cart: cart,
        orderNotes,
        appliedCoupons: appliedCoupons.length ? appliedCoupons : null,
      };

      if (selectedPaymentMethod.id === "razorpay") {
        const result = await placeOrder(orderData).unwrap();
        await handleRazorpayPayment({
          result,
          user,
          RAZORPAY_KEY_ID,
          verifyPayment,
          onSuccess: (orderId) => {
            setOrderId(orderId);
            setOrderComplete(true);
            dispatch(clearCart());
            navigate(`/user/checkout/order-confirmation/${orderId}`);
          },
          onError: (error, orderId) => {
            dispatch(clearCart());
            navigate(`/user/checkout/order-failure/${orderId}`, {
              state: {
                errorMessage: error.message,
                errorCode: error.code
              }
            });
          }
        });
      } else {
        const result = await placeOrder(orderData).unwrap();
        setOrderId(result.orderId);
        setOrderComplete(true);
        dispatch(clearCart());
        navigate(`/user/checkout/order-confirmation/${result.orderId}`);
      }
    } catch (error) {
      console.error("Place order error:", error);
      dispatch(clearCart());
      navigate(`/user/checkout/order-failure/${error.data?.orderId || "unknown"}`, {
        state: {
          errorMessage: error.data?.message || "Failed to place order. Please try again.",
          errorCode: "ORDER_PLACEMENT_FAILED"
        }
      });
    }
  };

  const continueShopping = () => {
    navigate("/shop");
  };

  const backToCart = () => {
    navigate("/cart");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Button onClick={continueShopping}>Start Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Checkout</h1>

      <Tabs value={activeStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger
            value="address"
            onClick={() => setActiveStep("address")}
            disabled={orderComplete}
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm md:text-base"
          >
            <span className="hidden sm:inline">1. Delivery Address</span>
            <span className="sm:hidden">1. Address</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            onClick={() => selectedAddress && setActiveStep("payment")}
            disabled={!selectedAddress || orderComplete}
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm md:text-base"
          >
            <span className="hidden sm:inline">2. Payment Method</span>
            <span className="sm:hidden">2. Payment</span>
          </TabsTrigger>
          <TabsTrigger
            value="review"
            onClick={() =>
              selectedAddress &&
              selectedPaymentMethod &&
              setActiveStep("review")
            }
            disabled={
              !selectedAddress || !selectedPaymentMethod || orderComplete
            }
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm md:text-base"
          >
            <span className="hidden sm:inline">3. Review & Place Order</span>
            <span className="sm:hidden">3. Review</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="address" className="mt-2 md:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <AddressSelectionComponent
                selectedAddress={selectedAddress}
                onAddressSelect={handleAddressSelect}
                error={addressError}
              />
            </div>
            <div className="lg:col-span-1 mt-4 lg:mt-0">
              <OrderSummaryComponent
                cart={cart}
              />
              <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button 
                  variant="outline" 
                  onClick={backToCart}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
                <Button 
                  onClick={goToPayment}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-2 md:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <PaymentOptionsComponent
                selectedPaymentMethod={selectedPaymentMethod}
                onPaymentSelect={handlePaymentSelect}
                onOrderNotesChange={handleOrderNotesChange}
                orderNotes={orderNotes}
                error={paymentMethodError}
                cartTotal={total}
              />
            </div>
            <div className="lg:col-span-1 mt-4 lg:mt-0">
              <OrderSummaryComponent
                cart={cart}
              />
              <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button 
                  variant="outline" 
                  onClick={goBack}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Address
                </Button>
                <Button 
                  onClick={goToReview}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Review Order
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-2 md:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b py-4 px-4 md:px-6">
                  <CardTitle className="text-lg md:text-xl">Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Address</h3>
                    {selectedAddress && (
                      <div className="bg-gray-50 p-3 md:p-4 rounded-md">
                        <p className="font-medium">
                          {selectedAddress.fullname}
                        </p>
                        {selectedAddress.email && (
                          <p className="text-sm md:text-base">{selectedAddress.email}</p>
                        )}
                        <p className="text-sm md:text-base">{selectedAddress.addressLine}</p>
                        <p className="text-sm md:text-base">
                          {selectedAddress.city}, {selectedAddress.state}{" "}
                          {selectedAddress.postalCode}
                        </p>
                        <p className="text-sm md:text-base">{selectedAddress.country}</p>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">
                          {selectedAddress.phone}
                        </p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary mt-2 text-sm"
                          onClick={() => setActiveStep("address")}
                        >
                          Change
                        </Button>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    {selectedPaymentMethod && (
                      <div className="bg-gray-50 p-3 md:p-4 rounded-md flex items-center gap-2 md:gap-3">
                        <div className="w-10 h-7 md:w-12 md:h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          {selectedPaymentMethod.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm md:text-base">
                            {selectedPaymentMethod.name}
                          </p>
                          {selectedPaymentMethod.description && (
                            <p className="text-xs md:text-sm text-gray-500 truncate">
                              {selectedPaymentMethod.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary text-sm flex-shrink-0"
                          onClick={() => setActiveStep("payment")}
                        >
                          Change
                        </Button>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <div className="space-y-3 md:space-y-4">
                      {cart.items.map((item) => (
                        <div
                          key={`${item?.productId._id}-${
                            item.variantId?._id || "no-variant"
                          }`}
                          className="flex gap-3 md:gap-4"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={item?.productId?.images[0] || "/placeholder.svg"}
                              alt={item?.productId?.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm md:text-base truncate">{item?.productId?.name}</h4>
                            {item?.variantId?.size && item?.variantId?.unit && (
                              <p className="text-xs md:text-sm text-gray-500">
                                Size: {item?.variantId?.size}
                                {item?.variantId?.unit}
                              </p>
                            )}
                            <div className="flex justify-between mt-1">
                              <p className="text-xs md:text-sm">
                                ₹{(item?.variantId ? item?.variantId?.salePrice?.toFixed(2) : item?.productId?.salePrice)} x {item.quantity}
                              </p>  
                              <p className="font-medium text-xs md:text-sm">
                                ₹{((item?.variantId ? item?.variantId?.salePrice : item?.productId?.salePrice) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {appliedCoupons.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Applied Coupons</h3>
                        <div className="space-y-2">
                          {appliedCoupons.map(coupon => (
                            <div key={coupon.code} className="bg-gray-50 p-3 md:p-4 rounded-md">
                              <p className="font-medium text-sm md:text-base">{coupon.code}</p>
                              <p className="text-xs md:text-sm">
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountValue}% off`
                                  : coupon.discountType === "fixed"
                                  ? `₹${coupon.discountValue} off`
                                  : "Free Shipping"}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500">
                                Discount: ₹{coupon.discount?.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {orderNotes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Order Notes</h3>
                        <p className="text-sm md:text-base text-gray-700 bg-gray-50 p-3 md:p-4 rounded-md">
                          {orderNotes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 mt-4 lg:mt-0">
              <OrderSummaryComponent
                cart={cart}
                detailed={true}
                onCouponChange={handleCouponChange}
              />
              <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button 
                  variant="outline" 
                  onClick={goBack}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Payment
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 order-1 sm:order-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                <Lock className="h-3 w-3" />
                <span>Your payment information is secure</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckoutComponent;