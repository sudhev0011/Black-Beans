import { useState, useCallback } from "react";
import {
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAddProductMutation,
  useGetCategoriesQuery,
  useGetAdminProductsQuery,
  useUpdateProductMutation,
  useToggleProductListingMutation,
} from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import { debounce } from "lodash";
import EditProductDialog from "./EditProductDialog";
import AddProductDialog from "./AddProductDialog";
// SearchBar Component
function SearchBar({ searchTerm, setSearchTerm, setCurrentPage }) {
  const [inputValue, setInputValue] = useState("");

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    [setSearchTerm, setCurrentPage]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  return (
    <div className="relative w-full md:w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        className="pl-8"
        value={inputValue}
        onChange={handleSearchChange}
      />
    </div>
  );
}

// Filters Component
function Filters({ filters, setFilters, categories, setCurrentPage }) {
  const {
    selectedCategory,
    isListedFilter,
    hasStockFilter,
    priceRange,
    sortBy,
    sortOrder,
  } = filters;

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
                setFilters({
                  ...filters,
                  selectedCategory: val === "all" ? "" : val,
                });
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
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="isListed-filter">Status</Label>
            <Select
              value={isListedFilter}
              onValueChange={(val) => {
                setFilters({
                  ...filters,
                  isListedFilter: val === "all" ? "" : val,
                });
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
                setFilters({
                  ...filters,
                  hasStockFilter: val === "all" ? "" : val,
                });
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
                  setFilters({
                    ...filters,
                    priceRange: { ...priceRange, min: e.target.value },
                  });
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
                  setFilters({
                    ...filters,
                    priceRange: { ...priceRange, max: e.target.value },
                  });
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

// ProductTable Component
function ProductTable({
  products,
  pagination,
  currentPage,
  setCurrentPage,
  isLoading,
  error,
  onEdit,
  onToggle,
}) {
  return (
    <>
      <div className="border rounded-md">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-16 h-16 text-brown-700"
              >
                <path d="M6 2a1 1 0 0 0-1 1v17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a1 1 0 0 0-1-1H6zm11 2v4H7V4h10zM7 10h10v10H7V10zm5 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
            </div>
            <p className="text-brown-700 mt-2 text-lg font-medium">
              Packing your coffee beans...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-red-600 text-lg font-medium">
              Error loading products: {error?.data?.message || error.message}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product._id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{product.variants.length}</TableCell>
                  <TableCell>
                    {product.variants.length > 0
                      ? `₹${product.variants[0].actualPrice}`
                      : `₹${product.actualPrice || "N/A"}`}
                  </TableCell>
                  <TableCell>{product.totalStock}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        product.isListed
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isListed ? "Listed" : "Unlisted"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={product.isListed ? "Unlist" : "List"}
                          >
                            {product.isListed ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {product.isListed
                                ? "Unlist Product"
                                : "List Product"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to{" "}
                              {product.isListed ? "unlist" : "list"} "
                              {product.name}"? This will{" "}
                              {product.isListed ? "hide" : "show"} it from/to
                              customers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                onToggle(product._id, product.isListed)
                              }
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {products.length} of {pagination.totalProducts} products
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {currentPage} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, pagination.totalPages)
              )
            }
            disabled={
              currentPage === pagination.totalPages || products.length === 0
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

// Main ProductManagement Component
export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    selectedCategory: "",
    isListedFilter: "",
    hasStockFilter: "",
    priceRange: { min: "", max: "" },
    sortBy: "date",
    sortOrder: "desc",
  });
  const [editProduct, setEditProduct] = useState(null);

  const itemsPerPage = 10;

  const { data: categories } = useGetCategoriesQuery({
    page: 0,
    limit: 0,
    search: "",
  });
  const {
    data: productsData,
    isLoading: isProductsLoading,
    error,
  } = useGetAdminProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    category: filters.selectedCategory,
    isListed: filters.isListedFilter,
    hasStock: filters.hasStockFilter,
    minPrice: filters.priceRange.min,
    maxPrice: filters.priceRange.max,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const [addProduct] = useAddProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [toggleProductListing] = useToggleProductListingMutation();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {
    totalPages: 1,
    totalProducts: 0,
  };

  const handleAddProduct = (productData) => {
    return toast.promise(addProduct(productData).unwrap(), {
      loading: "Adding product, please wait...",
      success: (data) =>
        `${data.name || "Product"} has been added successfully`,
      error: (error) =>
        `Failed to add product: ${error?.data?.message || error.message}`,
    });
  };

  const handleEditProduct = (product) =>
    setEditProduct({
      _id: product._id,
      name: product.name,
      description: product.description,
      actualPrice: product.actualPrice || "",
      salePrice: product.salePrice || "",
      totalStock: product.totalStock || "",
      category: product.category._id,
      categoryName: product.category.name || '',
      isFeatured: product.isFeatured || false,
      variants: product.variants || [],
      images: product.images || [],
      offer: product.offer || "",
    });

  const handleUpdateProduct = (formData) => {
    return toast.promise(updateProduct(formData).unwrap(), {
      loading: "Updating product, please wait...",
      success: (data) =>
        `${data.product?.name || "Product"} has been updated successfully`,
      error: (error) =>
        `Failed to update product: ${
          error?.data?.message || error.message || "Unknown error"
        }`,
    });
  };

  const handleToggleProductListing = async (id, currentStatus) => {
    try {
      await toggleProductListing(id).unwrap();
      toast.success("Product listing status toggled successfully!");
    } catch (error) {
      toast.error(
        "Error toggling product: " + (error?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <AddProductDialog
          categories={categories}
          onAddProduct={handleAddProduct}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setCurrentPage={setCurrentPage}
        />
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>
      {showFilters && (
        <Filters
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          setCurrentPage={setCurrentPage}
        />
      )}
      <ProductTable
        products={products}
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoading={isProductsLoading}
        error={error}
        onEdit={handleEditProduct}
        onToggle={handleToggleProductListing}
      />
      <EditProductDialog
        product={editProduct}
        categories={categories}
        onUpdate={handleUpdateProduct}
        onClose={() => setEditProduct(null)}
      />
    </div>
  );
}


