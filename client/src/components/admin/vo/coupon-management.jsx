import { useState } from "react";
import { Plus, Search, Edit, Trash, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from "@/store/api/adminApiSlice";
import { format } from "date-fns"; // For date formatting

export default function CouponManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // State for validation errors
  const itemsPerPage = 10;

  // Fetch coupons
  const {
    data: couponData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCouponsQuery({
    search: searchTerm,
    status: statusFilter,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const coupons = couponData?.coupons || [];
  const totalPages = couponData?.totalPages || 1;
  const totalCoupons = couponData?.total || 0;

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    restrictions: {
      newCustomersOnly: false,
      onePerCustomer: false,
    },
    description: "",
  });

  // Reset form
  const resetForm = () => {
    console.log("Resetting form");
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      restrictions: {
        newCustomersOnly: false,
        onePerCustomer: false,
      },
      description: "",
    });
    setFormErrors({});
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user types
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle restriction changes
  const handleRestrictionChange = (field, checked) => {
    console.log(`Restriction changed: ${field} = ${checked}`);
    setFormData((prev) => ({
      ...prev,
      restrictions: {
        ...prev.restrictions,
        [field]: checked,
      },
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.code.trim()) {
      errors.code = "Coupon code is required";
    } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{3,}$/.test(formData.code.trim())) {
      errors.code = "Coupon code must be at least 3 alphanumeric characters";
    }
  
    if (!["percentage", "fixed", "shipping"].includes(formData.discountType)) {
      errors.discountType = "Invalid discount type";
    }
    
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      errors.discountValue = "Discount value must be positive";
    }
    
    if (formData.minPurchase && Number(formData.minPurchase) < 0) {
      errors.minPurchase = "Minimum purchase cannot be negative";
    }
    
    if (!formData.startDate) errors.startDate = "Start date is required";
    
    if (!formData.endDate) errors.endDate = "End date is required";
    
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = "End date must be after start date";
    }
    
    if (!formData.usageLimit || Number(formData.usageLimit) < 1) {
      errors.usageLimit = "Usage limit must be at least 1";
    }
    
    return errors;
  };

  // Handle add coupon
  const handleAddCoupon = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Keep dialog open with errors
    }

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase) || 0,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        usageLimit: Number(formData.usageLimit),
        restrictions: formData.restrictions,
        description: formData.description,
      };
      console.log("Creating coupon:", couponData);
      await createCoupon(couponData).unwrap();
      resetForm();
      setIsDialogOpen(false);
      refetch();
    } catch (err) {
      console.error("Create coupon error:", err);
      setFormErrors({ general: err?.data?.message || "Failed to create coupon" });
    }
  };

  // Handle edit coupon
  const handleEditCoupon = (coupon) => {
    console.log("Editing coupon:", coupon);
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || "",
      minPurchase: coupon.minPurchase || "",
      startDate: coupon.startDate ? format(new Date(coupon.startDate), "yyyy-MM-dd") : "",
      endDate: coupon.endDate ? format(new Date(coupon.endDate), "yyyy-MM-dd") : "",
      usageLimit: coupon.usageLimit || "",
      restrictions: {
        newCustomersOnly: coupon.restrictions?.newCustomersOnly || false,
        onePerCustomer: coupon.restrictions?.onePerCustomer || false,
      },
      description: coupon.description || "",
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Handle update coupon
  const handleUpdateCoupon = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return; // Keep dialog open with errors
    }

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minPurchase: Number(formData.minPurchase) || 0,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        usageLimit: Number(formData.usageLimit),
        restrictions: formData.restrictions,
        description: formData.description,
      };
      console.log("Updating coupon:", { id: editingCoupon._id, couponData });
      await updateCoupon({ id: editingCoupon._id, couponData }).unwrap();
      setEditingCoupon(null);
      resetForm();
      setIsDialogOpen(false);
      refetch();
    } catch (err) {
      console.error("Update coupon error:", err);
      setFormErrors({ general: err?.data?.message || "Failed to update coupon" });
    }
  };

  // Handle delete coupon
  const handleDeleteCoupon = async (id) => {
    try {
      console.log("Deleting coupon:", id);
      await deleteCoupon(id).unwrap();
      refetch();
    } catch (err) {
      console.error("Delete coupon error:", err);
      // Handle delete errors if needed
    }
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  if (isLoading) return <div>Loading coupons...</div>;
  if (isError) return <div>Error: {error?.data?.message || "Failed to load coupons"}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCoupon(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? "Update the coupon details." : "Create a new discount coupon for your customers."}
              </DialogDescription>
            </DialogHeader>
            {formErrors.general && (
              <div className="text-red-500 text-sm text-center">{formErrors.general}</div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Code
                </Label>
                <div className="col-span-3">
                  <Input
                    id="code"
                    name="code"
                    className="w-full"
                    placeholder="e.g. SUMMER20"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                  {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountType" className="text-right">
                  Type
                </Label>
                <div className="col-span-3">
                  <Select
                    name="discountType"
                    value={formData.discountType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, discountType: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.discountType && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.discountType}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountValue" className="text-right">
                  Value
                </Label>
                <div className="col-span-3">
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    className="w-full"
                    placeholder={formData.discountType === "percentage" ? "e.g. 20" : "e.g. 500"}
                    value={formData.discountValue}
                    onChange={handleInputChange}
                  />
                  {formErrors.discountValue && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.discountValue}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minPurchase" className="text-right">
                  Min Purchase
                </Label>
                <div className="col-span-3">
                  <Input
                    id="minPurchase"
                    name="minPurchase"
                    type="number"
                    className="w-full"
                    placeholder="e.g. 1000"
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                  />
                  {formErrors.minPurchase && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.minPurchase}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <div className="col-span-3">
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="w-full"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <div className="col-span-3">
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="w-full"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                  {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usageLimit" className="text-right">
                  Usage Limit
                </Label>
                <div className="col-span-3">
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    className="w-full"
                    placeholder="e.g. 100"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                  />
                  {formErrors.usageLimit && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.usageLimit}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">
                  <Label>Restrictions</Label>
                </div>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newCustomersOnly"
                      checked={formData.restrictions.newCustomersOnly}
                      onCheckedChange={(checked) => handleRestrictionChange("newCustomersOnly", checked)}
                    />
                    <Label htmlFor="newCustomersOnly">New customers only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onePerCustomer"
                      checked={formData.restrictions.onePerCustomer}
                      onCheckedChange={(checked) => handleRestrictionChange("onePerCustomer", checked)}
                    />
                    <Label htmlFor="onePerCustomer">One per customer</Label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <div className="col-span-3">
                  <Input
                    id="description"
                    name="description"
                    className="w-full"
                    placeholder="e.g. Summer Sale Discount"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={editingCoupon ? handleUpdateCoupon : handleAddCoupon}
                disabled={isCreating || isUpdating}
              >
                {editingCoupon ? "Save Changes" : "Save Coupon"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search coupons..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon._id}>
                <TableCell>{coupon._id}</TableCell>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>{coupon.discountType.charAt(0).toUpperCase() + coupon.discountType.slice(1)}</TableCell>
                <TableCell>
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : coupon.discountType === "fixed"
                      ? `₹${coupon.discountValue}`
                      : "Free Shipping"}
                </TableCell>
                <TableCell>{coupon.minPurchase ? `₹${coupon.minPurchase}` : "None"}</TableCell>
                <TableCell>{format(new Date(coupon.startDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>{format(new Date(coupon.endDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      coupon.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : coupon.status === "Scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {coupon.status}
                  </span>
                </TableCell>
                <TableCell>
                  {coupon.usageCount}/{coupon.usageLimit}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCoupon(coupon)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isDeleting}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Coupon</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this coupon? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            disabled={isDeleting}
                          >
                            Delete Coupon
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {coupons.length} of {totalCoupons} coupons
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || coupons.length === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}