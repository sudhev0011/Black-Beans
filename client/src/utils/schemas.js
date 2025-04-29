import * as Yup from "yup";

// Regex
const nameRegex = /^[a-zA-Z0-9\s\-'\.]+$/;
const descriptionRegex = /^[a-zA-Z0-9\s\.\,\!\?\-']+$/;

export const productSchema = (useVariants) =>
  Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .matches(
        nameRegex,
        "Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods"
      )
      .test(
        "must-contain-letter",
        "Name must contain at least one letter",
        (value) => /[a-zA-Z]/.test(value || "")
      ),
    description: Yup.string()
      .required("Description is required")
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must be less than 1000 characters")
      .matches(
        descriptionRegex,
        "Description can only contain letters, numbers, spaces, and basic punctuation (.,!?-' )"
      ),
    category: Yup.string()
      .required("Category is required")
      .trim()
      .min(2, "Category must be at least 2 characters")
      .max(50, "Category must be less than 50 characters"),
    isFeatured: Yup.boolean().default(false),
    actualPrice: Yup.number()
      .typeError("Actual Price must be a valid number")
      .required("Actual Price is required")
      .min(0, "Actual Price must be 0 or greater")
      .nullable()
      .test(
        "greater-than-or-equal-salePrice",
        "Actual Price must be greater than or equal to Sale Price",
        function (actualPrice) {
          const { salePrice } = this.parent;
          if (salePrice == null || salePrice === "") return true;
          return actualPrice >= salePrice;
        }
      ),
    salePrice: Yup.number()
      .typeError("Sale Price must be a valid number")
      .min(0, "Sale Price must be 0 or greater")
      .nullable(),
    totalStock: Yup.number()
      .typeError("Stock must be a valid number")
      .min(0, "Stock must be 0 or greater")
      .when("$useVariants", {
        is: false,
        then: (schema) =>
          schema
            .required("Stock is required")
            .min(0, "Stock must be 0 or greater"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    hasOffer: Yup.boolean().default(false),
    discountPercentage: Yup.number()
      .typeError("Discount Percentage must be a valid number")
      .when("hasOffer", {
        is: true,
        then: (schema) =>
          schema
            .required("Discount Percentage is required")
            .min(0, "Discount Percentage must be 0 or greater")
            .max(80, "Discount Percentage cannot exceed 80%"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    startDate: Yup.date()
      .typeError("Start Date must be a valid date")
      .when("hasOffer", {
        is: true,
        then: (schema) =>
          schema
            .required("Start Date is required")
            .min(new Date(), "Start Date cannot be in the past"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    endDate: Yup.date()
      .typeError("End Date must be a valid date")
      .when("hasOffer", {
        is: true,
        then: (schema) =>
          schema
            .required("End Date is required")
            .min(Yup.ref("startDate"), "End Date must be after Start Date"),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    variants: Yup.array().when("$useVariants", {
      is: true,
      then: (schema) =>
        schema
          .of(
            Yup.object().shape({
              size: Yup.number()
                .required("Size is required")
                .typeError("Size must be a valid number")
                .min(0, "Size must be 0 or greater"),
              unit: Yup.string()
                .required("Unit is required")
                .oneOf(["kg", "g"], "Unit must be kg or g"),
              actualPrice: Yup.number()
                .required("Actual Price is required")
                .typeError("Actual Price must be a valid number")
                .min(0, "Actual Price must be 0 or greater")
                .nullable()
                .test(
                  "variant-actual-greater-sale",
                  "Actual Price must be greater than or equal to Sale Price",
                  function (actualPrice) {
                    const { salePrice } = this.parent;
                    if (salePrice == null || salePrice === "") return true;
                    return actualPrice >= salePrice;
                  }
                ),
              salePrice: Yup.number()
                .typeError("Sale Price must be a valid number")
                .min(0, "Sale Price must be 0 or greater")
                .nullable(),
              stock: Yup.number()
                .required("Stock is required")
                .typeError("Stock must be a valid number")
                .min(0, "Stock must be 0 or greater"),
            })
          )
          .min(1, "At least one variant is required when using variants"),
      otherwise: (schema) => schema.notRequired().default([]),
    }),
  });

export const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .matches(
      nameRegex,
      "Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods"
    )
    .test(
      "must-contain-letter",
      "Name must contain at least one letter",
      (value) => /[a-zA-Z]/.test(value || "")
    ),
    description: Yup.string()
    .required("Description is required")
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters")
    .matches(
      descriptionRegex,
      "Description can only contain letters, numbers, spaces, and basic punctuation (.,!?-' )"
    ),
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
