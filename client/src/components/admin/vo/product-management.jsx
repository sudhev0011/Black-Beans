import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetCategoriesQuery,
  useGetAdminProductsQuery,
  useToggleProductListingMutation,
  useAddOfferMutation,
  useRemoveOfferMutation,
} from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import SearchBar from "./SearchBar";
import Filters from "./Filters";
import ProductTable from "./ProductTable";
import AddProductDialog from "./AddProductDialog";
import EditProductDialog from "./EditProductDialog";

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
  const [isMobile, setIsMobile] = useState(false);

  const itemsPerPage = 10;

  // Check viewport size on mount and when window resizes
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const { data: categories } = useGetCategoriesQuery({
    page: 0,
    limit: 0,
    search: "",
  });
  
  const {
    data: productsData,
    isLoading: isProductsLoading,
    error,
    refetch,
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

  const [toggleProductListing] = useToggleProductListingMutation();
  const [addOffer] = useAddOfferMutation();
  const [removeOffer] = useRemoveOfferMutation();

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {
    totalPages: 1,
    totalProducts: 0,
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
      isFeatured: product.isFeatured || false,
      variants: product.variants || [],
      images: product.images || [],
    });

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

  const handleAddOffer = async (offerData) => {
    return toast.promise(addOffer(offerData).unwrap(), {
      loading: "Adding offer, please wait...",
      success: (data) =>
        `Offer added successfully to ${data.product?.name || "Product"}`,
      error: (error) =>
        `Failed to add offer: ${error?.data?.message || error.message}`,
    });
  };

  const handleRemoveOffer = async (productId) => {
    console.log("product id for remove offer", productId);

    return toast.promise(removeOffer(productId).unwrap(), {
      loading: "Removing offer, please wait...",
      success: (data) =>
        `Offer removed successfully from ${data.product?.name || "Product"}`,
      error: (error) =>
        `Failed to remove offer: ${error?.data?.message || error.message}`,
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-4 py-2 md:py-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Product Management</h1>
        <div className="w-full sm:w-auto">
          <AddProductDialog categories={categories} />
        </div>
      </div>
      
      {/* Search and filter controls */}
      <div className="flex flex-col w-full gap-3">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setCurrentPage={setCurrentPage}
          refetch={refetch}
        />
        
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            {showFilters ? (
              <>
                <X className="mr-1 h-4 w-4" /> Hide Filters
              </>
            ) : (
              <>
                <Filter className="mr-1 h-4 w-4" /> Filters
              </>
            )}
          </Button>
          
          <div className="text-sm text-gray-500">
            {pagination.totalProducts} product{pagination.totalProducts !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>
      
      {/* Filters panel - collapsible */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg shadow-sm">
          <Filters
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
      
      {/* Main content table */}
      <div className="overflow-x-auto -mx-2 md:mx-0">
        <ProductTable
          products={products}
          pagination={pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isLoading={isProductsLoading}
          error={error}
          onEdit={handleEditProduct}
          onToggle={handleToggleProductListing}
          onAddOffer={handleAddOffer}
          onRemoveOffer={handleRemoveOffer}
          isMobile={isMobile}
        />
      </div>
      
      {/* Edit product dialog */}
      <EditProductDialog
        product={editProduct}
        categories={categories}
        onClose={() => setEditProduct(null)}
      />
    </div>
  );
}