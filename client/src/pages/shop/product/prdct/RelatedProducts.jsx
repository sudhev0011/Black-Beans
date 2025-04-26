import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetProductsQuery } from '@/store/api/userApiSlice';
import LoadingSkeleton from '@/components/ui/loading/LoadingSkeleton';
import ProductCard from '../../Listing/ProductCard';

export default function RelatedProducts({ categoryId }) {
  const { data: productsData, isLoading } = useGetProductsQuery(
    { category: categoryId, limit: 7 },
    { skip: !categoryId }
  );
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const products = productsData?.products || [];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
    }
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
    };
  }, [products]);

  if (isLoading) return <LoadingSkeleton isInline />;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const cardWidth = 286; // Card width (260px) + gap (24px)
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="w-full lg:py-12 mt-8">
      <div className="container lg:px-0 px-4 overflow-hidden">
        <h2 className="text-2xl font-medium mb-12">Related products</h2>
        <div className="relative mx-[-1rem] md:mx-[-1.5rem]">
          <div
            ref={scrollContainerRef}
            className="flex flex-nowrap overflow-x-auto gap-4 pb-6 px-4 md:px-6 snap-x snap-mandatory scrollbar-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={checkScroll}
          >
            {products &&
              products.map((product) => (
                <div key={product._id} className="min-w-[260px] w-[260px] snap-start">
                  <ProductCard product={product} id={product._id} />
                </div>
              ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md',
              !canScrollLeft && 'hidden'
            )}
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              'absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-md',
              !canScrollRight && 'hidden'
            )}
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}