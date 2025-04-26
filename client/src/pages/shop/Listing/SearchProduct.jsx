import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGetProductsQuery } from "@/store/api/userApiSlice"; // Adjust the import path as needed
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import ProductCard from "./ProductCard";

const ITEMS_PER_PAGE = 10;

export default function SearchProduct() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("AtoZ"); 
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Map frontend sort options to backend sort values
  const sortMap = {
    featured: "AtoZ", 
    "price-asc": "priceLowToHigh",
    "price-desc": "priceHighToLow",
    "new-arrivals": "newArrivals",
    rating: "AtoZ", 
  };

  const { data, isLoading, error } = useGetProductsQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sort: sortMap[sortOption] || sortOption, 
    search: searchTerm || undefined, 
    minPrice: 0, 
    maxPrice: 100000, 
    featured: sortOption === "featured" ? true : undefined,
  });

  const products = data?.products || [];
  console.log("products form the search", products[6]);
  console.log(
    new Date(products[6]?.createdAt) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    limit: ITEMS_PER_PAGE,
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1); 
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto p-4 lg:p-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 py-10">
        <h1 className="text-2xl font-bold">Search Products</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full sm:w-64"
          />

          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="AtoZ">A to Z</SelectItem>
              <SelectItem value="ZtoA">Z to A</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="new-arrivals">New Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">
            Failed to load products: {error.message}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <Card key={product._id} className="flex flex-col h-full">
                <CardContent
                  className="flex-grow cursor-pointer"
                  onClick={() => navigate(`/shop/product/${product._id}`)}
                >
                  <div className="aspect-square relative my-4">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"} 
                      alt={product.name}
                      className="object-cover w-full h-full rounded-md"
                    />
                    {new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <Badge className="absolute text-center justify-center left-2 top-2 bg-[#438e44] w-10 h-10 rounded-full">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-500 underline">{product.category.name}</p>                  
                  <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <p className="text-lg font-bold">
                    ₹{product?.variants.length > 0 ? product.variants[0].salePrice?.toFixed(2) : product.salePrice?.toFixed(2)} 
                  </p>
                    <p className="text-sm text-gray-600 line-through">
                    ₹{product?.variants.length > 0 ? product.variants[0].actualPrice?.toFixed(2) : product.actualPrice?.toFixed(2)}
                    </p>
                </CardFooter>
              </Card>
            ))}
            {/* {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                id={product._id}
              />
            ))} */}
          </div>

          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                disabled={currentPage === pagination.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
