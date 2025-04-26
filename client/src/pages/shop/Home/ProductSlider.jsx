import { useCallback, useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { Link } from 'react-router-dom';
import { 
  useAddToCartMutation, 
  useAddToWishlistMutation, 
  useGetWishlistQuery,
  useRemoveFromWishlistMutation, 
} from "@/store/api/userApiSlice";
import { addToCart } from "@/store/slices/userSlice/cartSlice";
import { toast } from "sonner";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Heart, Eye, ShoppingCart, X } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function ProductSlider({ products, title = "Our Collection" }) {
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 'auto',
    dragFree: true,
    containScroll: 'trimSnaps',
    loop: false,
    
    draggable: true,      
    draggableClass: "",   
    dragThreshold: 10,    
    watchDrag: true,      
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  
  
  const handleWheel = useCallback((event) => {
    if (!emblaApi) return;
    
    event.preventDefault();
    
    if (event.deltaY > 0) {
      emblaApi.scrollNext();
    } else {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);
  
  useEffect(() => {
    const element = document.querySelector('[data-testid="embla-container"]');
    if (!element) return;
    
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);
  
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect(); // Initial check
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);
  
  return (
    <section className="bg-background">
      <div className="container mx-auto">
        {/* Product carousel with gallery feel */}
        <div className="relative">
          {/* Embla carousel container - enhanced for mouse interactions */}
          <div 
            className="overflow-hidden cursor-grab active:cursor-grabbing" 
            ref={emblaRef}
            data-testid="embla-container"
          >
            {/* This is the scrollable container */}
            <div className="flex select-none">
              {products?.map((product) => (
                <PremiumProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Round arrow navigation */}
          <button
            onClick={scrollPrev}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-border bg-background shadow-sm focus:outline-none transition-all duration-200 z-10",
              canScrollPrev 
                ? "opacity-100 hover:border-primary hover:text-primary" 
                : "opacity-50 cursor-not-allowed"
            )}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={scrollNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-border bg-background shadow-sm focus:outline-none transition-all duration-200 z-10",
              canScrollNext 
                ? "opacity-100 hover:border-primary hover:text-primary" 
                : "opacity-50 cursor-not-allowed"
            )}
            disabled={!canScrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          {/* Enhanced scroll indicator with mouse instruction */}
          <div className="text-xs text-center text-muted-foreground mt-4 flex flex-col items-center justify-center gap-1">
            <div className="flex gap-1 mt-2">
              {Array.from({ length: Math.ceil(products?.length / 4) || 0 }).map((_, index) => (
                <div 
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    activeIndex === index ? "bg-primary" : "bg-border"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [variantSelectorVisible, setVariantSelectorVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.length > 0 ? product.variants[0] : null
  );
  const [actionType, setActionType] = useState(null);
  const dispatch = useDispatch();

  // API hooks
  const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  const { data: wishlistData } = useGetWishlistQuery();

  const wishlist = wishlistData?.items || [];
  const isInWishlist = wishlist.some(
    (item) => item.product._id === product._id
  );

  // Calculate price display info
  const salePrice = product.variants.length > 0 ? Number.parseFloat(product.variants[0].salePrice).toFixed(2) : Number.parseFloat(product.salePrice).toFixed(2);
  const actualPrice = product.variants.length > 0 ? Number.parseFloat(product.variants[0].actualPrice).toFixed(2) : Number.parseFloat(product.actualPrice).toFixed(2);

  const handleAddToCart = () => {
    if (product?.variants?.length > 0) {
      setActionType('cart');
      setVariantSelectorVisible(true);
    } else {
      addToCartWithVariant(null);
    }
  };

  const addToCartWithVariant = async (variant) => {
    try {
      const variantId = variant ? variant._id : (product?.variants?.length > 0 ? product.variants[0]._id : null);
      const payload = variantId
        ? { productId: product._id, variantId: variantId, quantity: 1 }
        : { productId: product._id, quantity: 1 };

      // Add to cart
      await addToCartApi(payload).unwrap();
      
      // Get variant details for cart display
      const selectedSize = variant ? `${variant.size}${variant.unit}` : '';
      const selectedPrice = variant ? variant.salePrice : product.salePrice;
      
      dispatch(
        addToCart({
          productId: product._id,
          variantId: variantId,
          quantity: 1,
          price: selectedPrice,
          name: product.name + (selectedSize ? ` - ${selectedSize}` : ''),
          image: product.images[0],
        })
      );
      
      // Check if product is in wishlist and remove it
      if (isInWishlist) {
        await removeFromWishlist({ productId: product._id, variantId }).unwrap();
        toast.success("Item removed from wishlist and added to cart!");
      } else {
        toast.success("Item added to cart successfully!");
      }
      
      setVariantSelectorVisible(false);
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.data?.message || "Failed to add item to cart");
    }
  };

  const handleWishlistToggle = () => {
    if (product?.variants?.length > 0) {
      setActionType('wishlist');
      setVariantSelectorVisible(true);
    } else {
      toggleWishlistWithVariant(null);
    }
  };

  const toggleWishlistWithVariant = async (variant) => {
    try {
      const variantId = variant ? variant._id : null;
      const productId = product._id;
      if (isInWishlist) {
        await removeFromWishlist({ productId, variantId }).unwrap();
        toast.success('Item removed from wishlist');
      } else {
        const payload = { 
          productId: product._id,
          ...(variantId && { variantId })
        };
        await addToWishlist(payload).unwrap();
        toast.success("Item added to wishlist successfully!");
      }
      setVariantSelectorVisible(false);
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      toast.error(error.data?.message || "Failed to update wishlist");
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (actionType === 'cart') {
      addToCartWithVariant(variant);
    } else if (actionType === 'wishlist') {
      toggleWishlistWithVariant(variant);
    }
  };

  const hasVariants = product?.variants?.length > 0;
  const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

  useEffect(() => {
    if (!hovered) {
      setVariantSelectorVisible(false);
    }
  }, [hovered]);

  return (
    <div className="px-4 min-w-[280px] w-full md:w-1/3 lg:w-1/4 shrink-0">
      <div 
        className="group relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Product image with hover actions */}
        <div className="relative mb-4 overflow-hidden bg-muted/5 rounded-lg">
          <AspectRatio ratio={7/11}>
            <div className="absolute inset-0 transition-transform duration-1000 ease-out" 
                 style={{ transform: hovered ? 'scale(1.30)' : 'scale(1)' }}>
              <img
                src={product.images[0] || product.images[1]}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
          </AspectRatio>
          
          {/* Action buttons that slide in on hover */}
          <div className={cn(
            "absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4 transition-all duration-500",
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          )}>
            {/* Wishlist button */}
            <button 
              className={cn(
                "w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-md transition-colors duration-200",
                isInWishlist ? "bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {isWishlistLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <Heart className="h-4 w-4" fill={isInWishlist ? "currentColor" : "none"} />
              )}
            </button>
            
            {/* Quick view button */}
            <Link to={`/shop/product/${product._id}`} className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
              <Eye className="h-4 w-4" />
            </Link>
            
            {/* Add to cart button */}
            <button 
              className="w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              title="Add to Cart"
            >
              {isAddingToCart ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Variant selector modal/popup */}
          {variantSelectorVisible && hasVariants && (
            <div className="absolute inset-0 bg-background/95 flex flex-col z-20 p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium">Select Size</h4>
                <button 
                  onClick={() => setVariantSelectorVisible(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2 overflow-auto flex-grow">
                {product.variants.map(variant => (
                  <button
                    key={variant._id}
                    className={cn(
                      "px-4 py-3 text-sm rounded-md transition-colors duration-200 flex justify-between items-center",
                      selectedVariant?._id === variant._id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted border border-border"
                    )}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <span>{variant?.size}{variant?.unit}</span>
                    <span>₹{variant?.salePrice?.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              
              <div className="pt-4">
                <p className="text-xs text-center text-muted-foreground">
                  {actionType === 'cart' ? 'Select a size to add to cart' : 'Select a size to add to wishlist'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Product info */}
        <Link to={`/shop/product/${product._id}`}>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.category.name}
            </p>
            <h3 className="font-medium group-hover:underline decoration-primary decoration-1 underline-offset-4 transition-all duration-200">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-medium">₹{salePrice}</span>
              {salePrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{actualPrice}
                </span>
              )}
              {hasVariants && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {product.variants.length} sizes
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}