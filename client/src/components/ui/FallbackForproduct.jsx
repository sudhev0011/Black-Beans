import React from "react";
import { useNavigate } from "react-router-dom";

const FallbackForProduct = ({ message }) => {
    const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12 py-12 mt-12">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong!</h2>
      <p className="text-gray-500">{message || "We couldn't load the product. Please try again later."}</p>
      <button
        onClick={()=> navigate('/shop')}
        className="px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition"
      >
        Go Back to shop
      </button>
    </div>
  );
};

export default FallbackForProduct;
