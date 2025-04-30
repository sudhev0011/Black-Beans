import { useState, useCallback, useRef } from "react";
import { Plus, X, Loader } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAddProductMutation } from "../../../store/api/adminApiSlice";
import { toast } from "sonner";
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import { productSchema } from '@/utils/schemas';

export default function AddProductDialog({ categories }) {
  const [useVariants, setUseVariants] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
  const [addProduct] = useAddProductMutation();

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
              await handleAddProduct(productData);
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