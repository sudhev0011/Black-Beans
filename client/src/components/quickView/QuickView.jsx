// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import {
//   useAddToCartMutation,
//   useAddToWishlistMutation,
//   useGetWishlistQuery,
//   useRemoveFromWishlistMutation,
// } from "@/store/api/userApiSlice";
// import { addToCart } from "@/store/slices/userSlice/cartSlice";
// import { toast } from "sonner";
// import { Star, ShoppingCart, Heart, Plus, Minus } from "lucide-react";
// import { AspectRatio } from "@/components/ui/aspect-ratio";
// import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
// import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
// const QuickView = ({ product, open, onOpenChange }) => {
//   const dispatch = useDispatch();
//   const [selectedSize, setSelectedSize] = useState(
//     product?.variants?.length > 0 ? product.variants[0].size : null
//   );
//   const [quantity, setQuantity] = useState(1);

//   const [addToCartApi] = useAddToCartMutation();
//   const [addToWishlist] = useAddToWishlistMutation();
//   const [removeFromWishlist] = useRemoveFromWishlistMutation();
//   const { data: wishlistData } = useGetWishlistQuery();

//   const wishlist = wishlistData?.items || [];
//   const selectedSizeObj =
//     product?.variants?.length > 0
//       ? product.variants.find((variant) => variant.size === selectedSize)
//       : null;

//   const isInWishlist = wishlist.some((item) => {
//     const matchesProduct = item.product._id === product._id;
//     const matchesVariant = selectedSizeObj
//       ? item.variant?._id === selectedSizeObj._id
//       : !item.variant;
//     return matchesProduct && matchesVariant;
//   });

//   const actualPrice = selectedSizeObj
//     ? selectedSizeObj.actualPrice
//     : product?.actualPrice;
//   const effectivePrice = selectedSizeObj
//     ? selectedSizeObj.salePrice || selectedSizeObj.actualPrice
//     : product?.salePrice || product?.actualPrice;
//   const stock = selectedSizeObj ? selectedSizeObj.stock : product?.stock;
//   const hasDiscount = effectivePrice < actualPrice;
//   const discountPercentage = hasDiscount
//     ? Math.round(((actualPrice - effectivePrice) / actualPrice) * 100)
//     : 0;
//   const maxQuantity = Math.min(5, stock);

//   const handleQuantityChange = (action) => {
//     if (action === "decrease" && quantity > 1) {
//       setQuantity(quantity - 1);
//     } else if (action === "increase" && quantity < maxQuantity) {
//       setQuantity(quantity + 1);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (quantity > 5) {
//       toast.info("Maximum quantity is 5");
//       return;
//     }

//     try {
//       const payload = selectedSizeObj
//         ? { productId: product._id, variantId: selectedSizeObj._id, quantity }
//         : { productId: product._id, quantity };

//       await addToCartApi(payload).unwrap();
//       dispatch(
//         addToCart({
//           productId: product._id,
//           variantId: selectedSizeObj?._id,
//           quantity,
//           price: effectivePrice,
//           name: selectedSizeObj
//             ? `${product.name} (${selectedSizeObj.size}${selectedSizeObj.unit})`
//             : product.name,
//           size: selectedSizeObj?.size,
//           unit: selectedSizeObj?.unit,
//           image: product.images[0],
//         })
//       );

//       if (isInWishlist) {
//         await removeFromWishlist(payload).unwrap();
//         toast.success("Item removed from wishlist and added to cart!");
//       } else {
//         toast.success("Item added to cart successfully!");
//       }

//       onOpenChange(false);
//     } catch (error) {
//       toast.error(error.data?.message || "Failed to add item to cart");
//     }
//   };

//   const handleWishlist = async () => {
//     try {
//       const payload = selectedSizeObj
//         ? { productId: product._id, variantId: selectedSizeObj._id }
//         : { productId: product._id };

//       if (isInWishlist) {
//         await removeFromWishlist(payload).unwrap();
//         toast.success("Item removed from wishlist successfully!");
//       } else {
//         await addToWishlist(payload).unwrap();
//         toast.success("Item added to wishlist successfully!");
//       }
//     } catch (error) {
//       toast.error(error.data?.message || "Failed to update wishlist");
//     }
//   };

//   if (!product) return null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
//         <VisuallyHidden>
//         <DialogTitle></DialogTitle>
//         <DialogDescription></DialogDescription>
//         </VisuallyHidden>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Product Image */}
//           <div className="relative h-[300px] md:h-[500px]">
//             <img
//               src={product.images[0]}
//               alt={product.name}
//               className="w-full h-full object-cover"
//             />
//             {hasDiscount && (
//               <span className="absolute top-4 left-4 bg-[#114639] text-white px-3 py-1 rounded-full text-sm">
//                 {discountPercentage}% OFF
//               </span>
//             )}
//           </div>

//           {/* Product Details */}
//           <div className="p-6 space-y-4">
//             <div>
//               <p className="text-sm text-muted-foreground">
//                 {product.category.name}
//               </p>
//               <h2 className="text-2xl font-bold text-[#114639] mt-1">
//                 {product.name}
//               </h2>

//               <div className="flex items-center gap-2 mt-2">
//                 <div className="flex">
//                   {[...Array(5)].map((_, index) => (
//                     <Star
//                       key={index}
//                       size={16}
//                       className={
//                         index < 4
//                           ? "fill-[#114639] text-[#114639]"
//                           : "text-gray-300"
//                       }
//                     />
//                   ))}
//                 </div>
//                 <span className="text-sm text-muted-foreground">
//                   ({product?.reviews?.length} reviews)
//                 </span>
//               </div>
//             </div>

//             {product.variants.length > 0 && (
//               <div className="space-y-2">
//                 <h3 className="font-medium text-[#114639]">Size</h3>
//                 <div className="flex gap-4">
//                   {product.variants.map((variant) => (
//                     <label
//                       key={variant._id}
//                       className={`cursor-pointer flex items-center gap-2 px-3 py-1 rounded-md border ${
//                         selectedSize === variant.size
//                           ? "border-[#114639] bg-[#114639]/10"
//                           : "border-gray-200"
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         name="size"
//                         value={variant.size}
//                         checked={selectedSize === variant.size}
//                         onChange={() => setSelectedSize(variant.size)}
//                         className="hidden"
//                       />
//                       <span>{`${variant.size} ${variant.unit}`}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="space-y-2">
//               <h3 className="font-medium text-[#114639]">Price</h3>
//               <div className="flex items-center gap-2">
//                 <span className="text-2xl font-bold text-[#114639]">
//                   ₹{effectivePrice?.toFixed(2)}
//                 </span>
//                 {hasDiscount && (
//                   <span className="text-muted-foreground line-through">
//                     ₹{actualPrice.toFixed(2)}
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-muted-foreground">
//                 Stock: {stock > 10 ? "In Stock" : "Few items left"}
//               </p>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="flex items-center border rounded-md">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => handleQuantityChange("decrease")}
//                   disabled={quantity <= 1}
//                   className="h-10 w-10 hover:bg-transparent"
//                 >
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <span className="w-12 text-center">{quantity}</span>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => handleQuantityChange("increase")}
//                   disabled={quantity >= maxQuantity}
//                   className="h-10 w-10 hover:bg-transparent"
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>

//             <div className="flex gap-4 pt-2">
//               <Button
//                 className="flex-1 bg-[#114639] hover:bg-[#114639]/90"
//                 onClick={handleAddToCart}
//                 disabled={stock <= 0}
//               >
//                 <ShoppingCart className="mr-2 h-4 w-4" />
//                 Add to Cart
//               </Button>
//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={handleWishlist}
//                 className={`border-[#114639] ${
//                   isInWishlist ? "bg-[#114639]/10" : ""
//                 }`}
//               >
//                 <Heart
//                   className={`h-4 w-4 ${isInWishlist ? "fill-[#114639]" : ""}`}
//                 />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default QuickView;








import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/store/api/userApiSlice";
import { addToCart } from "@/store/slices/userSlice/cartSlice";
import { toast } from "sonner";
import { Star, ShoppingCart, Heart, Plus, Minus, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const QuickView = ({ product, open, onOpenChange }) => {
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState(
    product?.variants?.length > 0 ? product.variants[0].size : null
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [addToCartApi] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const { data: wishlistData } = useGetWishlistQuery();

  const wishlist = wishlistData?.items || [];
  const selectedSizeObj =
    product?.variants?.length > 0
      ? product.variants.find((variant) => variant.size === selectedSize)
      : null;

  const isInWishlist = wishlist.some((item) => {
    const matchesProduct = item.product._id === product._id;
    const matchesVariant = selectedSizeObj
      ? item.variant?._id === selectedSizeObj._id
      : !item.variant;
    return matchesProduct && matchesVariant;
  });

  const actualPrice = selectedSizeObj
    ? selectedSizeObj.actualPrice
    : product?.actualPrice;
  const effectivePrice = selectedSizeObj
    ? selectedSizeObj.salePrice || selectedSizeObj.actualPrice
    : product?.salePrice || product?.actualPrice;
  const stock = selectedSizeObj ? selectedSizeObj.stock : product?.stock;
  const hasDiscount = effectivePrice < actualPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((actualPrice - effectivePrice) / actualPrice) * 100)
    : 0;
  const maxQuantity = Math.min(5, stock);

  const handleQuantityChange = (action) => {
    if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (action === "increase" && quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (quantity > 5) {
      toast.info("Maximum quantity is 5");
      return;
    }

    try {
      const payload = selectedSizeObj
        ? { productId: product._id, variantId: selectedSizeObj._id, quantity }
        : { productId: product._id, quantity };

      await addToCartApi(payload).unwrap();
      dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedSizeObj?._id,
          quantity,
          price: effectivePrice,
          name: selectedSizeObj
            ? `${product.name} (${selectedSizeObj.size}${selectedSizeObj.unit})`
            : product.name,
          size: selectedSizeObj?.size,
          unit: selectedSizeObj?.unit,
          image: product.images[currentImageIndex],
        })
      );

      if (isInWishlist) {
        await removeFromWishlist(payload).unwrap();
        toast.success("Item removed from wishlist and added to cart!");
      } else {
        toast.success("Item added to cart successfully!");
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || "Failed to add item to cart");
    }
  };

  const handleWishlist = async () => {
    try {
      const payload = selectedSizeObj
        ? { productId: product._id, variantId: selectedSizeObj._id }
        : { productId: product._id };

      if (isInWishlist) {
        await removeFromWishlist(payload).unwrap();
        toast.success("Item removed from wishlist successfully!");
      } else {
        await addToWishlist(payload).unwrap();
        toast.success("Item added to wishlist successfully!");
      }
    } catch (error) {
      toast.error(error.data?.message || "Failed to update wishlist");
    }
  };

  const handleZoomToggle = () => {
    if (isMobile) return; // Disable zoom on mobile
    setIsZoomed(!isZoomed);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed || !imageContainerRef.current || isMobile) return;
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handleImageChange = (direction) => {
    if (!product.images || product.images.length <= 1) return;
    
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    setIsZoomed(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) setIsZoomed(false);
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full md:h-auto md:max-w-[90vw] lg:max-w-4xl p-0 overflow-hidden bg-white rounded-lg">
        <VisuallyHidden>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </VisuallyHidden>
        
        <div className="absolute top-2 right-2 z-50">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-white/80 hover:bg-white shadow-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row h-full">
          {/* Product Image with Zoom */}
          <div className="relative bg-gray-50 w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
            <div 
              ref={imageContainerRef}
              className={cn(
                "relative w-full h-full overflow-hidden",
                !isMobile && (isZoomed ? "cursor-zoom-out" : "cursor-zoom-in")
              )}
              onClick={handleZoomToggle}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isZoomed && setIsZoomed(false)}
            >
              {product.images && product.images.length > 0 && (
                <div className="w-full h-full">
                  <div 
                    className={cn(
                      "w-full h-full transition-all duration-200",
                      isZoomed && !isMobile ? "absolute scale-150" : ""
                    )}
                    style={
                      isZoomed && !isMobile
                        ? { 
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }
                        : {}
                    }
                  >
                    <img
                      src={product.images[currentImageIndex]}
                      alt={`${product.name} image ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {hasDiscount && (
                <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-[#114639] text-white px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-full z-20">
                  {discountPercentage}% OFF
                </span>
              )}
              
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/80 hover:bg-white rounded-full shadow-md z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomToggle();
                  }}
                >
                  {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                </Button>
              )}
            </div>

            {/* Image Navigation Controls */}
            {product.images && product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange("prev");
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full z-20"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageChange("next");
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full z-20"
                >
                  <ChevronRight size={16} />
                </Button>

                {/* Image Thumbnails */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 z-20">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThumbnailClick(index);
                      }}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md overflow-hidden border-2 transition-all",
                        currentImageIndex === index 
                          ? "border-[#114639] scale-110" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-6 lg:p-8 space-y-4 sm:space-y-6 flex flex-col h-auto md:h-[500px] lg:h-[600px] overflow-y-auto">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs sm:text-sm text-[#114639] font-medium uppercase tracking-wider">
                    {product.category.name}
                  </p>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#114639] mt-1">
                    {product.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 sm:mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className={
                        index < Math.round(product.rating || 4)
                          ? "fill-[#114639] text-[#114639]"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  ({product?.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#114639]">
                  ₹{effectivePrice?.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    ₹{actualPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm">
                {stock > 10 ? (
                  <span className="text-green-600 font-medium">In Stock</span>
                ) : stock > 0 ? (
                  <span className="text-amber-600 font-medium">Only {stock} left</span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </p>
            </div>

            {product.description && (
              <div className="py-1 sm:py-2">
                <h3 className="font-medium text-[#114639] mb-1 sm:mb-2">Description</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{product.description}</p>
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-[#114639]">Size</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      className={cn(
                        "px-3 py-1 sm:px-4 sm:py-2 rounded-md border-2 transition-all text-xs sm:text-base",
                        selectedSize === variant.size
                          ? "border-[#114639] bg-[#114639]/10 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setSelectedSize(variant.size)}
                      disabled={variant.stock <= 0}
                    >
                      <span>{`${variant.size} ${variant.unit}`}</span>
                      {variant.stock <= 0 && (
                        <span className="block text-xs text-red-500 mt-0.5 sm:mt-1">Out of stock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 sm:space-y-3 mt-auto pt-2 sm:pt-4">
              <h3 className="font-medium text-[#114639]">Quantity</h3>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={quantity <= 1}
                    className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-none"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="w-8 sm:w-12 text-center font-medium text-xs sm:text-base">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("increase")}
                    disabled={quantity >= maxQuantity}
                    className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-none"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Maximum: {maxQuantity}</p>
              </div>

              <div className="flex gap-2 sm:gap-4 pt-2 sm:pt-4">
                <Button
                  className="flex-1 bg-[#114639] hover:bg-[#114639]/90 py-4 sm:py-6 text-xs sm:text-base"
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlist}
                  className={cn(
                    "rounded-full border-[#114639] h-10 w-10 sm:h-12 sm:w-12",
                    isInWishlist ? "bg-[#114639]/10" : ""
                  )}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isInWishlist ? "fill-[#114639] text-[#114639]" : "text-[#114639]"
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;