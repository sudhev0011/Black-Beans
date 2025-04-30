import {X} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Filters({ filters, setFilters, categories, setCurrentPage }) {
    const { selectedCategory, isListedFilter, hasStockFilter, priceRange, sortBy, sortOrder } = filters;
  
    const clearFilters = () => {
      setFilters({
        selectedCategory: "",
        isListedFilter: "",
        hasStockFilter: "",
        priceRange: { min: "", max: "" },
        sortBy: "date",
        sortOrder: "desc",
      });
      setCurrentPage(1);
    };
  
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Filters & Sort</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setFilters({ ...filters, selectedCategory: val === "all" ? "" : val });
                  setCurrentPage(1);
                }}
                disabled={!categories}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="isListed-filter">Status</Label>
              <Select
                value={isListedFilter}
                onValueChange={(val) => {
                  setFilters({ ...filters, isListedFilter: val === "all" ? "" : val });
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Listed</SelectItem>
                  <SelectItem value="false">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hasStock-filter">Stock</Label>
              <Select
                value={hasStockFilter}
                onValueChange={(val) => {
                  setFilters({ ...filters, hasStockFilter: val === "all" ? "" : val });
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="true">In Stock</SelectItem>
                  <SelectItem value="false">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min-price">Min Price</Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => {
                    setFilters({ ...filters, priceRange: { ...priceRange, min: e.target.value } });
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="max-price">Max Price</Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => {
                    setFilters({ ...filters, priceRange: { ...priceRange, max: e.target.value } });
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(val) => {
                  const [by, order] = val.split("-");
                  setFilters({ ...filters, sortBy: by, sortOrder: order });
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">A-Z</SelectItem>
                  <SelectItem value="name-desc">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }