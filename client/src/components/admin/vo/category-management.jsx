import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
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
import { Switch } from "@/components/ui/switch";
import { Formik, Form, Field, ErrorMessage, useField } from "formik";
import * as Yup from "yup";
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useToggleCategoryListingMutation,
  useCreateCategoryOfferMutation,
  useUpdateCategoryOfferMutation,
  useDeleteCategoryOfferMutation,
} from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import debounce from "lodash/debounce";

// Custom Switch component to integrate with Formik
const FormikSwitch = ({ name, ...props }) => {
  const [field, meta, helpers] = useField(name);
  return (
    <Switch
      checked={field.value}
      onCheckedChange={(checked) => {
        helpers.setValue(checked);
      }}
      id={name}
      {...props}
    />
  );
};

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
  isListed: Yup.boolean().required("Listing status is required"),
  discountPercentage: Yup.number()
    .min(0, "Discount must be at least 0%")
    .max(80, "Discount cannot exceed 80%")
    .when("isActive", {
      is: true,
      then: (schema) =>
        schema.required("Discount percentage is required when offer is active"),
      otherwise: (schema) => schema.nullable(),
    }),
  startDate: Yup.date()
    .nullable()
    .when("isActive", {
      is: true,
      then: (schema) =>
        schema
          .required("Start date is required when offer is active")
          .typeError("Invalid date"),
      otherwise: (schema) => schema.nullable(),
    }),
  endDate: Yup.date()
    .nullable()
    .when("isActive", {
      is: true,
      then: (schema) =>
        schema
          .required("End date is required when offer is active")
          .typeError("Invalid date")
          .min(Yup.ref("startDate"), "End date cannot be before start date"),
      otherwise: (schema) => schema.nullable(),
    }),
  isActive: Yup.boolean(),
});

export default function CategoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  const debouncedSetSearch = debounce((value) => {
    setDebouncedSearchTerm(value);
    setCurrentPage(1);
  }, 800);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSetSearch(e.target.value);
  };

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({
      page: currentPage,
      limit: 10,
      search: debouncedSearchTerm,
    });
  const categories = categoriesData?.categories || [];
  const totalPages = categoriesData?.totalPages || 1;
  console.log(
    "this is the data from the category management component",
    categoriesData
  );

  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [toggleCategoryListing] = useToggleCategoryListingMutation();
  const [createCategoryOffer, { isLoading: isCreatingOffer }] =
    useCreateCategoryOfferMutation();
  const [updateCategoryOffer, { isLoading: isUpdatingOffer }] =
    useUpdateCategoryOfferMutation();
  const [deleteCategoryOffer, { isLoading: isDeletingOffer }] =
    useDeleteCategoryOfferMutation();

  const handleToggleCategoryListing = async (id) => {
    try {
      await toggleCategoryListing(id).unwrap();
      toast.success("Category listing status toggled successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to toggle category listing");
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleRemoveOffer = async (categoryId) => {
    try {
      await deleteCategoryOffer(categoryId).unwrap();
      toast.success("Category offer removed successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove offer");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
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
              initialValues={{
                name: "",
                description: "",
                isListed: true,
                discountPercentage: 0,
                startDate: "",
                endDate: "",
                isActive: false,
              }}
              validationSchema={categorySchema}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setPendingSubmit({ values, form: "add" });
                setIsConfirmDialogOpen(true);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, values, errors }) => (
                <Form className="grid gap-4 py-4">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isListed" className="text-right">
                      Listed
                    </Label>
                    <div className="col-span-3">
                      <FormikSwitch name="isListed" />
                      <ErrorMessage
                        name="isListed"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isActive" className="text-right">
                      Offer Active
                    </Label>
                    <div className="col-span-3">
                      <FormikSwitch name="isActive" />
                      <ErrorMessage
                        name="isActive"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  {values.isActive && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="discountPercentage"
                          className="text-right"
                        >
                          Discount (%)
                        </Label>
                        <div className="col-span-3">
                          <Field
                            name="discountPercentage"
                            type="number"
                            as={Input}
                            id="discountPercentage"
                          />
                          <ErrorMessage
                            name="discountPercentage"
                            component="p"
                            className="text-red-600 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                          Start Date
                        </Label>
                        <div className="col-span-3">
                          <Field
                            name="startDate"
                            type="date"
                            as={Input}
                            id="startDate"
                          />
                          <ErrorMessage
                            name="startDate"
                            component="p"
                            className="text-red-600 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">
                          End Date
                        </Label>
                        <div className="col-span-3">
                          <Field
                            name="endDate"
                            type="date"
                            as={Input}
                            id="endDate"
                          />
                          <ErrorMessage
                            name="endDate"
                            component="p"
                            className="text-red-600 text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isAdding || isCreatingOffer}
                    >
                      {isSubmitting || isAdding || isCreatingOffer
                        ? "Saving..."
                        : "Save Category"}
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
                      {category.offer?.isActive ? (
                        <span className="text-blue-600">
                          {category.offer.discountPercentage}% (Ends:{" "}
                          {formatDate(category.offer.endDate)})
                        </span>
                      ) : (
                        "No Offer"
                      )}
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
                          disabled={isUpdating || isUpdatingOffer}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={category.isListed ? "Unlist" : "List"}
                              disabled={isUpdating || isUpdatingOffer}
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
                        {category.offer?.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Remove Offer"
                                disabled={isDeletingOffer}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove Offer
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the offer from
                                  "{category.name}"? This will reset product
                                  prices.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRemoveOffer(category._id)
                                  }
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

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
                isListed: selectedCategory.isListed || true,
                discountPercentage:
                  selectedCategory.offer?.discountPercentage || 0,
                startDate: selectedCategory.offer?.startDate
                  ? formatDate(selectedCategory.offer.startDate)
                  : "",
                endDate: selectedCategory.offer?.endDate
                  ? formatDate(selectedCategory.offer.endDate)
                  : "",
                isActive: selectedCategory.offer?.isActive || false,
              }}
              validationSchema={categorySchema}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={async (values, { setSubmitting }) => {
                setPendingSubmit({ values, form: "edit" });
                setIsConfirmDialogOpen(true);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, values, errors }) => (
                <Form className="grid gap-4 py-4">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isListed" className="text-right">
                      Listed
                    </Label>
                    <div className="col-span-3">
                      <FormikSwitch name="isListed" />
                      <ErrorMessage
                        name="isListed"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isActive" className="text-right">
                      Offer Active
                    </Label>
                    <div className="col-span-3">
                      <FormikSwitch name="isActive" />
                      <ErrorMessage
                        name="isActive"
                        component="p"
                        className="text-red-600 text-sm"
                      />
                    </div>
                  </div>
                  {values.isActive && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="discountPercentage"
                          className="text-right"
                        >
                          Discount (%)
                        </Label>
                        <div className="col-span-3">
                          <Field
                            name="discountPercentage"
                            type="number"
                            as={Input}
                            id="discountPercentage"
                          />
                          <ErrorMessage
                            name="discountPercentage"
                            component="p"
                            className="text-red-600 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                          Start Date
                        </Label>
                        <div className="col-span-3">
                          <Field
                            name="startDate"
                            type="date"
                            as={Input}
                            id="startDate"
                          />
                          <ErrorMessage
                            name="startDate"
                            component="p"
                            className="text-red-600 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">
                          End Date
                        </Label>
                        <div className="col-span-3">
                          <Field
                            name="endDate"
                            type="date"
                            as={Input}
                            id="endDate"
                          />
                          <ErrorMessage
                            name="endDate"
                            component="p"
                            className="text-red-600 text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isUpdating || isUpdatingOffer}
                    >
                      {isSubmitting || isUpdating || isUpdatingOffer
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

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Category Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSubmit?.values.isActive
                ? "Applying or updating an offer will change product prices in this category. Are you sure you want to proceed?"
                : "Are you sure you want to save these changes?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSubmit(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const { values, form } = pendingSubmit;
                try {
                  if (form === "add") {
                    const { category: newCategory } = await addCategory({
                      name: values.name,
                      description: values.description,
                      isListed: values.isListed,
                    }).unwrap();
                    if (values.isActive) {
                      await createCategoryOffer({
                        categoryId: newCategory._id,
                        discountPercentage: values.discountPercentage,
                        startDate: values.startDate,
                        endDate: values.endDate,
                      }).unwrap();
                    }
                    toast.success("Category added successfully!");
                    setIsAddDialogOpen(false);
                  } else if (form === "edit") {
                    await updateCategory({
                      id: selectedCategory._id,
                      name: values.name,
                      description: values.description,
                      isListed: values.isListed,
                    }).unwrap();
                    if (values.isActive) {
                      await updateCategoryOffer({
                        categoryId: selectedCategory._id,
                        discountPercentage: values.discountPercentage,
                        startDate: values.startDate,
                        endDate: values.endDate,
                        isActive: values.isActive,
                      }).unwrap();
                    } else if (selectedCategory.offer?.isActive) {
                      await deleteCategoryOffer(selectedCategory._id).unwrap();
                    }
                    toast.success("Category updated successfully!");
                    setIsEditDialogOpen(false);
                  }
                } catch (error) {
                  toast.error(
                    error?.data?.message ||
                      `Failed to ${form === "add" ? "add" : "update"} category`
                  );
                } finally {
                  setPendingSubmit(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
