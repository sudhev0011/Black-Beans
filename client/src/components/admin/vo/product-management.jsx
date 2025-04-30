// import { useState } from "react";
// import { Filter } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   useGetCategoriesQuery,
//   useGetAdminProductsQuery,
//   useToggleProductListingMutation,
//   useAddOfferMutation,
// } from "../../../store/api/adminApiSlice";
// import { toast } from "sonner";
// import SearchBar from "./SearchBar";
// import Filters from "./Filters";
// import ProductTable from "./ProductTable";
// import AddProductDialog from "./AddProductDialog";
// import EditProductDialog from "./EditProductDialog";

// export default function ProductManagement() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     selectedCategory: "",
//     isListedFilter: "",
//     hasStockFilter: "",
//     priceRange: { min: "", max: "" },
//     sortBy: "date",
//     sortOrder: "desc",
//   });
//   const [editProduct, setEditProduct] = useState(null);

//   const itemsPerPage = 10;

//   const { data: categories } = useGetCategoriesQuery({
//     page: 0,
//     limit: 0,
//     search: "",
//   });
//   const {
//     data: productsData,
//     isLoading: isProductsLoading,
//     error,
//   } = useGetAdminProductsQuery({
//     page: currentPage,
//     limit: itemsPerPage,
//     search: searchTerm,
//     category: filters.selectedCategory,
//     isListed: filters.isListedFilter,
//     hasStock: filters.hasStockFilter,
//     minPrice: filters.priceRange.min,
//     maxPrice: filters.priceRange.max,
//     sortBy: filters.sortBy,
//     sortOrder: filters.sortOrder,
//   });

//   const [toggleProductListing] = useToggleProductListingMutation();
//   const [addOffer] = useAddOfferMutation();

//   const products = productsData?.products || [];
//   const pagination = productsData?.pagination || {
//     totalPages: 1,
//     totalProducts: 0,
//   };

//   const handleEditProduct = (product) =>
//     setEditProduct({
//       _id: product._id,
//       name: product.name,
//       description: product.description,
//       actualPrice: product.actualPrice || "",
//       salePrice: product.salePrice || "",
//       totalStock: product.totalStock || "",
//       category: product.category._id,
//       isFeatured: product.isFeatured || false,
//       variants: product.variants || [],
//       images: product.images || [],
//     });

//   const handleToggleProductListing = async (id, currentStatus) => {
//     try {
//       await toggleProductListing(id).unwrap();
//       toast.success("Product listing status toggled successfully!");
//     } catch (error) {
//       toast.error(
//         "Error toggling product: " + (error?.data?.message || error.message)
//       );
//     }
//   };

//   const handleAddOffer = async (offerData) => {
//     return toast.promise(addOffer(offerData).unwrap(), {
//       loading: "Adding offer, please wait...",
//       success: (data) =>
//         `Offer added successfully to ${data.product?.name || "Product"}`,
//       error: (error) =>
//         `Failed to add offer: ${error?.data?.message || error.message}`,
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Product Management</h1>
//         <AddProductDialog categories={categories} />
//       </div>
//       <div className="flex flex-col md:flex-row gap-4 justify-between">
//         <SearchBar
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           setCurrentPage={setCurrentPage}
//         />
//         <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
//           <Filter className="mr-2 h-4 w-4" /> Filters
//         </Button>
//       </div>
//       {showFilters && (
//         <Filters
//           filters={filters}
//           setFilters={setFilters}
//           categories={categories}
//           setCurrentPage={setCurrentPage}
//         />
//       )}
//       <ProductTable
//         products={products}
//         pagination={pagination}
//         currentPage={currentPage}
//         setCurrentPage={setCurrentPage}
//         isLoading={isProductsLoading}
//         error={error}
//         onEdit={handleEditProduct}
//         onToggle={handleToggleProductListing}
//         onAddOffer={handleAddOffer}
//       />
//       <EditProductDialog
//         product={editProduct}
//         categories={categories}
//         onClose={() => setEditProduct(null)}
//       />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <AddProductDialog categories={categories} />
      </div>
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setCurrentPage={setCurrentPage}
          refetch={refetch}
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
        onAddOffer={handleAddOffer}
        onRemoveOffer={handleRemoveOffer}
        
      />
      <EditProductDialog
        product={editProduct}
        categories={categories}
        onClose={() => setEditProduct(null)}
      />
    </div>
  );
}
