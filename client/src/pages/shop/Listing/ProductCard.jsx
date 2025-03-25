// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Eye } from "lucide-react";
// import { Link } from "react-router-dom";

// const ProductCard = ({ product, id }) => {
  
//   return (
//     <Card className="group overflow-hidden">
//       <Link to={`/shop/product/${id}`} className="block">
//         <div className="relative aspect-square">
//         {product?.discount > 0 && (
//             <Badge className="absolute top-2 left-2 bg-[#438E44] text-white text-sm z-10 rounded-full w-9 h-9 flex items-center justify-center">
//               {product?.discount}%
//             </Badge>
//           )}
//           <img
//             src={product.images[0] || "/placeholder.svg"}
//             alt={product.name}
//             className="object-cover transition-transform duration-300 group-hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
//             <Badge className="bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer">
//               <Eye className="h-4 w-4 mr-1" />
//               Quick View
//             </Badge>
//           </div>
//         </div>
//       </Link>
//       <CardContent className="p-4">
//         <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
//         <p className="text-sm text-gray-500">{product.category.name}</p>
//       </CardContent>
//       <CardFooter className="p-4 pt-0 flex justify-between items-center">
//         <div className="flex items-baseline gap-2">
//           <span className="text-lg font-bold text-[#114639]">₹{product?.salePrice ? product.salePrice : product.variants[0].salePrice.toFixed(2)}</span>
//           {(product?.actualPrice > product?.salePrice || product.variants[0].actualPrice > product.variants[0].salePrice) && (
//             <span className="text-sm text-gray-400 line-through">₹{product.actualPrice ? product.actualPrice : product.variants[0].actualPrice }</span>
//           )}
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };

// export default ProductCard;




import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, id }) => {
  const displayPrice = product.variants.length > 0 
    ? (product.variants[0].salePrice ?? product.variants[0].actualPrice) 
    : (product.salePrice ?? product.actualPrice);
  const originalPrice = product.variants.length > 0 
    ? product.variants[0].actualPrice 
    : product.actualPrice;
  const hasDiscount = product.variants.length > 0 
    ? (product.variants[0].salePrice && product.variants[0].salePrice < product.variants[0].actualPrice) 
    : (product.salePrice && product.salePrice < product.actualPrice);
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) 
    : 0;

  return (
    <Card className="group overflow-hidden">
      <Link to={`/shop/product/${id}`} className="block">
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
            <Badge className="bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer">
              <Eye className="h-4 w-4 mr-1" />
              Quick View
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category.name}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#114639]">₹{displayPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">₹{originalPrice.toFixed(2)}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;