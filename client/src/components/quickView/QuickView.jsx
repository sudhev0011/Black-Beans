import { useState, useRef, useEffect, useCallback } from "react"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle,DialogDescription } from "@/components/ui/dialog"
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/store/api/userApiSlice"
import { addToCart } from "@/store/slices/userSlice/cartSlice"
import { toast } from "sonner"
import { ShoppingCart, Heart, Plus, Minus, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"

// Component for image gallery
const ImageGallery = ({
  images = [],
  currentIndex,
  setCurrentIndex,
  isZoomed,
  setIsZoomed,
  zoomPosition,
  handleMouseMove,
  hasDiscount,
  discountPercentage,
  isMobile,
}) => {
  const imageContainerRef = useRef(null)

  const handleImageChange = useCallback(
    (direction) => {
      if (!images || images.length <= 1) return

      if (direction === "next") {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      } else {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      }
      setIsZoomed(false)
    },
    [images, setCurrentIndex, setIsZoomed],
  )

  const handleThumbnailClick = useCallback(
    (index) => {
      setCurrentIndex(index)
      setIsZoomed(false)
    },
    [setCurrentIndex, setIsZoomed],
  )

  const handleZoomToggle = useCallback(
    (e) => {
      if (e) e.stopPropagation()
      if (isMobile) return
      setIsZoomed(!isZoomed)
    },
    [isMobile, isZoomed, setIsZoomed],
  )

  return (
    <div className="relative bg-gray-50 w-full h-[280px] sm:h-[320px] md:w-1/2 md:h-[500px] lg:h-[600px] flex-shrink-0">
      <div
        ref={imageContainerRef}
        className={cn(
          "relative w-full h-full overflow-hidden",
          !isMobile && (isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"),
        )}
        onClick={handleZoomToggle}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isZoomed && setIsZoomed(false)}
      >
        {images && images.length > 0 && (
          <div className="w-full h-full">
            <div
              className={cn("w-full h-full transition-all duration-200", isZoomed ? "absolute scale-150" : "")}
              style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
            >
              <img
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`Product image ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-sm rounded-full z-20">
            {discountPercentage}% OFF
          </span>
        )}

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-4 right-4 bg-white/80 hover:bg-white rounded-full shadow-md z-20"
            onClick={handleZoomToggle}
          >
            {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </Button>
        )}
      </div>

      {/* Image Navigation Controls */}
      {images && images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleImageChange("prev")
            }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full z-20"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleImageChange("next")
            }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full z-20"
          >
            <ChevronRight size={16} />
          </Button>

          {/* Image Thumbnails */}
          <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 z-20">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  handleThumbnailClick(index)
                }}
                className={cn(
                  "w-8 md:w-12 h-8 md:h-12 rounded-md overflow-hidden border-2 transition-all",
                  currentIndex === index
                    ? "border-primary scale-110"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Component for product details section
const ProductDetails = ({
  product,
  selectedSize,
  setSelectedSize,
  quantity,
  handleQuantityChange,
  maxQuantity,
  effectivePrice,
  actualPrice,
  hasDiscount,
  stock,
  handleAddToCart,
  handleWishlist,
  isInWishlist,
  isMobile,
}) => (
  <div
    className={`${isMobile ? "p-4" : "p-6 lg:p-8"} space-y-4 md:space-y-6 flex flex-col ${
      isMobile ? "flex-grow overflow-y-auto max-h-[60vh]" : "w-1/2 h-[500px] lg:h-[600px] overflow-y-auto"
    }`}
  >
    <div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs md:text-sm text-primary font-medium uppercase tracking-wider">
            {product.category?.name || "Product"}
          </p>
          <h2 className={`${isMobile ? "text-xl" : "text-2xl md:text-3xl"} font-bold text-primary mt-1`}>
            {product.name}
          </h2>
        </div>
      </div>
    </div>

    <div className="space-y-1 md:space-y-2">
      <div className="flex items-center gap-2 md:gap-3">
        <span className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-primary`}>
          ₹{effectivePrice?.toFixed(2)}
        </span>
        {hasDiscount && (
          <span className={`${isMobile ? "text-base" : "text-lg"} text-muted-foreground line-through`}>
            ₹{actualPrice.toFixed(2)}
          </span>
        )}
      </div>
      <p className={`${isMobile ? "text-xs" : "text-sm"}`}>
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
      <div className="py-1 md:py-2">
        <h3 className="font-medium text-primary mb-1 md:mb-2">Description</h3>
        <p className="text-gray-600 text-xs md:text-sm">{product.description}</p>
      </div>
    )}

    {product.variants && product.variants.length > 0 && (
      <div className="space-y-2 md:space-y-3">
        <h3 className="font-medium text-primary">Size</h3>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {product.variants.map((variant) => (
            <button
              key={variant._id}
              className={cn(
                `px-3 py-1 md:px-4 md:py-2 rounded-md border-2 transition-all ${isMobile ? "text-xs" : "text-base"}`,
                selectedSize === variant.size
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-gray-200 hover:border-gray-300",
              )}
              onClick={() => setSelectedSize(variant.size)}
              disabled={variant.stock <= 0}
            >
              <span>{`${variant.size} ${variant.unit}`}</span>
              {variant.stock <= 0 && <span className="block text-xs text-red-500 mt-0.5 md:mt-1">Out of stock</span>}
            </button>
          ))}
        </div>
      </div>
    )}

    <div className={`space-y-2 md:space-y-3 ${isMobile ? "pt-2" : "mt-auto pt-4"}`}>
      <h3 className="font-medium text-primary">Quantity</h3>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center border-2 border-gray-200 rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange("decrease")}
            disabled={quantity <= 1}
            className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} hover:bg-gray-100 rounded-none`}
          >
            <Minus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          </Button>
          <span className={`${isMobile ? "w-8 text-xs" : "w-12 text-base"} text-center font-medium`}>{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange("increase")}
            disabled={quantity >= maxQuantity}
            className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} hover:bg-gray-100 rounded-none`}
          >
            <Plus className={`${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
          </Button>
        </div>
        <p className="text-xs text-gray-500">Maximum: {maxQuantity}</p>
      </div>

      <div className={`flex gap-2 md:gap-4 ${isMobile ? "pt-2" : "pt-4"}`}>
        <Button
          className={`flex-1 bg-primary hover:bg-primary/90 ${isMobile ? "py-4 text-xs" : "py-6 text-base"}`}
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
            `rounded-full border-primary ${isMobile ? "h-10 w-10" : "h-12 w-12"}`,
            isInWishlist ? "bg-primary/10" : "",
          )}
        >
          <Heart className={cn("h-4 w-4", isInWishlist ? "fill-primary text-primary" : "text-primary")} />
        </Button>
      </div>
    </div>
  </div>
)

const QuickView = ({ product, open, onOpenChange }) => {
  const dispatch = useDispatch()
  const [selectedSize, setSelectedSize] = useState(product?.variants?.length > 0 ? product.variants[0].size : null)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const contentRef = useRef(null)

  // API hooks
  const [addToCartApi] = useAddToCartMutation()
  const [addToWishlist] = useAddToWishlistMutation()
  const [removeFromWishlist] = useRemoveFromWishlistMutation()
  const { data: wishlistData } = useGetWishlistQuery()

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Reset scroll position when dialog opens
  useEffect(() => {
    if (open && contentRef.current) {
      setTimeout(() => {
        contentRef.current.scrollTop = 0
      }, 0)
    }
  }, [open])

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product?.variants?.length > 0 ? product.variants[0].size : null)
      setQuantity(1)
      setCurrentImageIndex(0)
      setIsZoomed(false)
    }
  }, [product])

  if (!product) return null

  const wishlist = wishlistData?.items || []
  const selectedSizeObj =
    product?.variants?.length > 0 ? product.variants.find((variant) => variant.size === selectedSize) : null

  const isInWishlist = wishlist.some((item) => {
    const matchesProduct = item.product._id === product._id
    const matchesVariant = selectedSizeObj ? item.variant?._id === selectedSizeObj._id : !item.variant
    return matchesProduct && matchesVariant
  })

  const actualPrice = selectedSizeObj ? selectedSizeObj.actualPrice : product?.actualPrice
  const effectivePrice = selectedSizeObj
    ? selectedSizeObj.salePrice || selectedSizeObj.actualPrice
    : product?.salePrice || product?.actualPrice
  const stock = selectedSizeObj ? selectedSizeObj.stock : product?.stock
  const hasDiscount = effectivePrice < actualPrice
  const discountPercentage = hasDiscount ? Math.round(((actualPrice - effectivePrice) / actualPrice) * 100) : 0
  const maxQuantity = Math.min(5, stock)

  const handleQuantityChange = (action) => {
    if (action === "decrease" && quantity > 1) {
      setQuantity(quantity - 1)
    } else if (action === "increase" && quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const handleMouseMove = (e) => {
    if (!isZoomed || !e.currentTarget || isMobile) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  const handleAddToCart = async () => {
    if (quantity > 5) {
      toast.info("Maximum quantity is 5")
      return
    }

    try {
      const payload = selectedSizeObj
        ? { productId: product._id, variantId: selectedSizeObj._id, quantity }
        : { productId: product._id, quantity }

      await addToCartApi(payload).unwrap()
      dispatch(
        addToCart({
          productId: product._id,
          variantId: selectedSizeObj?._id,
          quantity,
          price: effectivePrice,
          name: selectedSizeObj ? `${product.name} (${selectedSizeObj.size}${selectedSizeObj.unit})` : product.name,
          size: selectedSizeObj?.size,
          unit: selectedSizeObj?.unit,
          image: product.images[currentImageIndex],
        }),
      )

      if (isInWishlist) {
        await removeFromWishlist(payload).unwrap()
        toast.success("Item removed from wishlist and added to cart!")
      } else {
        toast.success("Item added to cart successfully!")
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(error.data?.message || "Failed to add item to cart")
    }
  }

  const handleWishlist = async () => {
    try {
      const payload = selectedSizeObj
        ? { productId: product._id, variantId: selectedSizeObj._id }
        : { productId: product._id }

      if (isInWishlist) {
        await removeFromWishlist(payload).unwrap()
        toast.success("Item removed from wishlist successfully!")
      } else {
        await addToWishlist(payload).unwrap()
        toast.success("Item added to wishlist successfully!")
      }
    } catch (error) {
      toast.error(error.data?.message || "Failed to update wishlist")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) setIsZoomed(false)
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] md:max-h-[90vh] p-0 overflow-hidden bg-white rounded-lg">
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

        {/* Responsive layout */}
        <div
          className={`${
            isMobile ? "flex flex-col h-[90vh] overflow-hidden" : "flex flex-row"
          } h-full`}
          ref={contentRef}
        >
          <ImageGallery
            images={product.images}
            currentIndex={currentImageIndex}
            setCurrentIndex={setCurrentImageIndex}
            isZoomed={isZoomed}
            setIsZoomed={setIsZoomed}
            zoomPosition={zoomPosition}
            handleMouseMove={handleMouseMove}
            hasDiscount={hasDiscount}
            discountPercentage={discountPercentage}
            isMobile={isMobile}
          />

          <ProductDetails
            product={product}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            quantity={quantity}
            handleQuantityChange={handleQuantityChange}
            maxQuantity={maxQuantity}
            effectivePrice={effectivePrice}
            actualPrice={actualPrice}
            hasDiscount={hasDiscount}
            stock={stock}
            handleAddToCart={handleAddToCart}
            handleWishlist={handleWishlist}
            isInWishlist={isInWishlist}
            isMobile={isMobile}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuickView