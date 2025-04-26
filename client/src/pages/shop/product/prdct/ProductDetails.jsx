import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  useAddToCartMutation,
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from "@/store/api/userApiSlice";
import { addToCart } from "@/store/slices/userSlice/cartSlice";
import { toast } from "sonner";

const ProductDetails = ({ product, refetch }) => {
  const dispatch = useDispatch();
  
  const [selectedSize, setSelectedSize] = useState(
    product.variants.length > 0 ? product.variants[0].size : null
  );
  const [quantity, setQuantity] = useState(1);

  const [addToCartApi, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] =
    useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const { data: wishlistData } = useGetWishlistQuery();
  const wishlist = wishlistData?.items || [];

  const selectedSizeObj =
    product.variants.length > 0
      ? product.variants.find((variant) => variant.size === selectedSize)
      : null;

  // Check if the exact product-variant combination is in the wishlist
  const isInWishlist = wishlist.some((item) => {
    const matchesProduct = item.product._id === product._id;
    const matchesVariant = selectedSizeObj
      ? item.variant?._id === selectedSizeObj._id
      : !item.variant; // For non-variant, ensure no variant is set
    return matchesProduct && matchesVariant;
  });

  const actualPrice = selectedSizeObj
    ? selectedSizeObj.actualPrice
    : product.actualPrice;
  const effectivePrice = selectedSizeObj
    ? selectedSizeObj.salePrice || selectedSizeObj.actualPrice
    : product.salePrice || product.actualPrice;
  const stock = selectedSizeObj ? selectedSizeObj.stock : product.stock;
  const hasDiscount = effectivePrice < actualPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((actualPrice - effectivePrice) / actualPrice) * 100)
    : 0;
  const maxQuantity = Math.min(5, stock);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
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

      // Add to cart
      await addToCartApi(payload).unwrap();
      await refetch();
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
          image: product.images[0],
        })
      );

      // Check if product is in wishlist and remove it
      if (isInWishlist) {
        await removeFromWishlist(payload).unwrap();
        toast.success("Item removed from wishlist and added to cart!");
      } else {
        toast.success("Item added to cart successfully!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.data?.message || "Failed to add item to cart");
    }
  };

  const handleAddToWishlist = async () => {
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
      console.error("Wishlist error:", error);
      toast.error(error.data?.message || "Failed to update wishlist");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">
            {product.category.name}
          </span>
          {hasDiscount && (
            <span className="text-xs bg-[#114639] text-white px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[#114639]">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={star <= 4 ? "#114639" : "none"}
                stroke={star <= 4 ? "#114639" : "#71717a"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviews.length} reviews)
          </span>
        </div>
      </div>

      <p className="text-muted-foreground">{product.description}</p>

      <div className="space-y-4">
        {product.variants.length > 0 && (
          <div>
            <h2 className="font-medium mb-2 text-[#114639]">Size</h2>
            <div className="flex gap-4">
              {product.variants.map((variant) => (
                <div key={variant._id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`size-${variant.size}`}
                    name="size"
                    value={variant.size}
                    checked={selectedSize === variant.size}
                    onChange={() => setSelectedSize(variant.size)}
                    className="accent-[#114639]"
                  />
                  <label
                    htmlFor={`size-${variant.size}`}
                    className="cursor-pointer"
                  >{`${variant.size} ${variant.unit}`}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-medium mb-2 text-[#114639]">Price</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#114639]">
              ₹{effectivePrice?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through">
                ₹{actualPrice.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Stock: {stock > 10 ? "In Stock" : "Few items left"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Max: 5 per item</p>
        </div>

        <div>
          <h2 className="font-medium mb-2 text-[#114639]">Quantity</h2>
          <div className="flex items-center">
            <button
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-50"
            >
              -
            </button>
            <span className="w-12 text-center">{quantity}</span>
            <button
              onClick={increaseQuantity}
              disabled={quantity >= maxQuantity}
              className="border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            className="flex-1 bg-[#114639] hover:bg-[#114639]/90 text-white py-2 px-4 rounded-md flex items-center justify-center"
            onClick={handleAddToCart}
            disabled={stock <= 0 || isAddingToCart}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
          <Button
            variant="outline"
            className={`border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-10 h-10 flex items-center justify-center rounded-md ${
              isInWishlist ? "bg-[#114639]/10" : ""
            }`}
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {isAddingToWishlist ? (
              <svg
                className="animate-spin h-5 w-5 text-[#114639]"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isInWishlist ? "#114639" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;