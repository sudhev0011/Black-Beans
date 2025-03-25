import { useState } from "react"

const dummyReviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "February 15, 2025",
    comment:
      "Absolutely love this coffee! The flavor profile is rich and complex with notes of chocolate and citrus. Perfect morning brew.",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 4,
    date: "January 28, 2025",
    comment:
      "Great quality beans, very fresh. The aroma is amazing and it makes a smooth cup. Just a bit pricey, but worth it for special occasions.",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    rating: 5,
    date: "March 2, 2025",
    comment:
      "This El Salvador coffee has become my daily go-to. The medium roast is perfect - not too light, not too dark. Highly recommend!",
  },
]

const ProductReviews = ({ productId, reviews }) => {
  // Use dummy reviews for now, replace with actual reviews from API
  const productReviews = reviews.length > 0 ? reviews : dummyReviews
  const [showReviewForm, setShowReviewForm] = useState(false)

  // For the review form
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  })

  const handleReviewChange = (e) => {
    const { name, value } = e.target
    setReviewData({
      ...reviewData,
      [name]: value,
    })
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    // Here you would typically dispatch an action to submit the review
    console.log("Review submitted:", reviewData)
    setShowReviewForm(false)
    // Reset form
    setReviewData({
      rating: 5,
      comment: "",
    })
  }

  return (
    <div className="mt-16">
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#114639]">Customer Reviews</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-[#114639] text-white px-4 py-2 rounded-md hover:bg-[#114639]/90"
        >
          Write a Review
        </button>
      </div> */}

      {/* {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-[#114639]">Write Your Review</h3>
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
                required
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-[#114639] text-white px-4 py-2 rounded-md hover:bg-[#114639]/90">
                Submit Review
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
      )} */}

      <div className="space-y-6">
        {productReviews.map((review) => (
          <div key={review.id} className="border-b pb-6 border-[#114639]/20">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-[#114639]">{review.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex">
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
                  </div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{review.date}</span>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductReviews



// import { useState } from 'react';

// const ProductReviews = ({ productId, reviews }) => {
//   const productReviews = reviews.length > 0 ? reviews : [];
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

//   const handleReviewChange = (e) => {
//     const { name, value } = e.target;
//     setReviewData({ ...reviewData, [name]: value });
//   };

//   const handleReviewSubmit = (e) => {
//     e.preventDefault();
//     console.log('Review submitted:', { productId, ...reviewData });
//     setShowReviewForm(false);
//     setReviewData({ rating: 5, comment: '' });
//   };

//   return (
//     <div className="mt-16">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-[#114639]">Customer Reviews</h2>
//         <button
//           onClick={() => setShowReviewForm(!showReviewForm)}
//           className="bg-[#114639] text-white px-4 py-2 rounded-md hover:bg-[#114639]/90"
//         >
//           Write a Review
//         </button>
//       </div>

//       {showReviewForm && (
//         <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4 text-[#114639]">Write Your Review</h3>
//           <form onSubmit={handleReviewSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Rating</label>
//               <div className="flex gap-2">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <button
//                     key={star}
//                     type="button"
//                     onClick={() => setReviewData({ ...reviewData, rating: star })}
//                     className="focus:outline-none"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill={star <= reviewData.rating ? "#114639" : "none"}
//                       stroke={star <= reviewData.rating ? "#114639" : "#71717a"}
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//                     </svg>
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="mb-4">
//               <label htmlFor="comment" className="block text-sm font-medium mb-1">Your Review</label>
//               <textarea
//                 id="comment"
//                 name="comment"
//                 rows="4"
//                 value={reviewData.comment}
//                 onChange={handleReviewChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#114639]"
//                 placeholder="Share your experience with this product..."
//                 required
//               />
//             </div>
//             <div className="flex gap-2">
//               <button type="submit" className="bg-[#114639] text-white px-4 py-2 rounded-md hover:bg-[#114639]/90">
//                 Submit Review
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowReviewForm(false)}
//                 className="border border-[#114639] text-[#114639] px-4 py-2 rounded-md hover:bg-[#114639]/10"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="space-y-6">
//         {productReviews.map((review) => (
//           <div key={review.id} className="border-b pb-6 border-[#114639]/20">
//             <div className="flex justify-between items-start mb-2">
//               <div>
//                 <h3 className="font-semibold text-[#114639]">{review.name}</h3>
//                 <div className="flex items-center gap-2">
//                   <div className="flex">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <svg
//                         key={star}
//                         xmlns="http://www.w3.org/2000/svg"
//                         width="16"
//                         height="16"
//                         viewBox="0 0 24 24"
//                         fill={star <= review.rating ? "#114639" : "none"}
//                         stroke={star <= review.rating ? "#114639" : "#71717a"}
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       >
//                         <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
//                       </svg>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <span className="text-sm text-muted-foreground">{review.date}</span>
//             </div>
//             <p className="text-muted-foreground">{review.comment}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductReviews;