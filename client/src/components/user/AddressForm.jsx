import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { useAddAddressMutation, useEditAddressMutation } from "@/store/api/userApiSlice"; // Add useAddAddressMutation
import { toast } from "sonner";
import { addressSchema } from "@/utils/addressZod";
import { z } from "zod";

const AddressFormComponent = ({ address, onCancel }) => {
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation(); // Mutation for adding address
  const [editAddress, { isLoading: isEditing }] = useEditAddressMutation(); // Mutation for editing address

  const isEditMode = !!address; // Determine if editing or adding

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "United States",
    addressType: "Home",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && address) {
      setFormData({
        fullname: address.fullname || "",
        phone: address.phone || "",
        email: address.email || "",
        addressLine: address.addressLine || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "United States",
        addressType: address.addressType || "Home",
        isDefault: address.isDefault || false,
      });
    }
  }, [address, isEditMode]);

  const sanitizeInput = (value) => {
    return value.replace(/[<>{}]/g, ""); // Remove suspicious characters
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value.trim());
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const validate = () => {
    try {
      addressSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return false;
      }
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      if (isEditMode) {
        // Edit existing address
        await editAddress({
          addressId: address._id,
          addressData: formData,
        }).unwrap();
        toast.success("Address updated successfully");
      } else {
        // Add new address
        await addAddress(formData).unwrap();
        toast.success("Address added successfully");
      }
      onCancel(); // Close the form
    } catch (error) {
      console.error(isEditMode ? "Edit Address Error:" : "Add Address Error:", error);
      toast.error(error?.data?.message || `Failed to ${isEditMode ? "update" : "add"} address`);
    }
  };

  const states = [
    "Alabama", "Alaska", "Arizona", "California", "Colorado", "Florida", "Texas", "New York",
    "Washington", "Virginia", "Ohio", "Michigan",
  ];

  const countries = [
    "United States", "Canada", "United Kingdom", "Australia", "India", "Germany", "France",
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{isEditMode ? "Edit Address" : "Add New Address"}</CardTitle>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <Label>Full Name</Label>
              <Input
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className={errors.fullname ? "border-red-500" : ""}
              />
              {errors.fullname && <p className="text-red-500 text-xs">{errors.fullname}</p>}
            </div>

            {/* Phone */}
            <div>
              <Label>Phone Number</Label>
              <Input
                name="phone"
                value={formData.phone}
                type="text"
                onChange={handleChange}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={formData.email}
              type="email"
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* Address */}
          <div>
            <Label>Address Line</Label>
            <Input
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              className={errors.addressLine ? "border-red-500" : ""}
            />
            {errors.addressLine && <p className="text-red-500 text-xs">{errors.addressLine}</p>}
          </div>

          {/* City, State, Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
            </div>

            <div>
              <Label>State</Label>
              <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)}>
                <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
            </div>

            <div>
              <Label>Pincode</Label>
              <Input
                name="pincode"
                value={formData.pincode}
                type="text"
                onChange={handleChange}
                className={errors.pincode ? "border-red-500" : ""}
              />
              {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
            </div>
          </div>

          {/* Country */}
          <div>
            <Label>Country</Label>
            <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address Type and Default */}
          <div className="flex items-center gap-4">
            <div>
              <Label>Address Type</Label>
              <Select value={formData.addressType} onValueChange={(value) => handleSelectChange("addressType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <Checkbox
                checked={formData.isDefault}
                onCheckedChange={handleCheckboxChange}
              />
              <Label>Set as Default</Label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isAdding || isEditing}>
            <Save className="h-4 w-4 mr-2" />
            {isEditMode ? "Save Address" : "Add Address"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddressFormComponent;