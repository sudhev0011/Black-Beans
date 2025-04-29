// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { ProductSlider } from "./ProductSlider";
// import { FeaturedProductCard } from "./FeaturedProductCard";
// import DecorativeSection from "./DecorativeSection";
// import { ProductCategorySelector } from "./ProductCategorySelector";
// import {
//   useGetProductsQuery,
//   useGetFeaturedProductsQuery,
//   useGetCategoriesQuery,
// } from "@/store/api/userApiSlice";
// import HeroBanner from "@/components/ui/hero-banner";
// // import HeroBanner from "@/components/ui/HeroBanner";
// import HomeHeader from "@/components/shop/Header";
// import { useSelector } from "react-redux";

// function ShoppingHome() {
//   const [activeCategory, setActiveCategory] = useState(""); // Start with no category selected
//   const { data: featuredProductsData } = useGetFeaturedProductsQuery();
//   const { data: categoriesData, isLoading: categoriesLoading } =
//     useGetCategoriesQuery();
//   const { data: productsData, isLoading: productsLoading } =
//     useGetProductsQuery({
//       category: activeCategory, // Use activeCategory, fallback to undefined for all products
//     });

//   console.log("Featured Products:", featuredProductsData);
//   console.log("Products:", productsData);
//   console.log("Categories:", categoriesData);

//   const { isAuthenticated, user } = useSelector((state) => state.user);

//   // Optional: Set initial activeCategory once categories load
//   useEffect(() => {
//     if (categoriesData?.categories && !activeCategory) {
//       setActiveCategory(categoriesData.categories[0]?._id);
//     }
//   }, [categoriesData]);

//   return (
//     <div className="flex min-h-screen flex-col">
//       <HomeHeader />
//       <HeroBanner />
//       {/* Featured Products Section */}
//       <section className="featured-products bg-white px-4 py-16 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-7xl">
//           <div className="text-center mb-8">
//             <h2 className="text-5xl font-signika font-bold mb-4">
//               Featured Products
//             </h2>
//             <p className="text-gray-600 text-sm">
//               There are many variations of passages of lorem ipsum available
//             </p>
//           </div>
//           <div className="flex justify-center">
//             <div
//               className="featured-products-grid grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4 bg-primary p-5"
//               style={{ maxWidth: "1200px" }}
//             >
//               {featuredProductsData?.products?.map((product) => (
//                 <FeaturedProductCard
//                   key={product._id}
//                   id={product._id}
//                   title={product.name}
//                   category={product.category.name}
//                   price={
//                     product.variants.length > 0
//                       ? product.variants[0].salePrice ??
//                         product.variants[0].actualPrice
//                       : product.salePrice ?? product.actualPrice
//                   }
//                   actualPrice={
//                     product.variants.length > 0
//                       ? product.variants[0].actualPrice
//                       : product.actualPrice
//                   }
//                   salePrice={
//                     product.variants.length > 0
//                       ? product.variants[0].salePrice
//                       : product.salePrice
//                   }
//                   imageUrl={product.images}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       <DecorativeSection productsData={productsData} />
      
//       {/* Our Products Section */}
//       <section className="our-products px-4 py-5 bg-cover bg-center bg-no-repeat sm:px-6 lg:px-8">
//         <div className="container mx-auto max-w-7xl">
//           <div className="flex flex-col items-center mb-10">
//             <h2 className="text-5xl font-bold mb-4 mt-10 font-signika">
//               Our Products
//             </h2>
//             <p className="text-muted-foreground text-center max-w-md">
//             Discover our handpicked selection of premium products crafted with exceptional quality and attention to detail.
//             </p>
//           </div>

//           {categoriesLoading ? (
//             <div>Loading categories...</div>
//           ) : (
//             <ProductCategorySelector
//               activeCategory={activeCategory}
//               onCategoryChange={setActiveCategory}
//               categories={categoriesData?.categories}
//             />
//           )}

//           {productsLoading ? (
//             <div>Loading products...</div>
//           ) : (
//             <ProductSlider products={productsData?.products} />
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default ShoppingHome;






import React, { useState, useEffect } from "react";
import { ProductSlider } from "./ProductSlider";
import { ProductHoverEffect } from "./ProductHoverEffect";
import DecorativeSection from "./DecorativeSection";
import { ProductCategorySelector } from "./ProductCategorySelector";
import {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
} from "@/store/api/userApiSlice";
import HeroBanner from "@/components/ui/hero-banner";
import HomeHeader from "@/components/shop/Header";

function ShoppingHome() {
  const [activeCategory, setActiveCategory] = useState("");
  const { data: featuredProductsData } = useGetFeaturedProductsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery({
      category: activeCategory,
    });

  useEffect(() => {
    if (categoriesData?.categories && !activeCategory) {
      setActiveCategory(categoriesData.categories[0]?._id);
    }
  }, [categoriesData]);

  // Map featured products to the format expected by ProductHoverEffect
  const featuredItems = featuredProductsData?.products?.map((product) => ({
    id: product._id,
    title: product.name,
    category: product.category.name,
    imageUrl: product.images,
    actualPrice:
      product.variants.length > 0
        ? product.variants[0].actualPrice
        : product.actualPrice,
    salePrice:
      product.variants.length > 0
        ? product.variants[0].salePrice ?? product.variants[0].actualPrice
        : product.salePrice ?? product.actualPrice,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader />
      <HeroBanner />
      {/* Featured Products Section */}
      <section className="featured-products bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-signika font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 text-sm">
              There are many variations of passages of lorem ipsum available
            </p>
          </div>
          <div className="flex justify-center">
            {featuredItems ? (
              <ProductHoverEffect
                items={featuredItems}
                className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10  p-5 max-w-[1200px]"
              />
            ) : (
              <div>Loading featured products...</div>
            )}
          </div>
        </div>
      </section>

      <DecorativeSection productsData={productsData} />

      {/* Our Products Section */}
      <section className="our-products px-4 py-5 bg-cover bg-center bg-no-repeat sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-5xl font-bold mb-4 mt-10 font-signika">
              Our Products
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              Discover our handpicked selection of premium products crafted with
              exceptional quality and attention to detail.
            </p>
          </div>

          {categoriesLoading ? (
            <div>Loading categories...</div>
          ) : (
            <ProductCategorySelector
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              categories={categoriesData?.categories}
            />
          )}

          {productsLoading ? (
            <div>Loading products...</div>
          ) : (
            <ProductSlider products={productsData?.products} />
          )}
        </div>
      </section>
    </div>
  );
}

export default ShoppingHome;