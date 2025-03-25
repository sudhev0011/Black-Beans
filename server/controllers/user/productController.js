const Product = require("../../models/productModel");
const Variants = require("../../models/varients");
const Category = require("../../models/categoryModel");
const mongoose = require('mongoose');


const showProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'AtoZ',
      category,
      search,
      minPrice,
      maxPrice,
      featured = false,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let matchQuery = { isListed: true };
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
      }
      matchQuery.category = new mongoose.Types.ObjectId(category);
    }
    if (search) {
      matchQuery.$text = { $search: search };
    }
    if (featured === 'true') {
      matchQuery.isFeatured = true;
    }

    const pipeline = [
      { $match: matchQuery },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' } },
      { $match: { 'categoryData.isListed': true } },
      { $unwind: '$categoryData' },
      { $lookup: { from: 'variants', localField: 'variants', foreignField: '_id', as: 'variantsData' } },
      // Step 1: Replace variants with populated data
      {
        $set: {
          variants: {
            $filter: {
              input: '$variantsData',
              cond: { $eq: [{ $type: '$$this' }, 'object'] },
            },
          },
        },
      },
      // Step 2: Calculate effective price for filtering and sorting
      {
        $set: {
          effectivePrice: {
            $cond: {
              if: { $gt: [{ $size: '$variants' }, 0] },
              then: {
                $min: {
                  $map: {
                    input: '$variants',
                    as: 'variant',
                    in: { $ifNull: ['$$variant.salePrice', '$$variant.actualPrice'] },
                  },
                },
              },
              else: { $ifNull: ['$salePrice', '$actualPrice'] },
            },
          },
        },
      },
      // Step 3: Apply price range filter
      {
        $match: {
          $and: [
            minPrice ? { effectivePrice: { $gte: parseFloat(minPrice) } } : {},
            maxPrice ? { effectivePrice: { $lte: parseFloat(maxPrice) } } : {},
          ],
        },
      },
      // Step 4: Project fields (no discountedPrice)
      {
        $project: {
          name: 1,
          description: 1,
          category: '$categoryData',
          actualPrice: 1,
          salePrice: 1,
          stock: 1,
          variants: 1,
          images: 1,
          isFeatured: 1,
          isListed: 1,
          createdAt: 1,
          updatedAt: 1,
          totalStock: 1,
          effectivePrice: 1,
        },
      },
      // Step 5: Apply sorting
      {
        $sort: {
          ...(sort === 'priceLowToHigh' && { effectivePrice: 1 }),
          ...(sort === 'priceHighToLow' && { effectivePrice: -1 }),
          ...(sort === 'AtoZ' && { name: 1 }),
          ...(sort === 'ZtoA' && { name: -1 }),
          ...(sort === 'newArrivals' && { createdAt: -1 }),
        },
      },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const products = await Product.aggregate(pipeline);

    const countPipeline = [
      { $match: matchQuery },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' } },
      { $match: { 'categoryData.isListed': true } },
      { $lookup: { from: 'variants', localField: 'variants', foreignField: '_id', as: 'variantsData' } },
      {
        $set: {
          variants: {
            $filter: {
              input: '$variantsData',
              cond: { $eq: [{ $type: '$$this' }, 'object'] },
            },
          },
        },
      },
      {
        $set: {
          effectivePrice: {
            $cond: {
              if: { $gt: [{ $size: '$variants' }, 0] },
              then: {
                $min: {
                  $map: {
                    input: '$variants',
                    as: 'variant',
                    in: { $ifNull: ['$$variant.salePrice', '$$variant.actualPrice'] },
                  },
                },
              },
              else: { $ifNull: ['$salePrice', '$actualPrice'] },
            },
          },
        },
      },
      {
        $match: {
          $and: [
            minPrice ? { effectivePrice: { $gte: parseFloat(minPrice) } } : {},
            maxPrice ? { effectivePrice: { $lte: parseFloat(maxPrice) } } : {},
          ],
        },
      },
      { $count: 'total' },
    ];
    const countResult = await Product.aggregate(countPipeline);
    const totalProducts = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.log('Error in fetching products for user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};




// const showProducts = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       sort = 'AtoZ',
//       category, // Comma-separated category IDs or array
//       minPrice,
//       maxPrice,
//       featured = false,
//       sizes, // Comma-separated size values or array
//     } = req.query;
    
//     const pageNum = parseInt(page, 10);
//     const limitNum = parseInt(limit, 10);
//     const skip = (pageNum - 1) * limitNum;
    
//     let matchQuery = { isListed: true };
//     if (category) {
//       const categoryIds = Array.isArray(category) ? category : category.split(',').map(id => id.trim());
//       if (categoryIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
//         return res.status(400).json({ success: false, message: 'Invalid category ID format.' });
//       }
//       matchQuery.category = { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) };
//     }
//     if (featured === 'true') {
//       matchQuery.isFeatured = true;
//     }
    
//     const pipeline = [
//       { $match: matchQuery },
//       { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' } },
//       { $match: { 'categoryData.isListed': true } },
//       { $unwind: '$categoryData' },
//       { $lookup: { from: 'variants', localField: 'variants', foreignField: '_id', as: 'variantsData' } },
//       {
//         $set: {
//           variants: {
//             $filter: {
//               input: '$variantsData',
//               cond: { $eq: [{ $type: '$$this' }, 'object'] },
//             },
//           },
//         },
//       },
//       // Filter by sizes if provided
//       ...(sizes
//         ? [
//           {
//               $match: {
//                 $or: [
//                   { variants: { $size: 0 } }, // Include products without variants
//                   {
//                     'variants.size': {
//                       $in: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => parseFloat(s.trim())),
//                     },
//                   },
//                 ],
//               },
//             },
//           ]
//           : []),
//           {
//             $set: {
//               effectivePrice: {
//                 $cond: {
//                   if: { $gt: [{ $size: '$variants' }, 0] },
//                   then: {
//                     $min: {
//                       $map: {
//                     input: '$variants',
//                     as: 'variant',
//                     in: { $ifNull: ['$$variant.salePrice', '$$variant.actualPrice'] },
//                   },
//                 },
//               },
//               else: { $ifNull: ['$salePrice', '$actualPrice'] },
//             },
//           },
//         },
//       },
//       {
//         $match: {
//           $and: [
//             minPrice ? { effectivePrice: { $gte: parseFloat(minPrice) } } : {},
//             maxPrice ? { effectivePrice: { $lte: parseFloat(maxPrice) } } : {},
//           ],
//         },
//       },
//       {
//         $project: {
//           name: 1,
//           description: 1,
//           category: '$categoryData',
//           actualPrice: 1,
//           salePrice: 1,
//           stock: 1,
//           variants: 1,
//           images: 1,
//           isFeatured: 1,
//           isListed: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           totalStock: 1,
//           effectivePrice: 1,
//         },
//       },
//       {
//         $sort: {
//           ...(sort === 'priceLowToHigh' && { effectivePrice: 1 }),
//           ...(sort === 'priceHighToLow' && { effectivePrice: -1 }),
//           ...(sort === 'AtoZ' && { name: 1 }),
//           ...(sort === 'ZtoA' && { name: -1 }),
//           ...(sort === 'newArrivals' && { createdAt: -1 }),
//         },
//       },
//       { $skip: skip },
//       { $limit: limitNum },
//     ];
    
//     const products = await Product.aggregate(pipeline);
    
//     const countPipeline = [
//       { $match: matchQuery },
//       { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' } },
//       { $match: { 'categoryData.isListed': true } },
//       { $lookup: { from: 'variants', localField: 'variants', foreignField: '_id', as: 'variantsData' } },
//       {
//         $set: {
//           variants: {
//             $filter: {
//               input: '$variantsData',
//               cond: { $eq: [{ $type: '$$this' }, 'object'] },
//             },
//           },
//         },
//       },
//       ...(sizes
//         ? [
//           {
//             $match: {
//               $or: [
//                 { variants: { $size: 0 } },
//                   {
//                     'variants.size': {
//                       $in: Array.isArray(sizes) ? sizes : sizes.split(',').map(s => parseFloat(s.trim())),
//                     },
//                   },
//                 ],
//               },
//             },
//           ]
//           : []),
//           {
//             $set: {
//               effectivePrice: {
//                 $cond: {
//               if: { $gt: [{ $size: '$variants' }, 0] },
//               then: {
//                 $min: {
//                   $map: {
//                     input: '$variants',
//                     as: 'variant',
//                     in: { $ifNull: ['$$variant.salePrice', '$$variant.actualPrice'] },
//                   },
//                 },
//               },
//               else: { $ifNull: ['$salePrice', '$actualPrice'] },
//             },
//           },
//         },
//       },
//       {
//         $match: {
//           $and: [
//             minPrice ? { effectivePrice: { $gte: parseFloat(minPrice) } } : {},
//             maxPrice ? { effectivePrice: { $lte: parseFloat(maxPrice) } } : {},
//           ],
//         },
//       },
//       { $count: 'total' },
//     ];
//     const countResult = await Product.aggregate(countPipeline);
//     const totalProducts = countResult.length > 0 ? countResult[0].total : 0;
//     const totalPages = Math.ceil(totalProducts / limitNum);
    
//     res.status(200).json({
//       success: true,
//       message: 'Products fetched successfully',
//       products,
//       pagination: {
//         currentPage: pageNum,
//         totalPages,
//         totalProducts,
//         limit: limitNum,
//       },
//     });
//   } catch (error) {
//     console.log('Error in fetching products for user:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch products',
//       error: error.message,
//     });
//   }
// };




const showProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }

  try {
    const product = await Product.findOne({
      _id: id,
      isListed: true,
    })
      .populate({
        path: 'category',
        match: { isListed: true },
        select: 'name',
      })
      .populate({
        path: 'variants',
        select: 'size unit actualPrice salePrice stock',
      })
      .lean(); // Use lean() for performance since we don’t need a Mongoose document

    if (!product || !product.category) {
      return res.status(404).json({
        success: false,
        message: 'Product not found, not listed, or category not listed',
      });
    }

    // Transform product data
    let productData = { ...product };
    if (productData.variants && productData.variants.length > 0) {
      productData.variants = productData.variants.map((variant) => ({
        ...variant,
        effectivePrice: variant.salePrice ?? variant.actualPrice,
      }));
      // totalStock should already be a virtual field or computed elsewhere
    } else {
      productData.effectivePrice = productData.salePrice ?? productData.actualPrice;
    }

    // Ensure reviews is included (empty array if not populated)
    productData.reviews = productData.reviews || [];

    res.status(200).json({
      success: true,
      message: 'Product details fetched successfully',
      product: productData,
    });
  } catch (error) {
    console.log('Error in showing product for user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Fetching product failed',
      error: error.message,
    });
  }
};






const showFeaturedProducts = async (req, res) => {
  try {  
    const featuredProducts = await Product.find({
      isFeatured: true,
      isListed: true,
    }).limit(10)
      .populate({
        path: 'category',
        match: { isListed: true },
        select: 'name hasVarient',
      })
      .populate({
        path: 'variants',
        select: 'size unit actualPrice salePrice stock',
      });

    // Filter out products where category is not listed (null after populate match)
    const filteredProducts = featuredProducts
      .filter((product) => product.category !== null)
      .map((product) => {
        let productData = product.toObject();
        if (productData.variants && productData.variants.length > 0) {
          productData.variants = productData.variants.map((variant) => ({
            ...variant,
            discountedPrice: variant.salePrice ?? variant.actualPrice,
          }));
          productData.totalStock = product.totalStock; // Virtual field
        } else {
          productData.discountedPrice = productData.salePrice ?? productData.actualPrice;
        }
        return productData;
      });

    if (!filteredProducts.length) {
      return res.status(404).json({
        success: false,
        message: 'No featured products found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Featured products fetched successfully',
      products: filteredProducts,
    });
  } catch (error) {
    console.log('Error in fetching featured products:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Fetching featured products failed',
      error: error.message,
    });
  }
};

module.exports = { showProducts, showProduct, showFeaturedProducts };


