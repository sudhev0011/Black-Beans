const Category = require('../../models/categoryModel');

const showCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: {
          isListed: true, // Only fetch listed categories
        },
      },
      {
        $lookup: {
          from: 'products', // Join with products collection
          localField: '_id',
          foreignField: 'category', // Adjusted to match your products schema
          as: 'products',
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          count: {
            $size: {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $eq: ['$$product.isListed', true] }, // Count only listed products
              },
            },
          },
        },
      },
      {
        $sort: {
          name: 1, // Sort alphabetically by name
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      categories, // Consistent with ShoppingHome usage
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

module.exports = { showCategories };