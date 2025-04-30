import * as Yup from "yup";

// Enhanced regex (no control chars, no leading/trailing hyphens or periods)
const nameRegex = /^[a-zA-Z0-9\s\-'.]{2,100}$/;
const descriptionRegex = /^[a-zA-Z0-9\s.,!?'\-]{10,1000}$/;

export const productSchema = (useVariants) =>
  Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .matches(nameRegex, 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods')
      .test(
        'not-only-whitespace',
        'Name cannot be only whitespace',
        (value) => value && value.trim().length > 0
      )
      .test(
        'no-invisible-chars',
        'Name contains invalid invisible characters',
        (value) => !/[\u200B-\u200D\uFEFF]/.test(value)
      ),
    description: Yup.string()
      .required('Description is required')
      .trim()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be at most 1000 characters')
      .matches(descriptionRegex, 'Description can only contain letters, numbers, spaces, and basic punctuation (.,!?-)')
      .test(
        'not-only-whitespace',
        'Description cannot be only whitespace',
        (value) => value && value.trim().length > 0
      )
      .test(
        'no-invisible-chars',
        'Description contains invalid invisible characters',
        (value) => !/[\u200B-\u200D\uFEFF]/.test(value)
      ),
    category: Yup.string()
      .required('Category is required')
      .trim()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must be at most 50 characters'),
    isFeatured: Yup.boolean().default(false),

    actualPrice: Yup.number()
    .transform((value, originalValue) => {
      // Convert empty string or invalid input to NaN
      return originalValue === '' ? NaN : Number(originalValue);
    })
  .when('$useVariants', {
    is: false,
    then: (schema) =>
      schema
        .required('Actual Price is required')
        .min(0, 'Actual Price must be 0 or greater')
        .max(1000000, 'Price is too high'),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
salePrice: Yup.number()
  .when('$useVariants', {
    is: false,
    then: (schema) =>
      schema
        .nullable()
        .min(0, 'Sale Price must be 0 or greater')
        .max(1000000, 'Price is too high')
        .test(
          'sale-less-than-actual',
          'Sale Price must be less than Actual Price',
          function (value) {
            const { actualPrice } = this.parent;
            return value == null || actualPrice == null || value < actualPrice;
          }
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
    totalStock: Yup.number()
      .when('$useVariants', {
        is: false,
        then: (schema) =>
          schema.required('Stock is required')
                .min(0, 'Stock must be 0 or greater')
                .max(100000, 'Stock is too high'),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    variants: Yup.array()
      .when('$useVariants', {
        is: true,
        then: (schema) =>
          schema
            .of(
              Yup.object().shape({
                size: Yup.number()
                  .required('Size is required')
                  .min(0, 'Size must be 0 or greater')
                  .max(10000, 'Size is too large'),
                unit: Yup.string()
                  .required('Unit is required')
                  .oneOf(['kg', 'g'], 'Unit must be kg or g'),
                actualPrice: Yup.number()
                  .required('Actual Price is required')
                  .min(0, 'Actual Price must be 0 or greater')
                  .max(1000000, 'Price is too high'),
                salePrice: Yup.number()
                  .nullable()
                  .min(0, 'Sale Price must be 0 or greater')
                  .max(1000000, 'Price is too high')
                  .test(
                    'sale-less-than-actual-variant',
                    'Sale Price must be less than Actual Price',
                    function (value) {
                      const { actualPrice } = this.parent;
                      return value == null || actualPrice == null || value < actualPrice;
                    }
                  ),
                stock: Yup.number()
                  .required('Stock is required')
                  .min(0, 'Stock must be 0 or greater')
                  .max(100000, 'Stock is too high'),
              })
            )
            .min(1, 'At least one variant is required when using variants')
            .test(
              'unique-variants',
              'Variants must be unique by size and unit',
              (variants) => {
                if (!variants) return true;
                const seen = new Set();
                for (const v of variants) {
                  const key = `${v.size}-${v.unit}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                }
                return true;
              }
            ),
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