import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '@/store/api/userApiSlice';
import { Eye, Heart } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { useDrag } from 'react-dnd';
import QuickView from '@/components/quickView/QuickView'

const ProductCard = ({ product, id }) => {
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] = useRemoveFromWishlistMutation();
  const { data: wishlistData } = useGetWishlistQuery();

  const [hovered, setHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false); 
  const navigate = useNavigate();
  const wishlist = wishlistData?.items || [];
  const isInWishlist = wishlist.some((item) => item.product._id === product._id);

  const firstVariant = product.variants.length > 0 ? product.variants.reduce((acc,curr)=> acc.salePrice > curr.salePrice ? acc : curr, 0) : null;

  const displayPrice = firstVariant
    ? firstVariant.salePrice ?? firstVariant.actualPrice
    : product.salePrice ?? product.actualPrice;

  const originalPrice = firstVariant
    ? firstVariant.actualPrice
    : product.actualPrice;

  // Calculate discount
  const hasDiscount = firstVariant
    ? firstVariant.salePrice && firstVariant.salePrice < firstVariant.actualPrice
    : product.salePrice && product.salePrice < product.actualPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlist({
          productId: product._id,
          variantId: firstVariant?._id || null,
        }).unwrap();
        toast.success('Item removed from wishlist');
      } else {
        // Add to wishlist
        const payload = {
          productId: product._id,
          ...(firstVariant && { variantId: firstVariant._id }),
        };
        await addToWishlist(payload).unwrap();
        toast.success('Item added to wishlist successfully!');
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error(error.data?.message || 'Failed to update wishlist');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/shop/product/${id}`);
  };

  const handleQuickViewOpen = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsQuickViewOpen(true); 
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PRODUCT',
    item: { 
      productId: product._id,
      variantId: product.variants.length > 0 ? product.variants[0]._id : null,
      quantity: 1,
      price:displayPrice

    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <>
    <div 
        ref={drag}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      >
      <Card
        className ="group overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => scrollToTop(id)}
        // onClick={()=>navigate(`/shop/product/${id}`)}
      >
          <div className="relative aspect-square">
            {discountPercentage > 0 && (
              <Badge className="absolute top-2 left-2 bg-[#438E44] text-white text-sm z-10 rounded-full w-9 h-9 flex items-center justify-center">
                {discountPercentage}%
              </Badge>
            )}
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
              <Badge
                className="bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={handleQuickViewOpen} // Handle QuickView click
              >
                <Eye className="h-4 w-4 mr-1" />
                Quick View
              </Badge>
            </div>
          </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category.name}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#114639]">
              ₹{displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {/* Wishlist Button */}
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
            } ${hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from triggering scrollToTop
              handleWishlistToggle();
            }}
            disabled={isAddingToWishlist || isRemovingFromWishlist}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isAddingToWishlist || isRemovingFromWishlist ? (
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Heart className="h-4 w-4" fill={isInWishlist ? 'currentColor' : 'none'} />
            )}
          </button>
        </CardFooter>
      </Card>
      </div>
      {/* Render QuickView Component */}
      <QuickView
        product={product}
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
      />
    </>
  );
};

export default ProductCard;