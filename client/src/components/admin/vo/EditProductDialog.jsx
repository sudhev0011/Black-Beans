import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Loader from "@/components/ui/Loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { productSchema } from "@/utils/schemas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function EditProductDialog({
  product,
  categories,
  onUpdate,
  onClose,
}) {
  const [useVariants, setUseVariants] = useState(false);
  const [hasOffer, setHasOffer] = useState(false);
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

  useEffect(() => {
    if (product) {
      setUseVariants(product.variants?.length > 0);
      setHasOffer(!!product.offer?.isActive);
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
        category: product.category?._id || product.category || "",
        categoryName: product.category?.name || product.categoryName || "",
        isFeatured: product.isFeatured || false,
        hasOffer: !!product.offer?.isActive,
        discountPercentage: product.offer?.discountPercentage || "",
        startDate: product.offer?.startDate
          ? new Date(product.offer.startDate).toISOString().split("T")[0]
          : "",
        endDate: product.offer?.endDate
          ? new Date(product.offer.endDate).toISOString().split("T")[0]
          : "",
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
        hasOffer: false,
        discountPercentage: "",
        startDate: "",
        endDate: "",
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

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1100px]">
        <DialogHeader>
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

            formData.append("hasOffer", values.hasOffer);
            if (values.hasOffer) {
              formData.append("discountPercentage", Number(values.discountPercentage));
              formData.append("startDate", values.startDate);
              formData.append("endDate", values.endDate);
            }

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
              await onUpdate(formData);
              onClose();
            } catch (error) {
              console.error("Error updating product:", error);
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
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      className="col-span-3"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="col-span-3 text-red-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      className="col-span-3"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="col-span-3 text-red-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Field name="category">
                      {({ field }) => (
                        <Select
                          {...field}
                          onValueChange={(value) =>
                            setFieldValue("category", value)
                          }
                          defaultValue={product.categoryName}
                          value={values.category}
                        >
                          <SelectTrigger className="col-span-3">
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
                    <ErrorMessage
                      name="category"
                      component="div"
                      className="col-span-3 text-red-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Use Variants</Label>
                    <Switch
                      checked={useVariants}
                      onCheckedChange={(checked) => {
                        setUseVariants(checked);
                        if (!checked) {
                          setFieldValue("variants", []);
                        }
                      }}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Has Offer</Label>
                    <Field name="hasOffer">
                      {({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            setFieldValue("hasOffer", checked);
                            setHasOffer(checked);
                            if (!checked) {
                              setFieldValue("discountPercentage", "");
                              setFieldValue("startDate", "");
                              setFieldValue("endDate", "");
                            }
                          }}
                          className="col-span-3"
                        />
                      )}
                    </Field>
                  </div>
                  {hasOffer && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discountPercentage" className="text-right">
                          Discount Percentage
                        </Label>
                        <Field
                          as={Input}
                          id="discountPercentage"
                          name="discountPercentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="col-span-3"
                        />
                        <ErrorMessage
                          name="discountPercentage"
                          component="div"
                          className="col-span-3 text-red-500 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                          Start Date
                        </Label>
                        <Field
                          as={Input}
                          id="startDate"
                          name="startDate"
                          type="date"
                          className="col-span-3"
                        />
                        <ErrorMessage
                          name="startDate"
                          component="div"
                          className="col-span-3 text-red-500 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">
                          End Date
                        </Label>
                        <Field
                          as={Input}
                          id="endDate"
                          name="endDate"
                          type="date"
                          className="col-span-3"
                        />
                        <ErrorMessage
                          name="endDate"
                          component="div"
                          className="col-span-3 text-red-500 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  {!useVariants && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="actualPrice" className="text-right">
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
                          className="col-span-3"
                        />
                        <ErrorMessage
                          name="actualPrice"
                          component="div"
                          className="col-span-3 text-red-500 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salePrice" className="text-right">
                          Sale Price
                        </Label>
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
                        <ErrorMessage
                          name="salePrice"
                          component="div"
                          className="col-span-3 text-red-500 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="totalStock" className="text-right">
                          Stock
                        </Label>
                        <Field
                          as={Input}
                          id="totalStock"
                          name="totalStock"
                          type="number"
                          min="0"
                          disabled={useVariants}
                          className="col-span-3"
                        />
                        <ErrorMessage
                          name="totalStock"
                          component="div"
                          className="col-span-3 text-red-500 text-sm"
                        />
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
                                <div
                                  key={index}
                                  className="grid grid-cols-6 gap-2 items-center"
                                >
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
                                        onValueChange={(value) =>
                                          setFieldValue(
                                            `variants.${index}.unit`,
                                            value
                                          )
                                        }
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="images" className="text-right">
                      Images
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setFieldValue)}
                      ref={fileInputRef}
                      className="col-span-3"
                    />
                    {values.imagePreviews.length === 0 && (
                      <div className="col-span-3 text-red-500 text-sm">
                        At least one image is required
                      </div>
                    )}
                  </div>
                  {values.imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right mt-2">Image Previews</Label>
                      <div className="col-span-3 flex flex-wrap gap-2">
                        {values.imagePreviews.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeImage(index, values, setFieldValue)
                              }
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
                          onCheckedChange={(checked) =>
                            setFieldValue("isFeatured", checked)
                          }
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
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>
                      Adjust the crop area and save or cancel.
                    </DialogDescription>
                  </DialogHeader>
                  {currentImage && (
                    <div className="space-y-4">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={handleCropComplete}
                      >
                        <img
                          ref={imageRef}
                          src={currentImage}
                          alt="Crop preview"
                        />
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
                          onClick={() =>
                            saveCroppedImage(setFieldValue, values)
                          }
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