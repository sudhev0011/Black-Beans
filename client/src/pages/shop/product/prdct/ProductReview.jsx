import { useState, useEffect } from "react";
import {
  useGetProductReviewsQuery,
  useCanReviewQuery,
  useAddReviewMutation,
} from "@/store/api/userApiSlice";

const ProductReviews = ({ productId, userId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "", images: [] });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    data: reviewDataResponse,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useGetProductReviewsQuery(productId);

  const {
    data: canReviewData,
    isLoading: canReviewLoading,
    error: canReviewError,
  } = useCanReviewQuery(productId, { skip: !userId });

  const [addReview, { isLoading: addReviewLoading }] = useAddReviewMutation();

  const reviews = reviewDataResponse?.reviews || [];
  const averageRating = reviewDataResponse?.averageRating || 0;
  const canReview = canReviewData?.canReview || false;

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData({ ...reviewData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setErrorMessage("You can upload up to 3 images");
      return;
    }
    setReviewData({ ...reviewData, images: files });
    setErrorMessage("");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", reviewData.rating);
      formData.append("comment", reviewData.comment);
      reviewData.images.forEach((image) => formData.append("images", image));

      const result = await addReview(formData).unwrap();
      setSuccessMessage(result.message);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: "", images: [] });
    } catch (err) {
      setErrorMessage(err.data?.message || "Error submitting review");
    }
  };

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  if (reviewsLoading || canReviewLoading) {
    return <div>Loading reviews...</div>;
  }

  if (reviewsError || canReviewError) {
    return <div>Error loading reviews: {reviewsError?.data?.message || "Please try again"}</div>;
  }

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#114639]">
          Customer Reviews ({reviews.length})
        </h2>
        {userId && canReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-[#114639] text-white px-4 py-2 rounded-md hover:bg-[#114639]/90"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && userId && canReview && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-[#114639]">Write Your Review</h3>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={star <= reviewData.rating ? "#114639" : "none"}
                      stroke={star <= reviewData.rating ? "#114639" : "#71717a"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium mb-1">
                Your Review
              </label>
              <textarea
                id="comment"
                name="comment"
                rows="4"
                value={reviewData.comment}
                onChange={handleReviewChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#114639]"
                placeholder="Share your experience with this product..."
                maxLength={500}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="images" className="block text-sm font-medium mb-1">
                Upload Images (up to 3, JPEG/JPG/PNG)
              </label>
              <input
                id="images"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addReviewLoading}
                className="bg-[#114639] text-white px-4 py-2 rounded-md hover:bg-[#114639]/90 disabled:opacity-50"
              >
                {addReviewLoading ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="border border-[#114639] text-[#114639] px-4 py-2 rounded-md hover:bg-[#114639]/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {userId && !canReview && (
        <p className="text-muted-foreground mb-6">
          You can review this product after it has been delivered and is not cancelled or returned.
        </p>
      )}
      {!userId && (
        <p className="text-muted-foreground mb-6">Please log in to submit a review.</p>
      )}

      <div className="mb-6">
        <p className="text-lg font-semibold text-[#114639]">
          Average Rating: {averageRating.toFixed(1)} / 5
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-6 border-[#114639]/20">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <img 
                    src={review.user.image_url} 
                    alt={`${review.user.username}'s profile`} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="ms-2">{review.user.username}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-4">
                {review.images && review.images.length > 0 && (
                  <div className="flex-shrink-0">
                    <div className="flex gap-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex-grow">
                  <h3 className="font-semibold text-[#114639]">
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? "#114639" : "none"}
                          stroke={star <= review.rating ? "#114639" : "#71717a"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                      <span className="ml-2">{review.rating}/5</span>
                    </div>
                  </h3>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No reviews yet.</p>
      )}
    </div>
  );
};

export default ProductReviews;