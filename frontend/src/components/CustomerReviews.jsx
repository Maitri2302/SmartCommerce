import "../styles/CustomerReviews.css";

const reviews = [
  {
    id: 1,
    name: "Aarav Sharma",
    rating: 5,
    comment:
      "Excellent product! The quality exceeded my expectations and delivery was very fast.",
  },
  {
    id: 2,
    name: "Priya Verma",
    rating: 4,
    comment:
      "Very good value for money. The product is exactly as described.",
  },
  {
    id: 3,
    name: "Rahul Gupta",
    rating: 5,
    comment:
      "Amazing purchase. I would definitely recommend this to my friends.",
  },
];

function CustomerReviews() {
  return (
    <section className="reviews-section">
      <h2>⭐ Customer Reviews</h2>

      {reviews.map((review) => (
        <div className="review-card" key={review.id}>
          <div className="review-header">
            <h3>{review.name}</h3>

            <span>{"⭐".repeat(review.rating)}</span>
          </div>

          <p>{review.comment}</p>
        </div>
      ))}
    </section>
  );
}

export default CustomerReviews;