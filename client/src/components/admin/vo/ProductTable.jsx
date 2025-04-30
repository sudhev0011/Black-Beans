import { useEffect, useState } from "react";
import { Edit, ChevronLeft, ChevronRight, Eye, EyeOff, Percent, XCircle } from "lucide-react";
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

// AddOfferDialog Component
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Offer for {product?.name}</DialogTitle>
          <DialogDescription>
            Enter the offer details to apply a discount to this product.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountPercentage" className="text-right">
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
              className="col-span-3"
              placeholder="e.g., 20"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={offerData.startDate}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={offerData.endDate}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Offer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  
}) {
  const [offerProduct, setOfferProduct] = useState(null);
console.log("products from the table",products);
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
                <TableHead>Offer</TableHead>
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
                      ? `₹${product.variants[0].salePrice}`
                      : `₹${product.salePrice || "N/A"}`}
                  </TableCell>
                  <TableCell>
                    {product.offer && product.offer.isActive
                      ? `${product.offer.discountPercentage}%`
                      : "-"}
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
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <AddOfferDialog
        product={offerProduct}
        onAddOffer={onAddOffer}
        onClose={() => setOfferProduct(null)}
      />
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
            disabled={currentPage === pagination.totalPages || products.length === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}