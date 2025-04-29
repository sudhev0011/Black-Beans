const Decimal = require("decimal.js");

async function calculateRefund(
  order,
  itemsToCancel,
  isFullCancellation = false
) {
  const orderSubtotal = new Decimal(order.subtotal);
  const orderShipping = new Decimal(order.shipping || 0);
  const orderTax = new Decimal(order.tax || 0);
  const orderDiscount = new Decimal(order.discount || 0); 
  const orderTotal = new Decimal(order.total);

  // Calculate subtotal of items to cancel
  const itemSubtotal = itemsToCancel.reduce((sum, item) => {
    return sum.plus(new Decimal(item.price).times(item.quantity));
  }, new Decimal(0));

  // Business rules
  const isShippingRefundable = isFullCancellation; 
  const isTaxRefundable = true; 
  const isDiscountRefundable = true; 

  // Calculate proportional components
  let refundSubtotal = itemSubtotal;
  let refundShipping = new Decimal(0);
  let refundTax = new Decimal(0);
  let refundDiscount = new Decimal(0);

  if (orderSubtotal.gt(0)) {
    if (isShippingRefundable) {
      refundShipping = orderShipping.times(itemSubtotal).div(orderSubtotal);
    }
    if (isTaxRefundable) {
      refundTax = orderTax.times(itemSubtotal).div(orderSubtotal);
    }
    if (isDiscountRefundable) {
      refundDiscount = orderDiscount.times(itemSubtotal).div(orderSubtotal);
    }
  }

  let refundAmount = refundSubtotal
    .plus(refundShipping)
    .plus(refundTax)
    .minus(refundDiscount);

  const totalRefunded = new Decimal(order.totalRefunded || 0);
  const maxRefundable = orderTotal.minus(totalRefunded);

  if (refundAmount.gt(maxRefundable)) {
    refundAmount = maxRefundable; // Cap refund to avoid over-refunding
  }

  refundAmount = Number(refundAmount.toFixed(2));
  refundSubtotal = Number(refundSubtotal.toFixed(2));
  refundShipping = Number(refundShipping.toFixed(2));
  refundTax = Number(refundTax.toFixed(2));
  refundDiscount = Number(refundDiscount.toFixed(2));

  return {
    refundAmount,
    breakdown: {
      subtotal: refundSubtotal,
      shipping: refundShipping,
      tax: refundTax,
      discount: refundDiscount,
    },
  };
}

module.exports = {calculateRefund}
