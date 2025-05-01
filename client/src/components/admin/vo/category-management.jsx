import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Percent,
  XCircle,
  RefreshCcw,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useToggleCategoryListingMutation,
  useAddCategoryOfferMutation,
  useRemoveCategoryOfferMutation,
} from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import debounce from "lodash/debounce";

// Validation Schema (aligned with backend)
const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .matches(
      /^[a-zA-Z0-9\s\-\'\.]+$/,
      "Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods"
    )
    .test(
      "not-only-whitespace",
      "Name cannot be only whitespace",
      (value) => value && value.trim().length > 0
    ),
  description: Yup.string()
    .matches(
      /^[a-zA-Z0-9\s\.\,\!\?\-\']*$/,
      "Description can only contain letters, numbers, spaces, and basic punctuation"
    )
    .nullable(),
});

// AddCategoryOfferDialog Component
function AddCategoryOfferDialog({ category, onAddOffer, onClose }) {
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
        categoryId: category._id,
        discountPercentage: Number(offerData.discountPercentage),
        startDate: offerData.startDate,
        endDate: offerData.endDate,
      });
      onClose();
    } catch (error) {
      // Error is handled in the toast
    }
  };

  return (
    <Dialog open={!!category} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Offer for {category?.name}</DialogTitle>
          <DialogDescription>
            Enter the offer details to apply a discount to this category.
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

export default function CategoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [offerCategory, setOfferCategory] = useState(null);

  const debouncedSetSearch = debounce((value) => {
    setDebouncedSearchTerm(value);
    setCurrentPage(1);
  }, 500);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    refetch,
  } = useGetCategoriesQuery({
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm,
  });
  const categories = categoriesData?.categories || [];
  const totalPages = categoriesData?.totalPages || 1;
  console.log("category data", categories);

  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [toggleCategoryListing] = useToggleCategoryListingMutation();
  const [addCategoryOffer] = useAddCategoryOfferMutation();
  const [removeCategoryOffer] = useRemoveCategoryOfferMutation();

  const handleToggleCategoryListing = async (id) => {
    try {
      await toggleCategoryListing(id).unwrap();
      toast.success("Category listing status toggled successfully!");
    } catch (error) {
      const errorMessage =
        error?.data?.message || "Failed to toggle category listing";
      toast.error(errorMessage);
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleAddCategoryOffer = async (offerData) => {
    return toast.promise(addCategoryOffer(offerData).unwrap(), {
      loading: "Adding offer, please wait...",
      success: (data) =>
        `Offer added successfully to ${data.category?.name || "Category"}`,
      error: (error) =>
        `Failed to add offer: ${error?.data?.message || error.message}`,
    });
  };

  const handleRemoveCategoryOffer = async (categoryId) => {
    return toast.promise(removeCategoryOffer({ categoryId }).unwrap(), {
      loading: "Removing offer, please wait...",
      success: (data) =>
        `Offer removed successfully from ${data.category?.name || "Category"}`,
      error: (error) =>
        `Failed to remove offer: ${error?.data?.message || error.message}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for your products.
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{ name: "", description: "" }}
              validationSchema={categorySchema}
              onSubmit={async (
                values,
                { setSubmitting, resetForm, setStatus }
              ) => {
                try {
                  await addCategory(values).unwrap();
                  toast.success("Category added successfully!");
                  resetForm();
                  setIsAddDialogOpen(false);
                } catch (error) {
                  setStatus({
                    error: error?.data?.message || "Failed to add category",
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status }) => (
                <Form className="grid gap-4 py-4">
                  {status?.error && (
                    <p className="text-red-600 text-center">{status.error}</p>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <div className="col-span-3">
                      <Field name="name" as={Input} id="name" />
                      <ErrorMessage
                        name="name"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <div className="col-span-3">
                      <Field
                        name="description"
                        as={Textarea}
                        id="description"
                      />
                      <ErrorMessage
                        name="description"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || isAdding}>
                      {isSubmitting || isAdding ? "Saving..." : "Save Category"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" onClick={refetch}>
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="border rounded-md">
        {isCategoriesLoading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Offer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>{category._id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description || "N/A"}</TableCell>
                    <TableCell>{category.productCount || 0}</TableCell>
                    <TableCell>
                      {category.offer && category.offer.isActive
                        ? `${category.offer.discountPercentage}%`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          category.isListed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isListed ? "Listed" : "Unlisted"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {category.offer && category.offer.isActive ? (
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
                                <AlertDialogTitle>
                                  Remove Offer
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the offer from
                                  "{category.name}"? This will remove the
                                  discount from all products in this category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRemoveCategoryOffer(category._id)
                                  }
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
                            onClick={() => setOfferCategory(category)}
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
                              title={category.isListed ? "Unlist" : "List"}
                            >
                              {category.isListed ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {category.isListed
                                  ? "Unlist Category"
                                  : "List Category"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to{" "}
                                {category.isListed ? "unlist" : "list"} "
                                {category.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleToggleCategoryListing(category._id)
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
          </>
        )}
      </div>

      <AddCategoryOfferDialog
        category={offerCategory}
        onAddOffer={handleAddCategoryOffer}
        onClose={() => setOfferCategory(null)}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details.</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <Formik
              initialValues={{
                name: selectedCategory.name || "",
                description: selectedCategory.description || "",
              }}
              validationSchema={categorySchema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                const payload = { id: selectedCategory._id, ...values };
                try {
                  await updateCategory(payload).unwrap();
                  toast.success("Category updated successfully!");
                  setIsEditDialogOpen(false);
                } catch (error) {
                  const errorMessage =
                    error?.data?.message?.join(", ") ||
                    "Failed to update category";
                  setStatus({ error: errorMessage });
                  toast.error(errorMessage);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status }) => (
                <Form className="grid gap-4 py-4">
                  {status?.error && (
                    <p className="text-red-600 text-center">{status.error}</p>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <div className="col-span-3">
                      <Field name="name" as={Input} id="name" />
                      <ErrorMessage
                        name="name"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <div className="col-span-3">
                      <Field
                        name="description"
                        as={Textarea}
                        id="description"
                      />
                      <ErrorMessage
                        name="description"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || isUpdating}>
                      {isSubmitting || isUpdating
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {categories.length} of {categoriesData?.totalCategories || 0}{" "}
          categories
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isCategoriesLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || isCategoriesLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
