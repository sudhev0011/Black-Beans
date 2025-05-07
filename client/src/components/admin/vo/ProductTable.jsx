import { useEffect, useState } from "react";
import { Edit, ChevronLeft, ChevronRight, Eye, EyeOff, Percent, XCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// AddOfferDialog Component - Made responsive
function AddOfferDialog({ product, onAddOffer, onClose }) {
  const [offerData, setOfferData] = useState({
    discountPercentage: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOfferData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await onAddOffer({
        productId: product._id,
        discountPercentage: Number(offerData.discountPercentage),
        startDate: offerData.startDate,
        endDate: offerData.endDate,
      });
      onClose();
    } catch (error) {
      toast.error("Failed to add offer. Please try again.");
      console.error("Error adding offer:", error);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[90vw] w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Add Offer for {product?.name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter the offer details to apply a discount to this product.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="discountPercentage" className="sm:text-right text-left">
              Discount (%)
            </Label>
            <Input
              id="discountPercentage"
              name="discountPercentage"
              type="number"
              min="0"
              max="100"
              value={offerData.discountPercentage}
              onChange={handleChange}
              className="sm:col-span-3"
              placeholder="e.g., 20"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="startDate" className="sm:text-right text-left">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={offerData.startDate}
              onChange={handleChange}
              className="sm:col-span-3"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="endDate" className="sm:text-right text-left">
              End Date
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={offerData.endDate}
              onChange={handleChange}
              className="sm:col-span-3"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto order-1 sm:order-2">
            Add Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ProductCard component for mobile view
function ProductCard({ product, onEdit, onToggle, onRemoveOffer, setOfferProduct }) {
  return (
    <Collapsible className="border rounded-md mb-2 bg-white dark:bg-gray-950">
      <div className="p-3 flex justify-between items-center">
        <div className="flex-1">
          <h3 className="font-medium">{product.name}</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {product.category.name}
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="px-3 pb-3 pt-1 border-t text-sm space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-medium text-xs text-gray-500">ID</div>
              <div className="truncate text-xs">{product._id}</div>
            </div>

            <div>
              <div className="font-medium text-xs text-gray-500">Status</div>
              <span
                className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                  product.isListed
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.isListed ? "Listed" : "Unlisted"}
              </span>
            </div>
            
            <div>
              <div className="font-medium text-xs text-gray-500">Price</div>
              <div>
                {product.variants.length > 0
                  ? `₹${product.variants[0].salePrice}`
                  : `₹${product.salePrice || "N/A"}`}
              </div>
            </div>
            
            <div>
              <div className="font-medium text-xs text-gray-500">Stock</div>
              <div>{product.totalStock}</div>
            </div>
            
            <div>
              <div className="font-medium text-xs text-gray-500">Offer</div>
              <div>
                {product.offer && product.offer.isActive
                  ? `${product.offer.discountPercentage}%`
                  : "-"}
              </div>
            </div>
            
            <div>
              <div className="font-medium text-xs text-gray-500">Variants</div>
              <div>{product.variants.length}</div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2 border-t mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {product.offer && product.offer.isActive ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Remove Offer"
                    className="h-8 w-8 p-0"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Offer</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove the offer from "{product.name}"?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemoveOffer(product._id)}
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOfferProduct(product)}
                title="Add Offer"
                className="h-8 w-8 p-0"
              >
                <Percent className="h-4 w-4" />
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  title={product.isListed ? "Unlist" : "List"}
                  className="h-8 w-8 p-0"
                >
                  {product.isListed ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw]">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {product.isListed ? "Unlist Product" : "List Product"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to{" "}
                    {product.isListed ? "unlist" : "list"} "{product.name}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onToggle(product._id, product.isListed)}
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ProductTable({
  products,
  pagination,
  currentPage,
  setCurrentPage,
  isLoading,
  error,
  onEdit,
  onToggle,
  onAddOffer,
  onRemoveOffer,
  isMobile,
}) {
  const [offerProduct, setOfferProduct] = useState(null);
  // Determine if the screen is mobile sized - use the prop if provided
  const [isSmallScreen, setIsSmallScreen] = useState(isMobile || false);

  // Check viewport size if isMobile prop is not provided
  useEffect(() => {
    if (isMobile === undefined) {
      const checkScreenSize = () => {
        setIsSmallScreen(window.innerWidth < 768);
      };
      
      // Initial check
      checkScreenSize();
      
      // Add resize listener
      window.addEventListener('resize', checkScreenSize);
      
      // Cleanup
      return () => window.removeEventListener('resize', checkScreenSize);
    } else {
      setIsSmallScreen(isMobile);
    }
  }, [isMobile]);

  // Loading state
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-12 h-12 text-brown-700"
            >
              <path d="M6 2a1 1 0 0 0-1 1v17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a1 1 0 0 0-1-1H6zm11 2v4H7V4h10zM7 10h10v10H7V10zm5 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </div>
          <p className="text-brown-700 mt-2 text-base font-medium">
            Packing your coffee beans...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border rounded-md">
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-red-600 text-base font-medium text-center px-4">
            Error loading products: {error?.data?.message || error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      {isSmallScreen ? (
        <div className="space-y-1">
          {products.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={onEdit}
                onToggle={onToggle}
                onRemoveOffer={onRemoveOffer}
                setOfferProduct={setOfferProduct}
              />
            ))
          )}
        </div>
      ) : (
        /* Desktop table view */
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Variants</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Offer</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="max-w-[100px] truncate">{product._id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell className="text-center">{product.variants.length}</TableCell>
                    <TableCell>
                      {product.variants.length > 0
                        ? `₹${product.variants[0].salePrice}`
                        : `₹${product.salePrice || "N/A"}`}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.offer && product.offer.isActive
                        ? `${product.offer.discountPercentage}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">{product.totalStock}</TableCell>
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
                        {product.offer && product.offer.isActive ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Remove Offer"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Offer</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the offer from "
                                  {product.name}"? This will revert the sale price
                                  to the actual price.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onRemoveOffer(product._id)}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOfferProduct(product)}
                            title="Add Offer"
                          >
                            <Percent className="h-4 w-4" />
                          </Button>
                        )}
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
                                {product.isListed ? "Unlist Product" : "List Product"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to{" "}
                                {product.isListed ? "unlist" : "list"} "{product.name}"?
                                This will {product.isListed ? "hide" : "show"} it from/to
                                customers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onToggle(product._id, product.isListed)}
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Offer Dialog */}
      <AddOfferDialog
        product={offerProduct}
        onAddOffer={onAddOffer}
        onClose={() => setOfferProduct(null)}
      />
      
      {/* Pagination - responsive for both views */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
        <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
          Showing {products.length} of {pagination.totalProducts} products
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs sm:text-sm min-w-[80px] text-center">
            Page {currentPage} of {pagination.totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages || 1))}
            disabled={currentPage === (pagination.totalPages || 1) || products.length === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}