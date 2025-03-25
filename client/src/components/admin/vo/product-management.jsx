import { useState, useCallback, useRef,useEffect } from "react";
import { Plus, Search, Edit, ChevronLeft, ChevronRight, Filter, X, Eye, EyeOff, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  useAddProductMutation,
  useGetCategoriesQuery,
  useGetAdminProductsQuery,
  useUpdateProductMutation,
  useToggleProductListingMutation,
} from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import { debounce } from 'lodash';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import { productSchema } from '@/utils/schemas';

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

// ProductTable Component
function ProductTable({ products, pagination, currentPage, setCurrentPage, isLoading, error, onEdit, onToggle }) {
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
                <path d="M6 2a1 1 0 0 0-1 1v17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a1 1 0 0 0-1-1H6zm11 2v4H7V4h10zM7 10h10v10H7V10zm5 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
            </div>
            <p className="text-brown-700 mt-2 text-lg font-medium">Packing your coffee beans...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-red-600 text-lg font-medium">Error loading products: {error?.data?.message || error.message}</p>
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
                    {product.variants.length > 0 ? `₹${product.variants[0].actualPrice}` : `₹${product.actualPrice || "N/A"}`}
                  </TableCell>
                  <TableCell>{product.totalStock}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        product.isListed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isListed ? "Listed" : "Unlisted"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title={product.isListed ? "Unlist" : "List"}>
                            {product.isListed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{product.isListed ? "Unlist Product" : "List Product"}</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to {product.isListed ? "unlist" : "list"} "{product.name}"?
                              This will {product.isListed ? "hide" : "show"} it from/to customers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onToggle(product._id, product.isListed)}>
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

function AddProductDialog({ categories, onAddProduct }) {
  const [useVariants, setUseVariants] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  const initialValues = {
    name: '',
    description: '',
    actualPrice: '',
    salePrice: '',
    totalStock: '',
    category: '',
    isFeatured: false,
    variants: [],
    images: [],
    imagePreviews: [],
  };

  const handleImageUpload = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result);
        setIsCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
    fileInputRef.current.value = null;
  };

  const handleCropComplete = useCallback((c) => setCompletedCrop(c), []);

  const saveCroppedImage = (setFieldValue, values) => {
    if (!imageRef.current || !completedCrop?.width || !completedCrop?.height) return;
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        setFieldValue('images', [...values.images, blob]);
        setFieldValue('imagePreviews', [...values.imagePreviews, previewUrl]);
        setCurrentImage(null);
        setCompletedCrop(null);
        setIsCropDialogOpen(false);
      }
    }, 'image/jpeg');
  };

  const removeImage = (index, values, setFieldValue) => {
    const newImages = values.images.filter((_, i) => i !== index);
    const newPreviews = values.imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(values.imagePreviews[index]);
    setFieldValue('images', newImages);
    setFieldValue('imagePreviews', newPreviews);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Fill in the details to add a new product to your inventory.</DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={productSchema(useVariants)}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            const productData = new FormData();
            productData.append('name', values.name);
            productData.append('description', values.description);
            productData.append('category', values.category);
            productData.append('isFeatured', values.isFeatured);

            if (!useVariants) {
              productData.append('actualPrice', Number(values.actualPrice));
              if (values.salePrice) productData.append('salePrice', Number(values.salePrice));
              productData.append('stock', Number(values.totalStock));
            } else if (values.variants.length > 0) {
              productData.append('variants', JSON.stringify(values.variants));
            }

            values.images.forEach((image, index) => productData.append('images', image, `image-${index}.jpg`));

            try {
              await onAddProduct(productData);
              resetForm();
              values.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => (
            <>
              <Form className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Field as={Input} id="name" name="name" className="col-span-3" />
                    <ErrorMessage name="name" component="div" className="col-span-3 text-red-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Field as={Textarea} id="description" name="description" className="col-span-3" />
                    <ErrorMessage name="description" component="div" className="col-span-3 text-red-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Field name="category">
                      {({ field }) => (
                        <Select
                          {...field}
                          onValueChange={(value) => setFieldValue('category', value)}
                          value={values.category}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.categories.map((val) => (
                              <SelectItem key={val._id} value={val._id}>{val.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="category" component="div" className="col-span-3 text-red-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Use Variants</Label>
                    <Switch
                      checked={useVariants}
                      onCheckedChange={(checked) => {
                        setUseVariants(checked);
                        if (!checked) {
                          setFieldValue('variants', []);
                          setFieldValue('actualPrice', '');
                          setFieldValue('salePrice', '');
                          setFieldValue('totalStock', '');
                        }
                      }}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {!useVariants && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="actualPrice" className="text-right">Actual Price</Label>
                        <Field
                          as={Input}
                          id="actualPrice"
                          name="actualPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={useVariants}
                          className="col-span-3"
                        />
                        <ErrorMessage name="actualPrice" component="div" className="col-span-3 text-red-500 text-sm" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salePrice" className="text-right">Sale Price (optional)</Label>
                        <Field
                          as={Input}
                          id="salePrice"
                          name="salePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={useVariants}
                          className="col-span-3"
                        />
                        <ErrorMessage name="salePrice" component="div" className="col-span-3 text-red-500 text-sm" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="totalStock" className="text-right">Stock</Label>
                        <Field
                          as={Input}
                          id="totalStock"
                          name="totalStock"
                          type="number"
                          min="0"
                          disabled={useVariants}
                          className="col-span-3"
                        />
                        <ErrorMessage name="totalStock" component="div" className="col-span-3 text-red-500 text-sm" />
                      </div>
                    </>
                  )}
                  {useVariants && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right mt-2">Variants</Label>
                      <div className="col-span-3 space-y-4">
                        <FieldArray name="variants">
                          {({ push, remove }) => (
                            <>
                              {values.variants.map((variant, index) => (
                                <div key={index} className="grid grid-cols-6 gap-2 items-center">
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.size`}
                                    type="number"
                                    placeholder="Size"
                                    min="0"
                                    step="0.1"
                                    className="col-span-2"
                                  />
                                  <Field name={`variants.${index}.unit`}>
                                    {({ field }) => (
                                      <Select
                                        {...field}
                                        onValueChange={(value) => setFieldValue(`variants.${index}.unit`, value)}
                                        value={variant.unit}
                                      >
                                        <SelectTrigger className="col-span-1">
                                          <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="kg">kg</SelectItem>
                                          <SelectItem value="g">g</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </Field>
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.actualPrice`}
                                    type="number"
                                    placeholder="Actual Price"
                                    min="0"
                                    step="0.01"
                                    className="col-span-2"
                                  />
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.salePrice`}
                                    type="number"
                                    placeholder="Sale Price"
                                    min="0"
                                    step="0.01"
                                    className="col-span-2"
                                  />
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.stock`}
                                    type="number"
                                    placeholder="Stock"
                                    min="0"
                                    className="col-span-2"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="col-span-1 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <div className="col-span-6">
                                    <ErrorMessage
                                      name={`variants.${index}.size`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.unit`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.actualPrice`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.salePrice`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.stock`}
                                      component="span"
                                      className="text-red-500 text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                onClick={() => push({ size: '', unit: 'kg', actualPrice: '', salePrice: '', stock: '' })}
                                variant="outline"
                              >
                                Add Variant
                              </Button>
                              <ErrorMessage name="variants" component="div" className="text-red-500 text-sm" />
                            </>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="images" className="text-right">Images</Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFieldValue)}
                      ref={fileInputRef}
                      className="col-span-3"
                    />
                    {values.imagePreviews.length === 0 && (
                      <div className="col-span-3 text-red-500 text-sm">At least one image is required</div>
                    )}
                  </div>
                  {values.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right mt-2">Image Previews</Label>
                      <div className="col-span-3 flex flex-wrap gap-2">
                        {values.imagePreviews.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index, values, setFieldValue)}
                              className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Featured</Label>
                    <Field name="isFeatured">
                      {({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => setFieldValue('isFeatured', checked)}
                          className="col-span-3"
                        />
                      )}
                    </Field>
                  </div>
                </div>
                <DialogFooter className="col-span-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || values.imagePreviews.length === 0}
                  >
                    {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Add Product'}
                  </Button>
                </DialogFooter>
              </Form>

              {/* Crop Dialog inside Formik */}
              <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>Adjust the crop area and save or cancel.</DialogDescription>
                  </DialogHeader>
                  {currentImage && (
                    <div className="space-y-4">
                      <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={handleCropComplete}>
                        <img ref={imageRef} src={currentImage} alt="Crop preview" />
                      </ReactCrop>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentImage(null);
                            setCompletedCrop(null);
                            setIsCropDialogOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => saveCroppedImage(setFieldValue, values)}
                          disabled={!completedCrop}
                        >
                          Save Crop
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

// EditProductDialog Component
function EditProductDialog({ product, categories, onUpdate, onClose }) {
  const [useVariants, setUseVariants] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setUseVariants(product.variants?.length > 0);
    }
  }, [product]);

  const initialValues = product
    ? {
        _id: product._id || '',
        name: product.name || '',
        description: product.description || '',
        actualPrice: product.actualPrice || '',
        salePrice: product.salePrice || '',
        totalStock: product.totalStock || '',
        category: product.category?._id || '',
        isFeatured: product.isFeatured || false,
        variants: product.variants?.map((v) => ({
          _id: v._id || '',
          size: v.size || '',
          unit: v.unit || 'kg',
          actualPrice: v.actualPrice || '',
          salePrice: v.salePrice || '',
          stock: v.stock || '',
        })) || [],
        images: [],
        imagePreviews: product.images || [],
        deletedImages: [],
      }
    : {
        _id: '',
        name: '',
        description: '',
        actualPrice: '',
        salePrice: '',
        totalStock: '',
        category: '',
        isFeatured: false,
        variants: [],
        images: [],
        imagePreviews: [],
        deletedImages: [],
      };

  const handleImageUpload = (e, setFieldValue) => {
    const file = e.target.files[0]; // Handle one file at a time for cropping
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result);
        setIsCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
    fileInputRef.current.value = null;
  };

  const handleCropComplete = useCallback((c) => setCompletedCrop(c), []);

  const saveCroppedImage = (setFieldValue, values) => {
    if (!imageRef.current || !completedCrop?.width || !completedCrop?.height) return;
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        setFieldValue('images', [...values.images, blob]);
        setFieldValue('imagePreviews', [...values.imagePreviews, previewUrl]);
        setCurrentImage(null);
        setCompletedCrop(null);
        setIsCropDialogOpen(false);
      }
    }, 'image/jpeg');
  };

  const removeImage = (index, values, setFieldValue) => {
    const imageToRemove = values.imagePreviews[index];
    if (product.images.includes(imageToRemove)) {
      setFieldValue('deletedImages', [...values.deletedImages, imageToRemove]);
      setFieldValue('imagePreviews', values.imagePreviews.filter((_, i) => i !== index));
    } else {
      const newImageIndex = values.imagePreviews.indexOf(imageToRemove) - (product.images.length - values.deletedImages.length);
      const newImages = values.images.filter((_, i) => i !== newImageIndex);
      setFieldValue('images', newImages);
      setFieldValue('imagePreviews', values.imagePreviews.filter((_, i) => i !== index));
      URL.revokeObjectURL(imageToRemove);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details below.</DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={productSchema(useVariants)}
          onSubmit={async (values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append('_id', values._id);
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('category', values.category);
            formData.append('isFeatured', values.isFeatured);

            if (!useVariants) {
              formData.append('actualPrice', Number(values.actualPrice) || 0);
              if (values.salePrice) formData.append('salePrice', Number(values.salePrice));
              formData.append('stock', Number(values.totalStock) || 0);
              formData.append('variants', JSON.stringify([]));
            } else if (values.variants.length > 0) {
              formData.append('variants', JSON.stringify(values.variants));
            }

            if (values.deletedImages.length > 0) {
              formData.append('deletedImages', JSON.stringify(values.deletedImages));
            }

            values.images.forEach((image) => formData.append('images', image));

            try {
              await onUpdate(formData);
              onClose();
            } catch (error) {
              console.error('Error updating product:', error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => (
            <>
              <Form className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Field as={Input} id="name" name="name" className="col-span-3" />
                    <ErrorMessage name="name" component="div" className="col-span-3 text-red-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Field as={Textarea} id="description" name="description" className="col-span-3" />
                    <ErrorMessage name="description" component="div" className="col-span-3 text-red-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Field name="category">
                      {({ field }) => (
                        <Select
                          {...field}
                          onValueChange={(value) => setFieldValue('category', value)}
                          value={values.category}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.categories.map((val) => (
                              <SelectItem key={val._id} value={val._id}>{val.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage name="category" component="div" className="col-span-3 text-red-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Use Variants</Label>
                    <Switch
                      checked={useVariants}
                      onCheckedChange={(checked) => {
                        setUseVariants(checked);
                        if (!checked) {
                          setFieldValue('variants', []);
                        }
                      }}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {!useVariants && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="actualPrice" className="text-right">Actual Price</Label>
                        <Field
                          as={Input}
                          id="actualPrice"
                          name="actualPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={useVariants}
                          className="col-span-3"
                        />
                        <ErrorMessage name="actualPrice" component="div" className="col-span-3 text-red-500 text-sm" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salePrice" className="text-right">Sale Price (optional)</Label>
                        <Field
                          as={Input}
                          id="salePrice"
                          name="salePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={useVariants}
                          className="col-span-3"
                        />
                        <ErrorMessage name="salePrice" component="div" className="col-span-3 text-red-500 text-sm" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="totalStock" className="text-right">Stock</Label>
                        <Field
                          as={Input}
                          id="totalStock"
                          name="totalStock"
                          type="number"
                          min="0"
                          disabled={useVariants}
                          className="col-span-3"
                        />
                        <ErrorMessage name="totalStock" component="div" className="col-span-3 text-red-500 text-sm" />
                      </div>
                    </>
                  )}
                  {useVariants && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right mt-2">Variants</Label>
                      <div className="col-span-3 space-y-4">
                        <FieldArray name="variants">
                          {({ push, remove }) => (
                            <>
                              {values.variants.map((variant, index) => (
                                <div key={index} className="grid grid-cols-6 gap-2 items-center">
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.size`}
                                    type="number"
                                    placeholder="Size"
                                    min="0"
                                    step="0.1"
                                    className="col-span-2"
                                  />
                                  <Field name={`variants.${index}.unit`}>
                                    {({ field }) => (
                                      <Select
                                        {...field}
                                        onValueChange={(value) => setFieldValue(`variants.${index}.unit`, value)}
                                        value={variant.unit}
                                      >
                                        <SelectTrigger className="col-span-1">
                                          <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="kg">kg</SelectItem>
                                          <SelectItem value="g">g</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </Field>
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.actualPrice`}
                                    type="number"
                                    placeholder="Actual Price"
                                    min="0"
                                    step="0.01"
                                    className="col-span-2"
                                  />
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.salePrice`}
                                    type="number"
                                    placeholder="Sale Price"
                                    min="0"
                                    step="0.01"
                                    className="col-span-2"
                                  />
                                  <Field
                                    as={Input}
                                    name={`variants.${index}.stock`}
                                    type="number"
                                    placeholder="Stock"
                                    min="0"
                                    className="col-span-2"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="col-span-1 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <div className="col-span-6">
                                    <ErrorMessage
                                      name={`variants.${index}.size`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.unit`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.actualPrice`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.salePrice`}
                                      component="span"
                                      className="text-red-500 text-sm mr-2"
                                    />
                                    <ErrorMessage
                                      name={`variants.${index}.stock`}
                                      component="span"
                                      className="text-red-500 text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                onClick={() => push({ size: '', unit: 'kg', actualPrice: '', salePrice: '', stock: '' })}
                                variant="outline"
                              >
                                Add Variant
                              </Button>
                              <ErrorMessage name="variants" component="div" className="text-red-500 text-sm" />
                            </>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="images" className="text-right">Images</Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFieldValue)}
                      ref={fileInputRef}
                      className="col-span-3"
                    />
                  </div>
                  {values.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right mt-2">Image Previews</Label>
                      <div className="col-span-3 flex flex-wrap gap-2">
                        {values.imagePreviews.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index, values, setFieldValue)}
                              className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Featured</Label>
                    <Field name="isFeatured">
                      {({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => setFieldValue('isFeatured', checked)}
                          className="col-span-3"
                        />
                      )}
                    </Field>
                  </div>
                </div>
                <DialogFooter className="col-span-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </Form>

              {/* Crop Dialog */}
              <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>Adjust the crop area and save or cancel.</DialogDescription>
                  </DialogHeader>
                  {currentImage && (
                    <div className="space-y-4">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={handleCropComplete}
                      >
                        <img ref={imageRef} src={currentImage} alt="Crop preview" />
                      </ReactCrop>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentImage(null);
                            setCompletedCrop(null);
                            setIsCropDialogOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => saveCroppedImage(setFieldValue, values)}
                          disabled={!completedCrop}
                        >
                          Save Crop
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
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
    search: '',
  });
  const { data: productsData, isLoading: isProductsLoading, error } = useGetAdminProductsQuery({
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
  const pagination = productsData?.pagination || { totalPages: 1, totalProducts: 0 };

  const handleAddProduct = (productData) => {
    return toast.promise(
      addProduct(productData).unwrap(),
      {
        loading: 'Adding product, please wait...',
        success: (data) => `${data.name || "Product"} has been added successfully`,
        error: (error) => `Failed to add product: ${error?.data?.message || error.message}`,
      }
    );
  };

  const handleEditProduct = (product) => setEditProduct({
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

  const handleUpdateProduct = (formData) => {
    return toast.promise(
      updateProduct(formData).unwrap(), 
      {
        loading: 'Updating product, please wait...',
        success: (data) => `${data.product?.name || "Product"} has been updated successfully`,
        error: (error) => `Failed to update product: ${error?.data?.message || error.message || "Unknown error"}`,
      }
    );
  };

  const handleToggleProductListing = async (id, currentStatus) => {
    try {
      await toggleProductListing(id).unwrap();
      toast.success("Product listing status toggled successfully!");
    } catch (error) {
      toast.error("Error toggling product: " + (error?.data?.message || error.message));
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