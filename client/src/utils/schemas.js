// src/schemas/productValidationSchema.js
import * as Yup from 'yup';

// Regex to allow alphanumeric characters, spaces, hyphens, apostrophes, and periods
const nameRegex = /^[a-zA-Z0-9\s\-\'\.]+$/;
// Regex to allow alphanumeric characters, spaces, and basic punctuation (.,!?-')
const descriptionRegex = /^[a-zA-Z0-9\s\.\,\!\?\-\']+$/;

export const productSchema = (useVariants) =>
  Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .matches(nameRegex, 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods')
      .test('not-only-whitespace', 'Name cannot be only whitespace', (value) => value && value.trim().length > 0),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .matches(
        descriptionRegex,
        'Description can only contain letters, numbers, spaces, and basic punctuation (.,!?-'
      )
      .test('not-only-whitespace', 'Description cannot be only whitespace', (value) => value && value.trim().length > 0),
    category: Yup.string().required('Category is required'),
    isFeatured: Yup.boolean().default(false),
    actualPrice: Yup.number()
      .when('$useVariants', {
        is: false,
        then: (schema) => schema.required('Actual Price is required').min(0, 'Actual Price must be 0 or greater'),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    salePrice: Yup.number()
      .when('$useVariants', {
        is: false,
        then: (schema) => schema.min(0, 'Sale Price must be 0 or greater').nullable(),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    totalStock: Yup.number()
      .when('$useVariants', {
        is: false,
        then: (schema) => schema.required('Stock is required').min(0, 'Stock must be 0 or greater'),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    variants: Yup.array()
      .when('$useVariants', {
        is: true,
        then: (schema) =>
          schema
            .of(
              Yup.object().shape({
                size: Yup.number().required('Size is required').min(0, 'Size must be 0 or greater'),
                unit: Yup.string().required('Unit is required').oneOf(['kg', 'g'], 'Unit must be kg or g'),
                actualPrice: Yup.number().required('Actual Price is required').min(0, 'Actual Price must be 0 or greater'),
                salePrice: Yup.number().min(0, 'Sale Price must be 0 or greater').nullable(),
                stock: Yup.number().required('Stock is required').min(0, 'Stock must be 0 or greater'),
              })
            )
            .min(1, 'At least one variant is required when using variants'),
        otherwise: (schema) => schema.notRequired().default([]),
      }),
  });