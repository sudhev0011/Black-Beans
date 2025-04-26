const Category = require('../../models/categoryModel');
const Yup = require('yup');

// Category validation schema
const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z0-9\s\-\'\.]+$/, 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods')
    .test('not-only-whitespace', 'Name cannot be only whitespace', (value) => value && value.trim().length > 0),
  description: Yup.string()
    .min(0)
    .matches(/^[a-zA-Z0-9\s\.\,\!\?\-\']*$/, 'Description can only contain letters, numbers, spaces, and basic punctuation')
    .nullable(),
  isListed: Yup.boolean().default(true),
});

// Add Category
const addCategory = async (req, res) => {
  try {
    await categorySchema.validate(req.body, { abortEarly: false });
    
    const { name, description, isListed } = req.body;

    const existingCategory = await Category.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });

    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, description, isListed });
    return res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.errors });
    }
    console.error('Error creating category:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// const getAllCategories = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';

//     const query = {
//       name: { $regex: search, $options: 'i' }
//     };

//     const categories = await Category.find(query)
//       .sort({ updatedAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)

//       console.log("category data form the database",categories);
//       // const productsCount = await Category.aggregate([
//       //   {
//       //     $lookup: {
//       //       from: 'products',
//       //       localField: '_id',
//       //       foreignField: 'category',
//       //       as: 'products'
//       //     }
//       //   },

//       //   {
//       //     $project:{
//       //       name: 1,
//       //       productCount: {$size: '$products'}
//       //     }
//       //   }
//       // ])
      
//       // console.log(productsCount);
      
//     const totalCategories = await Category.countDocuments(query);

//     res.status(200).json({
//       categories,
//       totalCategories,
//       currentPage: page,
//       totalPages: Math.ceil(totalCategories / limit),
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch categories' });
//   }
// };

// List or Unlist


const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      name: { $regex: search, $options: 'i' }
    };

    // Get product counts for each category in one query using aggregation
    const categoriesWithCounts = await Category.aggregate([
      { $match: query }, 
      { $sort: { updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'products', 
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          hasVarient: 1,
          isListed: 1,
          offer: 1,
          createdAt: 1,
          updatedAt: 1,
          description: 1,
          productCount: { $size: '$products' }
        }
      }
    ]);
    console.log(categoriesWithCounts);
    
    const totalCategories = await Category.countDocuments(query);

    res.status(200).json({
      categories: categoriesWithCounts, 
      totalCategories,
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};




const listCategory = async (req, res) => {
  const { id: categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    category.isListed = !category.isListed;
    await category.save();
    res.status(200).json({ success: true, message: "Category status changed.", category });
  } catch (error) {
    console.log("Error in toggling category:", error.message);
    res.status(error?.status || 500).json({ message: error.message || "Something went wrong" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    await categorySchema.validate(req.body, { abortEarly: false });
    
    const { name, description, isListed = true } = req.body; 
    const { id: categoryId } = req.params;

    const categoryExists = await Category.findOne({
      $and: [
        { name: { $regex: `^${name.trim()}$`, $options: 'i' } },
        { _id: { $ne: categoryId } },
      ],
    });

    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, isListed },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    console.log("Backend update response after update :", updatedCategory); 
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Backend update error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.errors });
    }
    res.status(500).json({ success: false, message: "Failed to update category", error: error.message });
  }
};
module.exports = {
  addCategory,
  getAllCategories,
  updateCategory,
  listCategory,
};