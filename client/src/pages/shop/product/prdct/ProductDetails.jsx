// import { useState } from "react";

// const ProductDetails = ({ product }) => {

//   // Set initial size only if sizes exist, otherwise null
//   const [selectedSize, setSelectedSize] = useState(product?.sizes.length > 0 ? product.sizes[0]?.size : null);
//   const [quantity, setQuantity] = useState(1);

//   // Get the selected size object if sizes exist, otherwise use product-level data
//   const selectedSizeObj = product.sizes.length > 0 
//     ? product.sizes.find((size) => size.size === selectedSize) 
//     : null;

//   // Use product-level price and stock if no sizes, otherwise use selected size
//   const actualPrice = selectedSizeObj ? selectedSizeObj.actualPrice : product.price;
//   const discountedPrice = selectedSizeObj ? selectedSizeObj.discountedPrice : product.discountedPrice;
//   const stock = selectedSizeObj ? selectedSizeObj.stock : product.totalStock;

//   // Handle quantity changes
//   const decreaseQuantity = () => {
//     if (quantity > 1) setQuantity(quantity - 1);
//   };

//   const increaseQuantity = () => {
//     if (quantity < stock) setQuantity(quantity + 1);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <div className="flex items-center gap-2 mb-2">
//           <span className="text-sm text-muted-foreground">{product.categoryId.name}</span>
//           {product.discount > 0 && (
//             <span className="text-xs bg-[#114639] text-white px-2 py-1 rounded-full">{product.discount}% OFF</span>
//           )}
//         </div>
//         <h1 className="text-3xl font-bold text-[#114639]">{product.name}</h1>
//         <div className="flex items-center gap-2 mt-2">
//           <div className="flex">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <svg
//                 key={star}
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill={star <= 4 ? "#114639" : "none"}
//                 stroke={star <= 4 ? "#114639" : "#71717a"}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//               </svg>
//             ))}
//           </div>
//           <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
//         </div>
//       </div>

//       <p className="text-muted-foreground">{product.description}</p>

//       <div className="space-y-4">
//         {/* Size Section - Show only if sizes array is not empty */}
//         {product.sizes.length > 0 && (
//           <div>
//             <h2 className="font-medium mb-2 text-[#114639]">Size</h2>
//             <div className="flex gap-4">
//               {product.sizes.map((size) => (
//                 <div key={size._id} className="flex items-center space-x-2">
//                   <input
//                     type="radio"
//                     id={`size-${size.size}`}
//                     name="size"
//                     value={size.size}
//                     checked={selectedSize === size.size}
//                     onChange={() => setSelectedSize(size.size)}
//                     className="accent-[#114639]"
//                   />
//                   <label htmlFor={`size-${size.size}`} className="cursor-pointer">
//                     {size.size}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <div>
//           <h2 className="font-medium mb-2 text-[#114639]">Price</h2>
//           <div className="flex items-center gap-2">
//             <span className="text-2xl font-bold text-[#114639]">₹{discountedPrice.toFixed(2)}</span>
//             {product.discount > 0 && (
//               <span className="text-muted-foreground line-through">₹{actualPrice.toFixed(2)}</span>
//             )}
//           </div>
//           <p className="text-sm text-muted-foreground mt-1">Stock: {stock} available</p>
//         </div>

//         <div>
//           <h2 className="font-medium mb-2 text-[#114639]">Quantity</h2>
//           <div className="flex items-center">
//             <button
//               onClick={decreaseQuantity}
//               disabled={quantity <= 1}
//               className="border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-50"
//             >
//               -
//             </button>
//             <span className="w-12 text-center">{quantity}</span>
//             <button
//               onClick={increaseQuantity}
//               disabled={quantity >= stock}
//               className="border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-50"
//             >
//               +
//             </button>
//           </div>
//         </div>

//         <div className="flex gap-4 pt-4">
//           <button className="flex-1 bg-[#114639] hover:bg-[#114639]/90 text-white py-2 px-4 rounded-md flex items-center justify-center">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               className="mr-2"
//             >
//               <circle cx="9" cy="21" r="1" />
//               <circle cx="20" cy="21" r="1" />
//               <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
//             </svg>
//             Add to Cart
//           </button>
//           <button className="border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-10 h-10 flex items-center justify-center rounded-md">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;





import { useState } from 'react';

const ProductDetails = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState(product.variants.length > 0 ? product.variants[0].size : null);
  const [quantity, setQuantity] = useState(1);

  const selectedSizeObj = product.variants.length > 0 
    ? product.variants.find((variant) => variant.size === selectedSize) 
    : null;

  const actualPrice = selectedSizeObj ? selectedSizeObj.actualPrice : product.actualPrice;
  const effectivePrice = selectedSizeObj ? selectedSizeObj.effectivePrice : product.effectivePrice || (product.salePrice ?? product.actualPrice);
  const stock = selectedSizeObj ? selectedSizeObj.stock : product.totalStock;
  const hasDiscount = effectivePrice < actualPrice;
  const discountPercentage = hasDiscount ? Math.round(((actualPrice - effectivePrice) / actualPrice) * 100) : 0;

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < stock) setQuantity(quantity + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">{product.category.name}</span>
          {hasDiscount && (
            <span className="text-xs bg-[#114639] text-white px-2 py-1 rounded-full">{discountPercentage}% OFF</span>
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
          <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
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
                  <label htmlFor={`size-${variant.size}`} className="cursor-pointer">{`${variant.size} ${variant.unit}`}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-medium mb-2 text-[#114639]">Price</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#114639]">₹{effectivePrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through">₹{actualPrice.toFixed(2)}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Stock: {stock} available</p>
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
              disabled={quantity >= stock}
              className="border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button className="flex-1 bg-[#114639] hover:bg-[#114639]/90 text-white py-2 px-4 rounded-md flex items-center justify-center">
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
            Add to Cart
          </button>
          <button className="border border-[#114639] text-[#114639] hover:bg-[#114639]/10 w-10 h-10 flex items-center justify-center rounded-md">
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
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;