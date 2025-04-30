import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function FeaturedProductCard({ id, title, category, imageUrl, actualPrice, salePrice }) {
  const [popImg, setPopImg] = useState(0);

  return (
    <Link to={`/shop/product/${id}`} className="block group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg w-full max-w-sm mx-auto">
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          {actualPrice > 0 && (
            <Badge className="absolute top-2 left-2 bg-[#438E44] text-white text-xs md:text-sm z-10 rounded-full w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
              {Math.round(((actualPrice - salePrice) / actualPrice) * 100)}%
            </Badge>
          )}
          <img
            src={imageUrl[popImg] || '/placeholder.svg'}
            alt={title}
            // onMouseEnter={() => setPopImg(1)}
            // onMouseLeave={() => setPopImg(0)}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <CardContent className="p-4 flex flex-col gap-2">
          <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 line-clamp-1">
            {title}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-gray-500">{category}</p>

          <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-row sm:flex-col items-start sm:items-start gap-2 sm:gap-0">
              <p className="text-base md:text-lg font-bold text-[#114639]">
                ₹{Number.parseFloat(salePrice).toFixed(2)}
              </p>
              {actualPrice > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{actualPrice.toFixed(2)}
                </span>
              )}
            </div>
            <Badge
              variant="outline"
              className="text-xs sm:text-sm md:text-sm bg-customGreen text-white border-[#C0C9C5] py-2 px-3 md:py-1.5 md:px-2 w-full sm:w-auto text-center hover:bg-[#0d362c] transition-colors"
            >
              View Details
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
