import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { useGetWishlistQuery, useRemoveFromWishlistMutation, useAddToCartMutation } from "@/store/api/userApiSlice";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const WishlistComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const { data: wishlistData, isLoading, refetch } = useGetWishlistQuery();
  useEffect(()=>{
    refetch();
  },[refetch])
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [addToCart] = useAddToCartMutation();

  const wishlist = wishlistData?.items || [];

  const handleRemoveFromWishlist = async (item) => {
    try {
      const payload = item.variant
        ? { productId: item.product._id, variantId: item.variant._id }
        : { productId: item.product._id };

      await removeFromWishlist(payload).unwrap();
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const payload = item.variant
        ? { productId: item.product._id, variantId: item.variant._id, quantity: 1 }
        : { productId: item.product._id, quantity: 1 };

      await addToCart(payload).unwrap();
      toast.success(`Added ${item.product.name} to cart`);
      handleRemoveFromWishlist(item);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const filteredWishlist = wishlist.filter((item) =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto ${location.pathname === '/user/wishlist' ? "py-4 sm:py-6 md:py-8 px-2 sm:px-4" : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header with title and search */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Wishlist</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                </p>
              </div>
            </div>
            
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9 py-2 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-full"
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Wishlist items */}
        <div className="p-4 sm:p-6">
          {filteredWishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                <Heart className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Your wishlist is empty</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 max-w-md mb-6">
                {searchTerm 
                  ? "No items match your search. Try a different search term or clear your search."
                  : "Items you save to your wishlist will appear here. Start shopping and save your favorite items!"
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWishlist.map((item) => {
                const actualPrice = item.variant?.actualPrice || item.product?.actualPrice;
                const salePrice = item.variant?.salePrice || item.product?.salePrice || actualPrice;
                const discount = actualPrice > salePrice 
                  ? Math.round(((actualPrice - salePrice) / actualPrice) * 100) 
                  : 0;

                return (
                  <Card 
                    key={`${item.product._id}-${item.variant?._id || 'no-variant'}`} 
                    className="overflow-hidden border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Product image with remove button */}
                    <div className="relative h-48 sm:h-56 w-full bg-gray-100 dark:bg-gray-900">
                      <img
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full h-8 w-8 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        onClick={() => handleRemoveFromWishlist(item)}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                          {discount}% OFF
                        </div>
                      )}
                    </div>
                    
                    {/* Product details */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 h-10">
                          {item.product.name} {item.variant ? `(${item.variant.size} ${item.variant.unit})` : ''}
                        </h3>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">₹{salePrice}</span>
                            {actualPrice > salePrice && (
                              <span className="text-xs text-gray-400 line-through">₹{actualPrice}</span>
                            )}
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            item.inStock 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}>
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center gap-2"
                        disabled={!item.inStock}
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistComponent;