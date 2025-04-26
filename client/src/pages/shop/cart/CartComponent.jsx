import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Heart,
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  Lock,
} from "lucide-react";
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from "@/store/api/userApiSlice";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  setCart,
} from "@/store/slices/userSlice/cartSlice";
import CartLoaderMorph from "@/components/ui/loading/CartLoaderMorph";
import EmptyCartComponent from "@/components/ui/EmptyCartComponent";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CartComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);

  const {
    data: cart,
    isLoading,
    refetch,
  } = useGetCartQuery(undefined, {
    skip: !user,
  });

  const [updateCartItemApi] = useUpdateCartItemMutation();
  const [removeFromCartApi] = useRemoveFromCartMutation();
  const [clearCartApi] = useClearCartMutation();
  const [error, setError] = useState(null);
  const [outOfStock, setOutOfStock] = useState([]);
  const [blockedProducts, setBlockedProducts] = useState([]);
  const [blockedCategories, setBlockedCatgories] = useState([]);
  useEffect(() => {
    if (cart) {
      dispatch(
        setCart({
          items: cart.items,
          total: cart.total,
        })
      );
    }
    if (error) {
      setError(error.data?.message || "Failed to load cart");
    }
  }, [cart, dispatch, error]);

  const handleUpdateQuantity = async (productId, variantId, quantity) => {
    console.log("cart details before api call", productId, variantId, quantity);

    if (quantity > 5) {
      setError("Maximum quantity is 5");
      return;
    }

    if (quantity < 1) {
      return;
    }

    try {
      setError(null);
      const result = await updateCartItemApi({
        productId,
        variantId,
        quantity,
      }).unwrap();
      dispatch(updateCartItem({ productId, variantId, quantity }));
    } catch (error) {
      console.error("Update cart error:", error);
      setError(error.data?.message || "Failed to update cart");
    }
  };

  const handleRemoveFromCart = async (productId, variantId) => {
    console.log("Removing item with:", productId, variantId);
    const previousItems = [...cart.items];
    try {
      setError(null);
      await removeFromCartApi({ productId, variantId }).unwrap();
    } catch (error) {
      console.error("Remove from cart error:", error);
      // Rollback on failure
      dispatch(setCart({ items: previousItems, total: cart.total }));
      setError(error.data?.message || "Failed to remove from cart");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartApi().unwrap();
      dispatch(clearCart());
    } catch (error) {
      console.error("Clear cart error:", error);
      alert(error.data?.message || "Failed to clear cart");
    }
  };

  const proceedToCheckout = async () => {
    try {
      const updatedCart = await refetch().unwrap();
      console.log("refetch cart data", updatedCart);

      const outOfStockItems = updatedCart.items.filter((item) => {
        const stock = item.variantId
          ? item.variantId.stock
          : item.productId.stock;
        return stock < item.quantity;
      });

      if (outOfStockItems.length > 0) {
        setOutOfStock(
          outOfStockItems.map(
            (item) =>
              `${item.productId._id}-${item.variantId?._id || "no-variant"}`
          )
        );
        toast.info("Some items are out of stock. Please update your cart.");
        return;
      }

      const blockedProducts = updatedCart.items.filter((item) => {
        return !item.productId.isListed;
      });
      console.log("blocked items in the cart", blockedProducts);

      if (blockedProducts.length > 0) {
        setBlockedProducts(
          blockedProducts.map((product) => product.productId._id)
        );
        toast.info(
          "some products in your cart is not available right now, Please update your cart"
        );
        return;
      }

      const blockedCategories = updatedCart.items.filter((item) => {
        return !item.productId.category.isListed;
      });
      console.log("blocked items in the cart", blockedCategories);

      if (blockedCategories.length > 0) {
        setBlockedCatgories(
          blockedCategories.map((product) => product.productId._id)
        );
        toast.info(
          "some products in your cart is not available right now, Please update your cart"
        );
        return;
      }

      navigate("/user/checkout");
    } catch (error) {
      setError("Failed to validate cart. Please try again.");
    }
  };

  const continueShopping = () => {
    navigate("/shop");
  };

  if (isLoading) return <CartLoaderMorph />;

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {cart == null ? (
        <EmptyCartComponent onContinueShopping={continueShopping} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex justify-between items-center">
                  <span>Your Items ({cart?.items?.length || 0})</span>
                  {cart?.items?.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cart?.items?.length === 0 ? (
                  <div className="p-6 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Looks like you haven't added anything to your cart yet.
                    </p>
                    <Button onClick={continueShopping}>Start Shopping</Button>
                  </div>
                ) : (
                  <div>
                    {cart?.items?.map((item) => (
                      <div
                        key={`${item?.productId._id}-${
                          item.variantId?._id || "no-variant"
                        }`}
                        className={`border-b last:border-b-0 ${
                          outOfStock.includes(
                            `${item.productId._id}-${
                              item.variantId?._id || "no-variant"
                            }`
                          ) ||
                          blockedProducts.includes(item.productId._id) ||
                          blockedCategories.includes(item.productId._id)
                            ? "bg-red-200"
                            : ""
                        }`}
                      >
                        <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={item?.productId?.images[0]}
                                alt={item?.productId?.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-base">
                                {item?.productId?.name}
                              </h3>
                              {item?.variantId?.size &&
                                item?.variantId?.unit && (
                                  <p className="text-sm text-gray-500">
                                    Size: {item?.variantId?.size}
                                    {item?.variantId?.unit}
                                  </p>
                                )}
                              <p className="text-sm font-medium mt-1">
                                ₹
                                {item?.variantId
                                  ? item?.variantId?.salePrice?.toFixed(2)
                                  : item?.productId?.salePrice}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4 sm:self-end">
                            <div className="flex items-center border rounded">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId?._id,
                                    item.variantId?._id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId?._id,
                                    item.variantId?._id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={item.quantity >= 5}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="min-w-20 text-right">
                              <span className="font-medium">
                                ₹
                                {(
                                  (item?.variantId
                                    ? item?.variantId?.salePrice
                                    : item?.productId?.salePrice) *
                                  item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() =>
                                  handleRemoveFromCart(
                                    item.productId._id,
                                    item.variantId?._id
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {cart?.items?.length > 0 && (
                <CardFooter className="justify-between p-4 border-t">
                  <Button variant="outline" onClick={continueShopping}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                  <Button onClick={proceedToCheckout}>
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          {cart?.items?.length > 0 && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{(cart?.subtotal || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping</span>
                      <span>₹{cart?.shipping}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax</span>
                      <span>₹{cart?.tax.toFixed(2)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center font-bold">
                      <span>Estimated Total</span>
                      <span>₹{(cart?.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 p-4 border-t">
                  <Button className="w-full" onClick={proceedToCheckout}>
                    Proceed to Checkout
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Lock className="h-3 w-3" />
                    <span>Secure checkout</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartComponent;
