import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";
import "../styles/CustomerReviews.css";

function CustomerReviews({ productId, onReviewUpdate }) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      const data = await apiFetch(`/api/products/${productId}/reviews`);
      setReviews(data.reviews || []);
      if (
        onReviewUpdate &&
        (data.rating !== undefined || data.numReviews !== undefined)
      ) {
        onReviewUpdate({ rating: data.rating, reviews: data.numReviews });
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError("Unable to load customer reviews.");
    } finally {
      setLoading(false);
    }
  }, [productId, onReviewUpdate]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/api/products/${productId}/reviews`);
        if (isMounted) {
          setReviews(data.reviews || []);
          if (
            onReviewUpdate &&
            (data.rating !== undefined || data.numReviews !== undefined)
          ) {
            onReviewUpdate({ rating: data.rating, reviews: data.numReviews });
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (isMounted) {
          setError("Unable to load customer reviews.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId, onReviewUpdate]);

  const currentUserId = user?.id || user?._id;
  const userAlreadyReviewed = reviews.some(
    (r) =>
      currentUserId &&
      (r.user === currentUserId ||
        r.user?._id === currentUserId ||
        r.user?.toString() === currentUserId.toString())
  );

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!comment.trim()) {
      setFormError("Please write a comment for your review.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiFetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });

      setComment("");
      setRating(5);
      setFormSuccess("Thank you! Your review has been published.");
      if (onReviewUpdate && data.rating !== undefined) {
        onReviewUpdate({ rating: data.rating, reviews: data.numReviews });
      }
      await fetchReviews();
    } catch (err) {
      setFormError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      setDeletingId(reviewId);
      const data = await apiFetch(
        `/api/products/${productId}/reviews/${reviewId}`,
        {
          method: "DELETE",
        }
      );

      if (onReviewUpdate && data.rating !== undefined) {
        onReviewUpdate({ rating: data.rating, reviews: data.numReviews });
      }
      await fetchReviews();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="reviews-section">
      <h2>⭐ Customer Reviews</h2>

      {!isAuthenticated ? (
        <div className="review-notice auth">
          Want to share your experience?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: "600" }}>
            Sign In
          </Link>{" "}
          to leave a review.
        </div>
      ) : userAlreadyReviewed ? (
        <div className="review-notice already">
          ✓ You have already submitted a review for this product.
        </div>
      ) : (
        <div className="review-form-card">
          <h3>Write a Product Review</h3>
          {formError && (
            <div style={{ color: "#dc2626", marginBottom: "12px", fontSize: "14px" }}>
              {formError}
            </div>
          )}
          {formSuccess && (
            <div style={{ color: "#16a34a", marginBottom: "12px", fontSize: "14px" }}>
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group-review">
              <label>Rating</label>
              <select
                className="rating-select"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>

            <div className="form-group-review">
              <label>Your Review</label>
              <textarea
                className="comment-textarea"
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-review-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading reviews...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        reviews.map((review) => {
          const isOwner =
            currentUserId &&
            (review.user === currentUserId ||
              review.user?._id === currentUserId ||
              review.user?.toString() === currentUserId.toString());

          return (
            <div className="review-card" key={review._id}>
              <div className="review-header">
                <div>
                  <h3>{review.name}</h3>
                  <div className="review-date">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : ""}
                  </div>
                </div>

                <div className="review-meta">
                  <span>{"⭐".repeat(review.rating)}</span>
                  {isOwner && (
                    <button
                      type="button"
                      className="review-delete-btn"
                      disabled={deletingId === review._id}
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      {deletingId === review._id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>

              <p>{review.comment}</p>
            </div>
          );
        })
      )}
    </section>
  );
}

export default CustomerReviews;