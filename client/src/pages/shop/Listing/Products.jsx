import { useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { PriceFilter, CategoryFilter, MobileFilters } from '@/components/ui/filter';
import { cn } from '@/lib/utils';
import ProductCard from './ProductCard';
import { FiGrid } from 'react-icons/fi';
import { BiSolidGrid } from 'react-icons/bi';
import { TfiLayoutGrid4Alt } from 'react-icons/tfi';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/userApiSlice';
import { ProductCardSkeleton } from '@/components/ui/ProductCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

const sortOptions = [
  { value: 'AtoZ', label: 'A to Z' },
  { value: 'ZtoA', label: 'Z to A' },
  { value: 'priceLowToHigh', label: 'Price: Low to High' },
  { value: 'priceHighToLow', label: 'Price: High to Low' },
  { value: 'newArrivals', label: 'New Arrivals' },
];

export default function ShopPage() {
  const [view, setView] = useState('grid-4');
  const [sort, setSort] = useState('AtoZ');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 82000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const { data: categoriesData } = useGetCategoriesQuery();
  
  const { data, isLoading, isError, error } = useGetProductsQuery({
    page: currentPage,
    limit: 8,
    sort,
    search: searchTerm || '',
    minPrice: priceRange[0] === 0 ? undefined : priceRange[0],
    maxPrice: priceRange[1] === 8200 ? undefined : priceRange[1],
    category: selectedCategories.length === 1 ? selectedCategories[0] : undefined, // Single category for now
  });
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const products = data?.products || [];
  const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalProducts: 0, limit: 8 };
  const start = (pagination.currentPage - 1) * pagination.limit + 1;
  const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts);
  if (isError) return <div className="text-center mt-10 text-red-600">Error: {error?.data?.message || error.message}</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="container mx-auto max-w-[1400px] px-4 lg:pt-16 md:pt-10 pt-4">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
            <div className="hidden lg:block space-y-8">
              <PriceFilter value={priceRange} onValueChange={setPriceRange} />
              <CategoryFilter
                selectedCategories={selectedCategories}
                onCategoryChange={(categoryId) =>
                  setSelectedCategories((prev) =>
                    prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
                  )
                }
                categories={categoriesData?.categories}
              />
            </div>

            <div>
              <div className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <MobileFilters
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    selectedSizes={selectedSizes}
                    setSelectedSizes={setSelectedSizes}
                    categories={categoriesData?.categories}
                  />
                  <Button variant={view === 'menu' ? 'secondary' : 'outline'} size="icon" onClick={() => setView('menu')}>
                    <Menu className="h-4 w-4" />
                  </Button>
                  <Button variant={view === 'grid-2' ? 'secondary' : 'outline'} size="icon" onClick={() => setView('grid-2')}>
                    <FiGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={view === 'grid-3' ? 'secondary' : 'outline'} size="icon" onClick={() => setView('grid-3')}>
                    <BiSolidGrid style={{ height: '20px', width: '20px' }} />
                  </Button>
                  <Button variant={view === 'grid-4' ? 'secondary' : 'outline'} size="icon" onClick={() => setView('grid-4')}>
                    <TfiLayoutGrid4Alt style={{ height: '16px', width: '16px' }} />
                  </Button>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Desktop search bar (visible on lg and up screens only) */}
                  <div className="hidden lg:block">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); 
                      }}
                      className="w-64"
                    />
                  </div>
                  
                  {/* Mobile search icon (visible on screens smaller than lg) */}
                  <div className="lg:hidden">
                    {!isSearchOpen && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSearch}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {isLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <p className="text-sm text-gray-500">
                    Showing {start}-{end} of {pagination.totalProducts} results
                  </p>
                )}
              </div>

              {/* Expanded mobile search when active (full width) */}
              {isSearchOpen && (
                <div className="lg:hidden px-4 pb-4">
                  <div className="flex items-center w-full">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full"
                      autoFocus
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleSearch}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  'grid gap-6 lg:pt-4 pt-2 lg:pl-4 pl-2',
                  view === 'grid-4' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
                  view === 'grid-3' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                  view === 'grid-2' && 'grid-cols-1 sm:grid-cols-2',
                  view === 'menu' && 'grid-cols-1'
                )}
              >
                {isLoading
                  ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
                  : products.map((product) => <ProductCard key={product._id} product={product} id={product._id} />)}
              </div>

              {!isLoading && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-2" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: pagination.totalPages }).map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? 'bg-[#114639] text-white' : ''}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}