// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import {
//   Ticket,
//   ChevronDown,
//   ChevronUp,
//   Check,
//   Copy,
//   AlertCircle,
//   X,
// } from "lucide-react";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import {
//   useApplyCouponMutation,
//   useGetAvailableCouponsQuery,
// } from "@/store/api/userApiSlice";
// import { useSelector } from "react-redux";

// const OrderSummaryComponent = ({ cart, detailed = false, onCouponChange }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [couponCode, setCouponCode] = useState("");
//   const [appliedCoupon, setAppliedCoupon] = useState(null);
//   const [error, setError] = useState("");

//   const userId = useSelector((state) => state.user.user?._id);
//   const { subtotal, shipping, tax, total } = cart

//   const { data: availableCoupons, isLoading: couponsLoading } =
//     useGetAvailableCouponsQuery({ subtotal, userId }, { skip: !subtotal || !userId });
  
//   const [applyCoupon] = useApplyCouponMutation();

//   const totalActualPrice =
//     cart?.items?.reduce((sum, item) => {
//       const actualPrice =
//         item.variantId?.actualPrice || item.productId.actualPrice;
//       return sum + actualPrice * item.quantity;
//     }, 0) || 0;
//   const savings = totalActualPrice - subtotal;

//   let discount = 0;
//   if (appliedCoupon) {
//     if (appliedCoupon.discountType === "percentage" || appliedCoupon.discountType === "referral") {
//       discount = (subtotal * appliedCoupon.discountValue) / 100;
//     } else if (appliedCoupon.discountType === "fixed") {
//       discount = appliedCoupon.discountValue;
//     } else if (appliedCoupon.discountType === "shipping" && detailed) {
//       discount = shipping;
//     }
//   }
//   discount = Math.min(discount, subtotal);

//   const handleApplyCoupon = async () => {
//     if (!couponCode.trim()) return;

//     setError("");
//     try {
//       const response = await applyCoupon({
//         code: couponCode,
//         subtotal,
//         shipping,
//         userId,
//       }).unwrap();
//       const couponData = {
//         ...response.coupon,
//         discount,
//       };
//       setAppliedCoupon(couponData);
//       onCouponChange(couponData);
//       setCouponCode("");
//     } catch (err) {
//       setError(err.data?.message || "Failed to apply coupon");
//     }
//   };

//   const handleSelectCoupon = async (coupon) => {
//     setError("");
//     try {
//       const response = await applyCoupon({
//         code: coupon.code,
//         subtotal,
//         shipping,
//         userId,
//       }).unwrap();

//       const newDiscount = response.discount;
//       const couponData = {
//         ...response.coupon,
//         discount: newDiscount,
//       };
//       setAppliedCoupon(couponData);
//       onCouponChange(couponData);
//       setIsOpen(false);
//     } catch (err) {
//       setError(err.data?.message || "Failed to apply coupon");
//     }
//   };

//   const handleRemoveCoupon = () => {
//     setAppliedCoupon(null);
//     onCouponChange(null);
//     setError("");
//   };

//   const handleCopyCouponCode = (code) => {
//     navigator.clipboard.writeText(code);
//     setCouponCode(code);
//   };

//   return (
//     <Card>
//       <CardHeader className="border-b">
//         <CardTitle>Order Summary</CardTitle>
//       </CardHeader>
//       <CardContent className="p-4">
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">
//               Subtotal ({cart?.items?.length} items)
//             </span>
//             <span>₹{subtotal.toFixed(2)}</span>
//           </div>
//           {savings > 0 && (
//             <div className="flex justify-between items-center text-green-600">
//               <span>You Saved</span>
//               <span>-₹{savings.toFixed(2)}</span>
//             </div>
//           )}
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Shipping</span>
//             <span>₹{shipping.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Tax</span>
//             <span>₹{tax.toFixed(2)}</span>
//           </div>
//           {detailed && (
//             <div className="pt-2">
//               <Collapsible open={isOpen} onOpenChange={setIsOpen}>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Ticket className="h-4 w-4 text-primary" />
//                     <span className="font-medium">Apply Coupon</span>
//                   </div>
//                   <CollapsibleTrigger asChild>
//                     <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
//                       {isOpen ? (
//                         <ChevronUp className="h-4 w-4" />
//                       ) : (
//                         <ChevronDown className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </CollapsibleTrigger>
//                 </div>
//                 {appliedCoupon ? (
//                   <div className="mt-2 bg-primary/10 p-3 rounded-md flex items-center justify-between">
//                     <div>
//                       <div className="flex items-center gap-2">
//                         <Badge className="bg-primary">
//                           {appliedCoupon.code}
//                         </Badge>
//                         <span className="text-sm font-medium">
//                           {appliedCoupon.discount}
//                           {appliedCoupon.discountType === "referral" && (
//                             <Badge variant="secondary" className="ml-2">
//                               Referral
//                             </Badge>
//                           )}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {appliedCoupon.description}
//                       </p>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="h-8 w-8 p-0 text-gray-500"
//                       onClick={handleRemoveCoupon}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="mt-2 flex gap-2">
//                     <Input
//                       placeholder="Enter coupon code"
//                       value={couponCode}
//                       onChange={(e) => setCouponCode(e.target.value)}
//                       className="h-9"
//                     />
//                     <Button
//                       onClick={handleApplyCoupon}
//                       disabled={!couponCode.trim()}
//                       className="h-9"
//                     >
//                       Apply
//                     </Button>
//                   </div>
//                 )}
//                 {error && (
//                   <Alert variant="destructive" className="mt-2 py-2">
//                     <div className="flex items-center space-x-2">
//                       <AlertCircle className="h-4 w-4 flex-shrink-0 mt-[2px]" />
//                       <AlertDescription className="text-xs">
//                         {error}
//                       </AlertDescription>
//                     </div>
//                   </Alert>
//                 )}

//                 <CollapsibleContent className="mt-3 space-y-3">
//                   <p className="text-sm font-medium">Available Coupons</p>
//                   {couponsLoading ? (
//                     <p className="text-sm text-gray-500">Loading coupons...</p>
//                   ) : availableCoupons?.length === 0 ? (
//                     <p className="text-sm text-gray-500">
//                       No coupons available at the moment.
//                     </p>
//                   ) : (
//                     <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
//                       {availableCoupons?.map((coupon) => (
//                         <div
//                           key={coupon.id}
//                           className="border rounded-md p-3 hover:border-primary cursor-pointer"
//                           onClick={() => handleSelectCoupon(coupon)}
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <Badge className="bg-primary">
//                                 {coupon.code}
//                               </Badge>
//                               <span className="text-sm font-medium">
//                                 {coupon.discount}
//                                 {coupon.discountType === "referral" && (
//                                   <Badge variant="secondary" className="ml-2">
//                                     Referral
//                                   </Badge>
//                                 )}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 w-6 p-0"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleCopyCouponCode(coupon.code);
//                                 }}
//                                 title="Copy code"
//                               >
//                                 <Copy className="h-3 w-3" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 w-6 p-0 text-primary"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleSelectCoupon(coupon);
//                                 }}
//                                 title="Apply coupon"
//                               >
//                                 <Check className="h-3 w-3" />
//                               </Button>
//                             </div>
//                           </div>
//                           <p className="text-xs text-gray-500 mt-1">
//                             {coupon.description}
//                           </p>
//                           <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
//                             <span>
//                               Min. Purchase: ₹{coupon.minPurchase.toFixed(2)}
//                             </span>
//                             <span>
//                               Valid until:{" "}
//                               {coupon.validUntil
//                                 ? new Date(coupon.validUntil).toLocaleDateString()
//                                 : "No Expiry"}
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CollapsibleContent>
//               </Collapsible>
//             </div>
//           )}
//           {appliedCoupon && discount > 0 && (
//             <div className="flex justify-between items-center text-green-600">
//               <span>Discount ({appliedCoupon.discount})</span>
//               <span>-₹{discount.toFixed(2)}</span>
//             </div>
//           )}
//           <Separator />
//           <div className="flex justify-between items-center font-bold">
//             <span>Total</span>
//             <span>₹{(total - discount).toFixed(2)}</span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default OrderSummaryComponent;






// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import {
//   Ticket,
//   ChevronDown,
//   ChevronUp,
//   Check,
//   Copy,
//   AlertCircle,
//   X,
// } from "lucide-react";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import {
//   useApplyCouponMutation,
//   useGetAvailableCouponsQuery,
// } from "@/store/api/userApiSlice";
// import { useSelector } from "react-redux";

// const OrderSummaryComponent = ({ cart, detailed = false, onCouponChange }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [couponCode, setCouponCode] = useState("");
//   const [appliedCoupons, setAppliedCoupons] = useState([]);
//   const [error, setError] = useState("");

//   const userId = useSelector((state) => state.user.user?._id);
//   const { subtotal, shipping, tax, total } = cart;

//   const { data: availableCoupons, isLoading: couponsLoading } =
//     useGetAvailableCouponsQuery(
//       { subtotal, userId, appliedCouponCodes: appliedCoupons.map(c => c.code) },
//       { skip: !subtotal || !userId }
//     );

//   const [applyCoupon] = useApplyCouponMutation();

//   const totalActualPrice =
//     cart?.items?.reduce((sum, item) => {
//       const actualPrice =
//         item.variantId?.actualPrice || item.productId.actualPrice;
//       return sum + actualPrice * item.quantity;
//     }, 0) || 0;
//   const savings = totalActualPrice - subtotal;

//   const calculateDiscount = () => {
//     let totalDiscount = 0;
//     appliedCoupons.forEach(coupon => {
//       let discount = 0;
//       if (coupon.discountType === "percentage" || coupon.discountType === "referral") {
//         discount = (subtotal * coupon.discountValue) / 100;
//       } else if (coupon.discountType === "fixed") {
//         discount = coupon.discountValue;
//       } else if (coupon.discountType === "shipping" && detailed) {
//         discount = shipping;
//       }
//       totalDiscount += Math.min(discount, subtotal - totalDiscount);
//     });
//     return totalDiscount;
//   };

//   const totalDiscount = calculateDiscount();

//   const handleApplyCoupon = async () => {
//     if (!couponCode.trim()) return;

//     setError("");
//     try {
//       const response = await applyCoupon({
//         code: couponCode,
//         subtotal,
//         shipping,
//         userId,
//         appliedCouponCodes: appliedCoupons.map(c => c.code),
//       }).unwrap();
//       const couponData = {
//         ...response.coupon,
//         discount: response.discount,
//       };
//       const newAppliedCoupons = [...appliedCoupons, couponData];
//       setAppliedCoupons(newAppliedCoupons);
//       onCouponChange(newAppliedCoupons);
//       setCouponCode("");
//     } catch (err) {
//       setError(err.data?.message || "Failed to apply coupon");
//     }
//   };

//   const handleSelectCoupon = async (coupon) => {
//     setError("");
//     try {
//       const response = await applyCoupon({
//         code: coupon.code,
//         subtotal,
//         shipping,
//         userId,
//         appliedCouponCodes: appliedCoupons.map(c => c.code),
//       }).unwrap();

//       const couponData = {
//         ...response.coupon,
//         discount: response.discount,
//       };
//       const newAppliedCoupons = [...appliedCoupons, couponData];
//       setAppliedCoupons(newAppliedCoupons);
//       onCouponChange(newAppliedCoupons);
//       setIsOpen(false);
//     } catch (err) {
//       setError(err.data?.message || "Failed to apply coupon");
//     }
//   };

//   const handleRemoveCoupon = (couponCode) => {
//     const newAppliedCoupons = appliedCoupons.filter(c => c.code !== couponCode);
//     setAppliedCoupons(newAppliedCoupons);
//     onCouponChange(newAppliedCoupons);
//     setError("");
//   };

//   const handleCopyCouponCode = (code) => {
//     navigator.clipboard.writeText(code);
//     setCouponCode(code);
//   };

//   return (
//     <Card>
//       <CardHeader className="border-b">
//         <CardTitle>Order Summary</CardTitle>
//       </CardHeader>
//       <CardContent className="p-4">
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">
//               Subtotal ({cart?.items?.length} items)
//             </span>
//             <span>₹{subtotal.toFixed(2)}</span>
//           </div>
//           {savings > 0 && (
//             <div className="flex justify-between items-center text-green-600">
//               <span>You Saved</span>
//               <span>-₹{savings.toFixed(2)}</span>
//             </div>
//           )}
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Shipping</span>
//             <span>₹{shipping.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Tax</span>
//             <span>₹{tax.toFixed(2)}</span>
//           </div>
//           {detailed && (
//             <div className="pt-2">
//               <Collapsible open={isOpen} onOpenChange={setIsOpen}>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <Ticket className="h-4 w-4 text-primary" />
//                     <span className="font-medium">Apply Coupon</span>
//                   </div>
//                   <CollapsibleTrigger asChild>
//                     <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
//                       {isOpen ? (
//                         <ChevronUp className="h-4 w-4" />
//                       ) : (
//                         <ChevronDown className="h-4 w-4" />
//                       )}
//                     </Button>
//                   </CollapsibleTrigger>
//                 </div>
//                 <div className="mt-2 space-y-2">
//                   {appliedCoupons.map(coupon => (
//                     <div key={coupon.code} className="bg-primary/10 p-3 rounded-md flex items-center justify-between">
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <Badge className="bg-primary">
//                             {coupon.code}
//                           </Badge>
//                           <span className="text-sm font-medium">
//                             {coupon.discount}
//                             {coupon.discountType === "referral" && (
//                               <Badge variant="secondary" className="ml-2">
//                                 Referral
//                               </Badge>
//                             )}
//                           </span>
//                         </div>
//                         <p className="text-xs text-gray-500 mt-1">
//                           {coupon.description}
//                         </p>
//                       </div>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="h-8 w-8 p-0 text-gray-500"
//                         onClick={() => handleRemoveCoupon(coupon.code)}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ))}
//                   {!appliedCoupons.length && (
//                     <div className="flex gap-2">
//                       <Input
//                         placeholder="Enter coupon code"
//                         value={couponCode}
//                         onChange={(e) => setCouponCode(e.target.value)}
//                         className="h-9"
//                       />
//                       <Button
//                         onClick={handleApplyCoupon}
//                         disabled={!couponCode.trim()}
//                         className="h-9"
//                       >
//                         Apply
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//                 {error && (
//                   <Alert variant="destructive" className="mt-2 py-2">
//                     <div className="flex items-center space-x-2">
//                       <AlertCircle className="h-4 w-4 flex-shrink-0 mt-[2px]" />
//                       <AlertDescription className="text-xs">
//                         {error}
//                       </AlertDescription>
//                     </div>
//                   </Alert>
//                 )}
//                 <CollapsibleContent className="mt-3 space-y-3">
//                   <p className="text-sm font-medium">Available Coupons</p>
//                   {couponsLoading ? (
//                     <p className="text-sm text-gray-500">Loading coupons...</p>
//                   ) : availableCoupons?.length === 0 ? (
//                     <p className="text-sm text-gray-500">
//                       No coupons available at the moment.
//                     </p>
//                   ) : (
//                     <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
//                       {availableCoupons?.map((coupon) => (
//                         <div
//                           key={coupon.id}
//                           className="border rounded-md p-3 hover:border-primary cursor-pointer"
//                           onClick={() => handleSelectCoupon(coupon)}
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <Badge className="bg-primary">
//                                 {coupon.code}
//                               </Badge>
//                               <span className="text-sm font-medium">
//                                 {coupon.discount}
//                                 {coupon.discountType === "referral" && (
//                                   <Badge variant="secondary" className="ml-2">
//                                     Referral
//                                   </Badge>
//                                 )}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 w-6 p-0"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleCopyCouponCode(coupon.code);
//                                 }}
//                                 title="Copy code"
//                               >
//                                 <Copy className="h-3 w-3" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-6 w-6 p-0 text-primary"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleSelectCoupon(coupon);
//                                 }}
//                                 title="Apply coupon"
//                               >
//                                 <Check className="h-3 w-3" />
//                               </Button>
//                             </div>
//                           </div>
//                           <p className="text-xs text-gray-500 mt-1">
//                             {coupon.description}
//                           </p>
//                           <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
//                             <span>
//                               Min. Purchase: ₹{coupon.minPurchase.toFixed(2)}
//                             </span>
//                             <span>
//                               Valid until:{" "}
//                               {coupon.validUntil
//                                 ? new Date(coupon.validUntil).toLocaleDateString()
//                                 : "No Expiry"}
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CollapsibleContent>
//               </Collapsible>
//             </div>
//           )}
//           {appliedCoupons.length > 0 && (
//             <div className="flex justify-between items-center text-green-600">
//               <span>Discount</span>
//               <span>-₹{totalDiscount.toFixed(2)}</span>
//             </div>
//           )}
//           <Separator />
//           <div className="flex justify-between items-center font-bold">
//             <span>Total</span>
//             <span>₹{(total - totalDiscount).toFixed(2)}</span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default OrderSummaryComponent;






import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  useApplyCouponMutation,
  useGetAvailableCouponsQuery,
} from "@/store/api/userApiSlice";
import { useSelector } from "react-redux";

const OrderSummaryComponent = ({ cart, detailed = false, onCouponChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Single coupon object or null
  const [error, setError] = useState("");

  const userId = useSelector((state) => state.user.user?._id);
  const { subtotal, shipping, tax, total } = cart;

  const { data: availableCoupons, isLoading: couponsLoading } =
    useGetAvailableCouponsQuery(
      { subtotal, userId }, // Removed appliedCouponCodes
      { skip: !subtotal || !userId }
    );

  const [applyCoupon] = useApplyCouponMutation();

  const totalActualPrice =
    cart?.items?.reduce((sum, item) => {
      const actualPrice =
        item.variantId?.actualPrice || item.productId.actualPrice;
      return sum + actualPrice * item.quantity;
    }, 0) || 0;
  const savings = totalActualPrice - subtotal;

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    let discount = 0;
    if (
      appliedCoupon.discountType === "percentage" ||
      appliedCoupon.discountType === "referral"
    ) {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === "fixed") {
      discount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === "shipping" && detailed) {
      discount = shipping;
    }
    return Math.min(discount, subtotal);
  };

  const totalDiscount = calculateDiscount();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setError("");
    try {
      const response = await applyCoupon({
        code: couponCode,
        subtotal,
        shipping,
        userId,
      }).unwrap(); 
      const couponData = {
        ...response.coupon,
        discount: response.discount,
      };
      setAppliedCoupon(couponData); 
      onCouponChange(couponData); 
      setCouponCode("");
    } catch (err) {
      setError(err.data?.message || "Failed to apply coupon");
    }
  };

  const handleSelectCoupon = async (coupon) => {
    setError("");
    try {
      const response = await applyCoupon({
        code: coupon.code,
        subtotal,
        shipping,
        userId,
      }).unwrap();

      const couponData = {
        ...response.coupon,
        discount: response.discount,
      };
      setAppliedCoupon(couponData); 
      onCouponChange(couponData); 
      setIsOpen(false);
    } catch (err) {
      setError(err.data?.message || "Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    onCouponChange(null); 
    setError("");
  };

  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCouponCode(code);
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Subtotal ({cart?.items?.length} items)
            </span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>You Saved</span>
              <span>-₹{savings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Shipping</span>
            <span>₹{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tax</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          {detailed && (
            <div className="pt-2">
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span className="font-medium">Apply Coupon</span>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <div className="mt-2 space-y-2">
                  {appliedCoupon && (
                    <div className="bg-primary/10 p-3 rounded-md flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary">
                            {appliedCoupon.code}
                          </Badge>
                          <span className="text-sm font-medium">
                            {appliedCoupon.discount}
                            {appliedCoupon.discountType === "referral" && (
                              <Badge variant="secondary" className="ml-2">
                                Referral
                              </Badge>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {appliedCoupon.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500"
                        onClick={handleRemoveCoupon}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {!appliedCoupon && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-9"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim()}
                        className="h-9"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
                {error && (
                  <Alert variant="destructive" className="mt-2 py-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-[2px]" />
                      <AlertDescription className="text-xs">
                        {error}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
                <CollapsibleContent className="mt-3 space-y-3">
                  <p className="text-sm font-medium">Available Coupons</p>
                  {couponsLoading ? (
                    <p className="text-sm text-gray-500">Loading coupons...</p>
                  ) : availableCoupons?.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No coupons available at the moment.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {availableCoupons?.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="border rounded-md p-3 hover:border-primary cursor-pointer"
                          onClick={() => handleSelectCoupon(coupon)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary">
                                {coupon.code}
                              </Badge>
                              <span className="text-sm font-medium">
                                {coupon.discount}
                                {coupon.discountType === "referral" && (
                                  <Badge variant="secondary" className="ml-2">
                                    Referral
                                  </Badge>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCouponCode(coupon.code);
                                }}
                                title="Copy code"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCoupon(coupon);
                                }}
                                title="Apply coupon"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {coupon.description}
                          </p>
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <span>
                              Min. Purchase: ₹{coupon.minPurchase.toFixed(2)}
                            </span>
                            <span>
                              Valid until:{" "}
                              {coupon.validUntil
                                ? new Date(coupon.validUntil).toLocaleDateString()
                                : "No Expiry"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
          {appliedCoupon && (
            <div className="flex justify-between items-center text-green-600">
              <span>Discount</span>
              <span>-₹{totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center font-bold">
            <span>Total</span>
            <span>₹{(total - totalDiscount).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummaryComponent;