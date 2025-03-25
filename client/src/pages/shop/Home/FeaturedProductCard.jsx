import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function FeaturedProductCard({ id, title, category, imageUrl,actualPrice, salePrice, }) {

  const [Popimg, setPopimg] = useState(0)
  return (
    <Link to={`/shop/product/${id}`} className="block group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-square relative overflow-hidden bg-gray-100">
        {actualPrice > 0 && (
            <Badge className="absolute top-2 left-2 bg-[#438E44] text-white text-sm z-10 rounded-full w-9 h-9 flex items-center justify-center">
              {(actualPrice - salePrice) / 100 }%
            </Badge>
          )}
          <img
            src={imageUrl[Popimg] || '/placeholder.svg'}
            alt={title}
            onMouseEnter={()=> setPopimg(1)}
            onMouseLeave={()=> setPopimg(0)}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-signika text-lg font-medium text-gray-900 line-clamp-1">{title}</h3>
          <p className="mt-1 text-sm font-semibold text-gray-500">{category}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold text-[#114639]">₹{Number.parseFloat(actualPrice).toFixed(2)}</p>
            <Badge variant="outline" className="text-sm bg-[#114639] text-white border-[#C0C9C5] h-9">
              View Details
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 