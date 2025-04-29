// import { useNavigate, useParams } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { ShoppingBag, Package, Clock, ArrowRight } from "lucide-react";
// import AnimatedCheckmark from "@/components/ui/AnimatedCheck";
// import { useGetOrderDetailsQuery } from "@/store/api/userApiSlice";

// const OrderConfirmationComponent = () => {
//   const navigate = useNavigate();
//   const { orderId } = useParams();

//   const { data: order, isLoading, error } = useGetOrderDetailsQuery(orderId);

//   console.log("Order details from OrderConfirmationComponent:", order);

//   if (isLoading) {
//     return <div className="container mx-auto px-4 py-20">Loading order details...</div>;
//   }

//   if (error || !order) {
//     return (
//       <div className="container mx-auto px-4 py-20">
//         <Card>
//           <CardContent className="p-6 text-center">
//             <h3 className="text-xl font-semibold mb-2">Failed to Load Order</h3>
//             <p className="text-gray-500">
//               {error?.data?.message || "Unable to fetch order details."}
//             </p>
//             <Button onClick={() => navigate("/user/orders")} className="mt-4">
//               Go to Orders
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }
//   const estimatedDelivery = new Date(
//     new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
//   ).toLocaleDateString();

//   const viewOrderDetails = () => {
//     navigate(`/user/orders/${order.orderId}`);
//   };

//   const continueShopping = () => {
//     navigate("/shop");
//   };

//   return (
//     <div className="container mx-auto px-4 py-20">
//       <Card className="max-w-3xl mx-auto">
//         <CardHeader className="text-center border-b">
//           <AnimatedCheckmark
//             size={80}
//             strokeWidth={4}
//             color="rgb(22 163 74)"
//             withGlow={true}
//             glowColor="bg-green-500/20"
//           />
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.8, duration: 0.6 }}
//           >
//             <CardTitle className="text-2xl font-bold text-green-600 mt-4">
//               Order Confirmed!
//             </CardTitle>
//             <p className="text-gray-500">
//               Thank you for your purchase. Your order has been received and is
//               being processed.
//             </p>
//           </motion.div>
//         </CardHeader>
//         <CardContent className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h3 className="font-semibold mb-2">Order Information</h3>
//               <div className="bg-gray-50 p-4 rounded-md space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Order Number:</span>
//                   <span className="font-medium">{order.orderId}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Date:</span>
//                   <span>{new Date(order.createdAt).toLocaleDateString()}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Status:</span>
//                   <span className="capitalize flex items-center">
//                     <Clock className="h-4 w-4 mr-1 text-amber-500" />
//                     {order.status}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Payment Method:</span>
//                   <span>{order.paymentMethod}</span>
//                 </div>
//               </div>
//             </div>
//             <div>
//               <h3 className="font-semibold mb-2">Shipping Information</h3>
//               <div className="bg-gray-50 p-4 rounded-md space-y-1">
//                 <p className="font-medium">{order.shippingAddress.fullname}</p>
//                 <p>{order.shippingAddress.addressLine}</p>
//                 <p>
//                   {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
//                   {order.shippingAddress.postalCode}
//                 </p>
//                 <p>{order.shippingAddress.country}</p>
//                 <p className="text-gray-500 mt-1">{order.shippingAddress.phone}</p>
//                 <div className="mt-2 pt-2 border-t border-gray-200">
//                   <p className="text-gray-600">
//                     <span className="font-medium">Estimated Delivery:</span>{" "}
//                     {estimatedDelivery}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <Separator />
//           <div>
//             <h3 className="font-semibold mb-4">Order Summary</h3>
//             <div className="space-y-4">
//               {order.items.map((item) => (
//                 <div key={item._id} className="flex gap-4">
//                   <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
//                     <img
//                       src={item.productId.images[0] || "/placeholder.svg"}
//                       alt={item.name}
//                       className="w-full h-full object-contain"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <h4 className="font-medium">{item?.productId?.name}</h4>
//                     <div className="flex justify-between mt-1">
//                       <p className="text-sm">
//                         ₹{item.price.toFixed(2)} x {item.quantity}
//                       </p>
//                       <p className="font-medium">
//                         ₹{(item.price * item.quantity).toFixed(2)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-6 bg-gray-50 p-4 rounded-md">
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Subtotal:</span>
//                   <span>₹{order.subtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Shipping:</span>
//                   <span>₹{order.shipping.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Tax:</span>
//                   <span>₹{order.tax.toFixed(2)}</span>
//                 </div>
//                 {order.discount > 0 && (
//                   <div className="flex justify-between text-green-600">
//                     <span>Discount:</span>
//                     <span>-₹{order.discount.toFixed(2)}</span>
//                   </div>
//                 )}
//                 <Separator />
//                 <div className="flex justify-between font-bold">
//                   <span>Total:</span>
//                   <span>₹{order.total.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
//             <Package className="h-5 w-5 text-blue-600 mt-0.5" />
//             <div>
//               <p className="font-medium text-blue-800">What happens next?</p>
//               <p className="text-sm text-blue-700">
//                 You will receive an email confirmation with your order details
//                 and tracking information once your order ships. You can also
//                 check the status of your order in your account dashboard.
//               </p>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter className="border-t p-6 flex flex-col sm:flex-row gap-4 justify-between">
//           <Button variant="outline" onClick={continueShopping}>
//             <ShoppingBag className="h-4 w-4 mr-2" />
//             Continue Shopping
//           </Button>
//           <Button
//             onClick={viewOrderDetails}
//             className="bg-primary hover:bg-primary/90"
//           >
//             View Order Details
//             <ArrowRight className="h-4 w-4 ml-2" />
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// export default OrderConfirmationComponent;



import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Package, Clock, ArrowRight } from "lucide-react";
import AnimatedCheckmark from "@/components/ui/AnimatedCheck";
import { useGetOrderDetailsQuery } from "@/store/api/userApiSlice";
import confetti from "canvas-confetti";
import { useEffect } from "react";

const OrderConfirmationComponent = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const { data: order, isLoading, error } = useGetOrderDetailsQuery(orderId);

  console.log("Order details from OrderConfirmationComponent:", order);

  useEffect(() => {
    if (order && !isLoading && !error) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [order, isLoading, error]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Failed to Load Order</h3>
            <p className="text-gray-500">
              {error?.data?.message || "Unable to fetch order details."}
            </p>
            <Button onClick={() => navigate("/user/orders")} className="mt-4">
              Go to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedDelivery = new Date(
    new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString();

  const viewOrderDetails = () => {
    navigate(`/user/orders/${order.orderId}`);
  };

  const continueShopping = () => {
    navigate("/shop");
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center border-b">
          <AnimatedCheckmark
            size={80}
            strokeWidth={4}
            color="rgb(22 163 74)"
            withGlow={true}
            glowColor="bg-green-500/20"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <CardTitle className="text-2xl font-bold text-green-600 mt-4">
              Order Confirmed!
            </CardTitle>
            <p className="text-gray-500">
              Thank you for your purchase. Your order has been received and is
              being processed.
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-amber-500" />
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shipping Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-1">
                <p className="font-medium">{order.shippingAddress.fullname}</p>
                <p>{order.shippingAddress.addressLine}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-gray-500 mt-1">{order.shippingAddress.phone}</p>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-gray-600">
                    <span className="font-medium">Estimated Delivery:</span>{" "}
                    {estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex上门 gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.productId.images[0] || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item?.productId?.name}</h4>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm">
                        ₹{item.price.toFixed(2)} x {item.quantity}
                      </p>
                      <p className="font-medium">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>₹{order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                {order?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>  ₹{order?.discount?.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">What happens next?</p>
              <p className="text-sm text-blue-700">
                You will receive an email confirmation with your order details
                and tracking information once your order ships. You can also
                check the status of your order in your account dashboard.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex flex-col sm:flex-row gap-4 justify-between">
          <Button variant="outline" onClick={continueShopping}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
          <Button
            onClick={viewOrderDetails}
            className="bg-primary hover:bg-primary/90"
          >
            View Order Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderConfirmationComponent;