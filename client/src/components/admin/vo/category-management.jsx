import { useState } from "react";
import { Plus, Search, Edit, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import debounce from "lodash/debounce";

// Validation Schema (aligned with backend)
const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .matches(/^[a-zA-Z0-9\s\-\'\.]+$/, "Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods")
    .test("not-only-whitespace", "Name cannot be only whitespace", (value) => value && value.trim().length > 0),
  description: Yup.string()
    .matches(/^[a-zA-Z0-9\s\.\,\!\?\-\']*$/, "Description can only contain letters, numbers, spaces, and basic punctuation")
    .nullable(),
});

export default function CategoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // Track the category being edited

  const debouncedSetSearch = debounce((value) => {
    setDebouncedSearchTerm(value);
    setCurrentPage(1);
  }, 500);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery({
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm,
  });
  const categories = categoriesData?.categories || [];
  const totalPages = categoriesData?.totalPages || 1;

  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [toggleCategoryListing] = useToggleCategoryListingMutation();

  const handleToggleCategoryListing = async (id) => {
    try {
      await toggleCategoryListing(id).unwrap();
      toast.success("Category listing status toggled successfully!");
    } catch (error) {
      const errorMessage = error?.data?.message || "Failed to toggle category listing";
      toast.error(errorMessage);
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
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
              <DialogDescription>Create a new category for your products.</DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={{ name: "", description: "" }}
              validationSchema={categorySchema}
              onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
                try {
                  await addCategory(values).unwrap();
                  toast.success("Category added successfully!");
                  resetForm();
                  setIsAddDialogOpen(false);
                } catch (error) {
                  setStatus({ error: error?.data?.message || "Failed to add category" });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status }) => (
                <Form className="grid gap-4 py-4">
                  {status?.error && <p className="text-red-600 text-center">{status.error}</p>}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <div className="col-span-3">
                      <Field name="name" as={Input} id="name" />
                      <ErrorMessage name="name" component="p" className="text-red-600 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <div className="col-span-3">
                      <Field name="description" as={Textarea} id="description" />
                      <ErrorMessage name="description" component="p" className="text-red-600 text-sm" />
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
                    <TableCell>{category.products?.length || 0}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          category.isListed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title={category.isListed ? "Unlist" : "List"}>
                              {category.isListed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{category.isListed ? "Unlist Category" : "List Category"}</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to {category.isListed ? "unlist" : "list"} "{category.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggleCategoryListing(category._id)}>
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

      {/* Single Edit Dialog outside the map */}
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
                  const errorMessage = error?.data?.message?.join(", ") || "Failed to update category";
                  setStatus({ error: errorMessage });
                  toast.error(errorMessage);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status }) => (
                <Form className="grid gap-4 py-4">
                  {status?.error && <p className="text-red-600 text-center">{status.error}</p>}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <div className="col-span-3">
                      <Field name="name" as={Input} id="name" />
                      <ErrorMessage name="name" component="p" className="text-red-600 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <div className="col-span-3">
                      <Field name="description" as={Textarea} id="description" />
                      <ErrorMessage name="description" component="p" className="text-red-600 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || isUpdating}>
                      {isSubmitting || isUpdating ? "Saving..." : "Save Changes"}
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
          Showing {categories.length} of {categoriesData?.totalCategories || 0} categories
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isCategoriesLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}