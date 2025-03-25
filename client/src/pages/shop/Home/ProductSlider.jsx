// import useEmblaCarousel from "embla-carousel-react";
// import { ChevronLeft, ChevronRight, Image } from "lucide-react";
// import { useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { Badge } from "@/components/ui/badge";

// export function   ProductSlider({ products }) {
//   const [emblaRef, emblaApi] = useEmblaCarousel({
//     align: "start",
//     slidesToScroll: 1,
//     dragFree: true,
//   });

//   const scrollPrev = useCallback(() => {
//     if (emblaApi) emblaApi.scrollPrev();
//   }, [emblaApi]);

//   const scrollNext = useCallback(() => {
//     if (emblaApi) emblaApi.scrollNext();
//   }, [emblaApi]);

//   return (
//     <div className="our-product-move relative group pb-10"> {/* Moved group class here */}
//       <div ref={emblaRef} className="overflow-x-auto no-scrollbar" style={{ height: "360px" }}>

//         <div className="flex gap-8">
//           {products?.map((product, i) => (
//             <Link to={`shop/product/${product.id}`} key={i}>
//             <div
//               className="flex flex-col items-center group cursor-pointer hover:scale-105 rounded-lg hover:shadow-lg transition-all duration-300 ease-in-out hover:bg-[#ffffff]"
//             >
//               <div className="relative mb-4 w-60 h-60 flex-shrink-0">
//               {product?.discount > 0 && (
//             <Badge className="absolute top-2 left-2 bg-[#438E44] text-white text-sm z-10 rounded-full w-9 h-9 flex items-center justify-center">
//               {product?.discount}%
//             </Badge>
//           )}
//                 <img
//                   src={product.images[1]}
//                   alt="Decorative leaf"
//                   className="mx-auto h-full object-cover w-full"
//                 />
//               </div>
//               <h3 className="text-sm font-medium mb-1">{product.name}</h3>
//               <p className="text-xs text-gray-500 mb-1">{product.categoryId.name}</p>
//               <p className="text-sm font-medium text-[#114639] mb-3">
//                 ₹{product.effectivePrice}
//               </p>
//             </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//       <div className="slider-controls">
//         <Button
//           variant="outline"
//           size="icon"
//           className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//           onClick={scrollPrev}
//         >
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//         <Button
//           variant="outline"
//           size="icon"
//           className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//           onClick={scrollNext}
//         >
//           <ChevronRight className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }






import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function ProductSlider({ products }) {
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="our-product-move relative group pb-10">
      <div ref={emblaRef} className="overflow-x-auto no-scrollbar" style={{ height: '360px' }}>
        <div className="flex gap-8">
          {products?.map((product) => (
            <Link to={`/shop/product/${product._id}`} key={product._id}>
              <div className="flex flex-col items-center group cursor-pointer hover:scale-105 rounded-lg hover:shadow-lg transition-all duration-300 ease-in-out hover:bg-[#ffffff]">
                <div className="relative mb-4 w-60 h-60 flex-shrink-0">
                  <img
                    src={product.images[0] || product.images[0]}
                    alt={product.name}
                    className="mx-auto h-full object-cover w-full"
                  />
                </div>
                <h3 className="text-sm font-medium mb-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
                <p className="text-sm font-medium text-[#114639] mb-3">
                  ₹{Number.parseFloat(product.effectivePrice).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="slider-controls">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}