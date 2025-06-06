import { useState, useCallback, useRef } from "react";
import { Plus, X, Loader, ChevronDown } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  // Function to render form field with label
  const renderFormField = ({ label, name, component, type = "text", min, step, disabled = false, placeholder = "", children }) => (
    <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
      <Label htmlFor={name} className="sm:text-right text-sm font-medium">{label}</Label>
      <div className="sm:col-span-3">
        {children || (
          <Field
            as={component}
            id={name}
            name={name}
            type={type}
            min={min}
            step={step}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full"
          />
        )}
        <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
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
              <Form className="space-y-6 py-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="basic-info">
                    <AccordionTrigger className="py-4 px-2">Basic Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {renderFormField({
                          label: "Name",
                          name: "name",
                          component: Input
                        })}
                        
                        {renderFormField({
                          label: "Description",
                          name: "description",
                          component: Textarea
                        })}
                        
                        {renderFormField({
                          label: "Category",
                          name: "category",
                          children: (
                            <Field name="category">
                              {({ field }) => (
                                <Select
                                  {...field}
                                  onValueChange={(value) => setFieldValue('category', value)}
                                  value={values.category}
                                >
                                  <SelectTrigger className="w-full">
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
                          )
                        })}
                        
                        {renderFormField({
                          label: "Use Variants",
                          name: "useVariants",
                          children: (
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
                            />
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="pricing-inventory">
                    <AccordionTrigger className="py-4 px-2">Pricing & Inventory</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {!useVariants && (
                          <>
                            {renderFormField({
                              label: "Actual Price",
                              name: "actualPrice",
                              component: Input,
                              type: "number",
                              min: "0",
                              step: "0.01",
                              disabled: useVariants
                            })}
                            
                            {renderFormField({
                              label: "Sale Price (optional)",
                              name: "salePrice",
                              component: Input,
                              type: "number",
                              min: "0",
                              step: "0.01",
                              disabled: useVariants
                            })}
                            
                            {renderFormField({
                              label: "Stock",
                              name: "totalStock",
                              component: Input,
                              type: "number",
                              min: "0",
                              disabled: useVariants
                            })}
                          </>
                        )}
                        
                        {useVariants && (
                          <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:items-start sm:gap-4">
                            <Label className="sm:text-right mt-2">Variants</Label>
                            <div className="sm:col-span-3 space-y-4">
                              <FieldArray name="variants">
                                {({ push, remove }) => (
                                  <>
                                    {values.variants.map((variant, index) => (
                                      <div key={index} className="space-y-3 p-3 border rounded-md bg-gray-50">
                                        <div className="flex justify-between items-center">
                                          <h4 className="text-sm font-medium">Variant {index + 1}</h4>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700 p-1 h-auto"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div className="space-y-2">
                                            <Label htmlFor={`variants.${index}.size`}>Size</Label>
                                            <Field
                                              as={Input}
                                              name={`variants.${index}.size`}
                                              type="number"
                                              placeholder="Size"
                                              min="0"
                                              step="0.1"
                                            />
                                            <ErrorMessage
                                              name={`variants.${index}.size`}
                                              component="div"
                                              className="text-red-500 text-sm"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor={`variants.${index}.unit`}>Unit</Label>
                                            <Field name={`variants.${index}.unit`}>
                                              {({ field }) => (
                                                <Select
                                                  {...field}
                                                  onValueChange={(value) => setFieldValue(`variants.${index}.unit`, value)}
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
                                            <ErrorMessage
                                              name={`variants.${index}.unit`}
                                              component="div"
                                              className="text-red-500 text-sm"
                                            />
                                          </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div className="space-y-2">
                                            <Label htmlFor={`variants.${index}.actualPrice`}>Actual Price</Label>
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
                                              className="text-red-500 text-sm"
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor={`variants.${index}.salePrice`}>Sale Price</Label>
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
                                              className="text-red-500 text-sm"
                                            />
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor={`variants.${index}.stock`}>Stock</Label>
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
                                            className="text-red-500 text-sm"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      onClick={() => push({ 
                                        size: '', 
                                        unit: 'kg', 
                                        actualPrice: '', 
                                        salePrice: '', 
                                        stock: '' 
                                      })}
                                      variant="outline"
                                      className="w-full mt-2"
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="images">
                    <AccordionTrigger className="py-4 px-2">Images</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {renderFormField({
                          label: "Upload Images",
                          name: "images",
                          children: (
                            <>
                              <Input
                                id="images"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, setFieldValue)}
                                ref={fileInputRef}
                                className="w-full"
                              />
                              {values.imagePreviews.length === 0 && (
                                <div className="text-red-500 text-sm mt-1">At least one image is required</div>
                              )}
                            </>
                          )
                        })}
                        
                        {values.imagePreviews.length > 0 && (
                          <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-4 sm:items-start sm:gap-4">
                            <Label className="sm:text-right mt-2">Image Previews</Label>
                            <div className="sm:col-span-3">
                              <div className="flex flex-wrap gap-3">
                                {values.imagePreviews.map((url, index) => (
                                  <div key={index} className="relative group">
                                    <div className="w-20 h-20 overflow-hidden rounded-md">
                                      <img 
                                        src={url} 
                                        alt={`Preview ${index}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeImage(index, values, setFieldValue)}
                                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full flex items-center justify-center"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {renderFormField({
                          label: "Featured",
                          name: "isFeatured",
                          children: (
                            <Field name="isFeatured">
                              {({ field }) => (
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => setFieldValue('isFeatured', checked)}
                                />
                              )}
                            </Field>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <DialogFooter className="flex justify-end mt-6 pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isSubmitting || values.imagePreviews.length === 0}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </Button>
                </DialogFooter>
              </Form>

              <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="w-full max-w-[95vw] sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogDescription>Adjust the crop area and save or cancel.</DialogDescription>
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