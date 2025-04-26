// utils/calculateCartTotals.js
const calculateCartTotals = (cartBSON) => {
  let subtotal = 0;
  try {
    const cart = cartBSON.toObject();
    cart.items = cart.items.map((item) => {
      const price = item?.productId?.salePrice || item?.variantId?.salePrice; // or variantId.price
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return item;
    });

    const tax = subtotal * 0.1;
    const shipping = subtotal > 150 ? 0 : 20;
    const total = subtotal + tax + shipping;

    return {
      ...cart,
      subtotal,
      tax,
      shipping,
      total,
    };
  } catch (error) {
    if(error){
      return ('something went wrong',error);
    }
  }
};

module.exports = calculateCartTotals;
