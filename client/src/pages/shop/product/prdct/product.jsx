import React from 'react';
import { useGetProductQuery } from '@/store/api/userApiSlice'; // Adjust path
import ProductDetails from './ProductDetails';
import ProductDescription from './ProductDescription';
import ProductReviews from './ProductReview';
import { Link, useParams } from 'react-router-dom';
import FallbackForProduct from '@/components/ui/FallbackForproduct'

const ProductPage = () => {
  const { id } = useParams();
  const { data: productData, isLoading, isError,refetch } = useGetProductQuery(id);

  if (isLoading) return <div className="container flex items-center mx-auto px-4 py-8">Loading...</div>;
  if (isError) return <FallbackForProduct message={isError.message} />;
  const { product } = productData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground font-semibold">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-foreground font-semibold">Shop</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{product.name}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <ProductImages images={product.images} name={product.name} />
        <ProductDetails product={product} />
      </div>
      <ProductDescription product={product} />
      <ProductReviews productId={product._id} reviews={product.reviews} />
    </div>
  );
};

const ProductImages = ({ images, name }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);

  const nextImage = () => setCurrentImageIndex((currentImageIndex + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square rounded-lg overflow-hidden border"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={images[currentImageIndex] || '/placeholder.svg'}
          alt={name}
          className={`object-cover w-full h-full transition-transform duration-500 ${isHovering ? 'scale-125' : 'scale-100'}`}
        />
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#114639"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md z-10"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#114639"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
              index === currentImageIndex ? 'border-[#114639]' : 'border-transparent'
            }`}
          >
            <img
              src={image || '/placeholder.svg'}
              alt={`${name} thumbnail ${index + 1}`}
              className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;