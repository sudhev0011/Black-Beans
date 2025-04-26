import { SlidersHorizontal } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { Button } from "@/components/ui/button";
import { useGetCategoriesQuery } from '@/store/api/userApiSlice';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"

export function PriceFilter({ value, onValueChange }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">FILTER BY PRICE</h3>
      <Slider.Root
        className="relative flex w-full touch-none select-none items-center"
        value={value}
        max={8200}
        step={1}
        onValueChange={onValueChange}
      >
        <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
          <Slider.Range className="absolute h-full bg-[#114639]" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full border border-[#114639] bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
        <Slider.Thumb className="block h-4 w-4 rounded-full border border-[#114639] bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
      </Slider.Root>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Price: ₹{value[0]} — ₹{value[1]}</span>
      </div>
    </div>
  );
}

export function CategoryFilter({ selectedCategories, onCategoryChange }) {
  const { data: categories, isLoading } = useGetCategoriesQuery();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">FILTER BY CATEGORY</h3>
      {isLoading ? (
        <span>Loading categories...</span>
      ) : (
        <div className="space-y-3">
          {categories?.categories?.map((category) => (
            <button
              key={category._id}
              className="flex w-full items-center justify-between group"
              onClick={() => onCategoryChange(category._id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-600 group-hover:text-gray-900">{category.name}</span>
              </div>
              <span
                className={`text-sm ${
                  selectedCategories.includes(category._id)
                    ? 'bg-[#114639] text-white'
                    : 'bg-gray-100 text-gray-600'
                } px-2 py-0.5 rounded-full`}
              > 
                {category.count || 0}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileFilters({ priceRange, setPriceRange, selectedCategories, setSelectedCategories, selectedSizes, setSelectedSizes }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only">Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-8">
          <PriceFilter value={priceRange} onValueChange={setPriceRange} />
          <CategoryFilter selectedCategories={selectedCategories} onCategoryChange={setSelectedCategories} />
        </div>
      </SheetContent>
    </Sheet>
  );
}