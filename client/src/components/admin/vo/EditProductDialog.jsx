import { useState, useCallback, useRef, useEffect } from "react";
import { X, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useUpdateProductMutation } from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { productSchema } from "@/utils/schemas";

export default function EditProductDialog({ product, categories, onClose }) {
  const [useVariants, setUseVariants] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  const [updateProduct] = useUpdateProductMutation();

  useEffect(() => {
    if (product) {
      setUseVariants(product.variants?.length > 0);
    }
  }, [product]);

  const initialValues = product
    ? {
        _id: product._id || "",
        name: product.name || "",
        description: product.description || "",
        actualPrice: product.actualPrice || "",
        salePrice: product.salePrice || "",
        totalStock: product.totalStock || "",
        category: product.category?._id || "",
        isFeatured: product.isFeatured || false,
        variants:
          product.variants?.map((v) => ({
            _id: v._id || "",
            size: v.size || "",
            unit: v.unit || "kg",
            actualPrice: v.actualPrice || "",
            salePrice: v.salePrice || "",
            stock: v.stock || "",
          })) || [],
        images: [],
        imagePreviews: product.images || [],
        deletedImages: [],
      }
    : {
        _id: "",
        name: "",
        description: "",
        actualPrice: "",
        salePrice: "",
        totalStock: "",
        category: "",
        isFeatured: false,
        variants: [],
        images: [],
        imagePreviews: [],
        deletedImages: [],
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
    if (!imageRef.current || !completedCrop?.width || !completedCrop?.height)
      return;
    const canvas = document.createElement("canvas");
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d");

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
        setFieldValue("images", [...values.images, blob]);
        setFieldValue("imagePreviews", [...values.imagePreviews, previewUrl]);
        setCurrentImage(null);
        setCompletedCrop(null);
        setIsCropDialogOpen(false);
      }
    }, "image/jpeg");
  };

  const removeImage = (index, values, setFieldValue) => {
    const imageToRemove = values.imagePreviews[index];
    if (product.images.includes(imageToRemove)) {
      setFieldValue("deletedImages", [...values.deletedImages, imageToRemove]);
      setFieldValue(
        "imagePreviews",
        values.imagePreviews.filter((_, i) => i !== index)
      );
    } else {
      const newImageIndex =
        values.imagePreviews.indexOf(imageToRemove) -
        (product.images.length - values.deletedImages.length);
      const newImages = values.images.filter((_, i) => i !== newImageIndex);
      setFieldValue("images", newImages);
      setFieldValue(
        "imagePreviews",
        values.imagePreviews.filter((_, i) => i !== index)
      );
      URL.revokeObjectURL(imageToRemove);
    }
  };

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

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1100px] h-[90vh] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product details below.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={productSchema(useVariants)}
          onSubmit={async (values, { setSubmitting }) => {
            const formData = new FormData();
            formData.append("_id", values._id);
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("category", values.category);
            formData.append("isFeatured", values.isFeatured);

            if (!useVariants) {
              formData.append("actualPrice", Number(values.actualPrice) || 0);
              if (values.salePrice)
                formData.append("salePrice", Number(values.salePrice));
              formData.append("stock", Number(values.totalStock) || 0);
              formData.append("variants", JSON.stringify([]));
            } else if (values.variants.length > 0) {
              formData.append("variants", JSON.stringify(values.variants));
            }

            if (values.deletedImages.length > 0) {
              formData.append(
                "deletedImages",
                JSON.stringify(values.deletedImages)
              );
            }

            values.images.forEach((image) => formData.append("images", image));

            try {
              await handleUpdateProduct(formData);
              onClose();
            } catch (error) {
              console.error("Error updating product:", error);
            } finally {
              setSubmitting(false);
            }
          }}
          context={{ useVariants }}
          validateOnMount
          validateOnChange
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => (
            <>
              <Form className="flex flex-col md:grid md:grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="name" className="sm:text-right">
                      Name
                    </Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      className="w-full sm:col-span-3"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm sm:col-start-2 sm:col-span-3"
                    />
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
                    <Label htmlFor="description" className="sm:text-right mt-2">
                      Description
                    </Label>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      className="w-full sm:col-span-3"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-sm sm:col-start-2 sm:col-span-3"
                    />
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="category" className="sm:text-right">
                      Category
                    </Label>
                    <div className="w-full sm:col-span-3">
                      <Field name="category">
                        {({ field }) => (
                          <Select
                            {...field}
                            onValueChange={(value) =>
                              setFieldValue("category", value)
                            }
                            value={values.category}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories?.categories.map((val) => (
                                <SelectItem key={val._id} value={val._id}>
                                  {val.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </Field>
                    </div>
                    <ErrorMessage
                      name="category"
                      component="div"
                      className="text-red-500 text-sm sm:col-start-2 sm:col-span-3"
                    />
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                    <Label className="sm:text-right">Use Variants</Label>
                    <Switch
                      checked={useVariants}
                      onCheckedChange={(checked) => {
                        setUseVariants(checked);
                        if (!checked) {
                          setFieldValue("variants", []);
                        }
                      }}
                      className="sm:col-span-3"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {!useVariants && (
                    <>
                      <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="actualPrice" className="sm:text-right">
                          Actual Price
                        </Label>
                        <Field
                          as={Input}
                          id="actualPrice"
                          name="actualPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={useVariants}
                          className="w-full sm:col-span-3"
                        />
                        <ErrorMessage
                          name="actualPrice"
                          component="div"
                          className="text-red-500 text-sm sm:col-start-2 sm:col-span-3"
                        />
                      </div>
                      <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="salePrice" className="sm:text-right">
                          Sale Price (optional)
                        </Label>
                        <Field
                          as={Input}
                          id="salePrice"
                          name="salePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={useVariants}
                          className="w-full sm:col-span-3"
                        />
                        <ErrorMessage
                          name="salePrice"
                          component="div"
                          className="text-red-500 text-sm sm:col-start-2 sm:col-span-3"
                        />
                      </div>
                      <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                        <Label htmlFor="totalStock" className="sm:text-right">
                          Stock
                        </Label>
                        <Field
                          as={Input}
                          id="totalStock"
                          name="totalStock"
                          type="number"
                          min="0"
                          disabled={useVariants}
                          className="w-full sm:col-span-3"
                        />
                        <ErrorMessage
                          name="totalStock"
                          component="div"
                          className="text-red-500 text-sm sm:col-start-2 sm:col-span-3"
                        />
                      </div>
                    </>
                  )}
                  {useVariants && (
                    <div className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
                      <Label className="sm:text-right mt-2">Variants</Label>
                      <div className="w-full sm:col-span-3 space-y-4">
                        <FieldArray name="variants">
                          {({ push, remove }) => (
                            <>
                              {values.variants.map((variant, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col gap-2 p-2 border rounded-md bg-gray-50"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">Variant {index + 1}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" /> 
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div className="col-span-1 sm:col-span-2">
                                      <Label>Size</Label>
                                      <div className="flex gap-2">
                                        <Field
                                          as={Input}
                                          name={`variants.${index}.size`}
                                          type="number"
                                          placeholder="Size"
                                          min="0"
                                          step="0.1"
                                          className="flex-grow"
                                        />
                                        <div className="w-16">
                                          <Field name={`variants.${index}.unit`}>
                                            {({ field }) => (
                                              <Select
                                                {...field}
                                                onValueChange={(value) =>
                                                  setFieldValue(
                                                    `variants.${index}.unit`,
                                                    value
                                                  )
                                                }
                                                value={variant.unit}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="kg">kg</SelectItem>
                                                  <SelectItem value="g">g</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            )}
                                          </Field>
                                        </div>
                                      </div>
                                      <div className="flex gap-1 text-xs">
                                        <ErrorMessage
                                          name={`variants.${index}.size`}
                                          component="span"
                                          className="text-red-500"
                                        />
                                        <ErrorMessage
                                          name={`variants.${index}.unit`}
                                          component="span"
                                          className="text-red-500"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="col-span-1">
                                      <Label>Actual Price</Label>
                                      <Field
                                        as={Input}
                                        name={`variants.${index}.actualPrice`}
                                        type="number"
                                        placeholder="Actual Price"
                                        min="0"
                                        step="0.01"
                                      />
                                      <ErrorMessage
                                        name={`variants.${index}.actualPrice`}
                                        component="div"
                                        className="text-red-500 text-xs"
                                      />
                                    </div>
                                    
                                    <div className="col-span-1">
                                      <Label>Sale Price</Label>
                                      <Field
                                        as={Input}
                                        name={`variants.${index}.salePrice`}
                                        type="number"
                                        placeholder="Sale Price"
                                        min="0"
                                        step="0.01"
                                      />
                                      <ErrorMessage
                                        name={`variants.${index}.salePrice`}
                                        component="div"
                                        className="text-red-500 text-xs"
                                      />
                                    </div>
                                    
                                    <div className="col-span-1">
                                      <Label>Stock</Label>
                                      <Field
                                        as={Input}
                                        name={`variants.${index}.stock`}
                                        type="number"
                                        placeholder="Stock"
                                        min="0"
                                      />
                                      <ErrorMessage
                                        name={`variants.${index}.stock`}
                                        component="div"
                                        className="text-red-500 text-xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                onClick={() =>
                                  push({
                                    size: "",
                                    unit: "kg",
                                    actualPrice: "",
                                    salePrice: "",
                                    stock: "",
                                  })
                                }
                                variant="outline"
                                className="w-full sm:w-auto"
                              >
                                Add Variant
                              </Button>
                              <ErrorMessage
                                name="variants"
                                component="div"
                                className="text-red-500 text-sm"
                              />
                            </>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="images" className="sm:text-right">
                      Images
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFieldValue)}
                      ref={fileInputRef}
                      className="w-full sm:col-span-3"
                    />
                  </div>
                  {values.imagePreviews.length > 0 && (
                    <div className="flex flex-col sm:grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
                      <Label className="sm:text-right mt-2">Image Previews</Label>
                      <div className="w-full sm:col-span-3 flex flex-wrap gap-2">
                        {values.imagePreviews.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index}`}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeImage(index, values, setFieldValue)
                              }
                              className="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:grid sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                    <Label className="sm:text-right">Featured</Label>
                    <Field name="isFeatured">
                      {({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            setFieldValue("isFeatured", checked)
                          }
                          className="sm:col-span-3"
                        />
                      )}
                    </Field>
                  </div>
                </div>
                <DialogFooter className="md:col-span-1 lg:col-span-2 pt-4 border-t">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin h-5 w-5" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </Form>

              <Dialog
                open={isCropDialogOpen}
                onOpenChange={setIsCropDialogOpen}
              >
                <DialogContent className="w-[95vw] max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>
                      Adjust the crop area and save or cancel.
                    </DialogDescription>
                  </DialogHeader>
                  {currentImage && (
                    <div className="space-y-4">
                      <div className="max-w-full overflow-auto">
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={handleCropComplete}
                        >
                          <img
                            ref={imageRef}
                            src={currentImage}
                            alt="Crop preview"
                            className="max-w-full"
                          />
                        </ReactCrop>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentImage(null);
                            setCompletedCrop(null);
                            setIsCropDialogOpen(false);
                          }}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            saveCroppedImage(setFieldValue, values)
                          }
                          disabled={!completedCrop}
                          className="w-full sm:w-auto"
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