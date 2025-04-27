import { useEffect, useState } from "react";
import RatingForm from "./RatingForm";
import ReviewModal from "./ReviewModal";

export default function ProductReview({ productId, currentUser }) {
  const [ratings, setRatings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [purchasedTitles, setPurchasedTitles] = useState([]);
  const [productTitle, setProductTitle] = useState("");

  // Fetch product title
  useEffect(() => {
    if (productId) {
      fetch(`http://localhost:9999/products/${productId}`)
        .then((res) => res.json())
        .then((product) => setProductTitle(product.title));
    }
  }, [productId]);

  // Fetch ratings
  const fetchRatings = () => {
    if (!productId) return;

    fetch(`http://localhost:9999/ratings?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setRatings(data);
        const userIds = [...new Set(data.map((r) => r.userId))];
        userIds.forEach((id) => {
          if (!userMap[id]) {
            fetch(`http://localhost:9999/user/${id}`)
              .then((res) => res.json())
              .then((user) =>
                setUserMap((prev) => ({
                  ...prev,
                  [id]: user.fullname || "Anonymous",
                }))
              );
          }
        });
      });
  };

  // Delete rating
  const handleDelete = (ratingId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      fetch(`http://localhost:9999/ratings/${ratingId}`, {
        method: "DELETE",
      }).then(() => fetchRatings());
    }
  };

  // Fetch orders and ratings
  useEffect(() => {
    fetchRatings();

    if (currentUser?.id) {
      fetch(
        `http://localhost:9999/orders?user_id=${currentUser.id}&status=shipped`
      )
        .then((res) => res.json())
        .then((orders) => {
          const titles = orders.flatMap((order) =>
            order.items.map((item) => item.product_name)
          );
          setPurchasedTitles(titles);
        });
    }
  }, [productId, currentUser?.id]);

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length
        ).toFixed(1)
      : null;

  const previewRatings = ratings.slice(0, 5);
  const hasRated = ratings.some((r) => r.userId === currentUser?.id);
  const hasPurchased = purchasedTitles.includes(productTitle);
  const canReview = currentUser && !hasRated && hasPurchased;

  return (
    <div className="mt-6 border-t pt-5">
      <h2 className="text-lg font-semibold mb-3">Customer Reviews</h2>

      {averageRating && (
        <p className="text-sm text-yellow-700 mb-4">
          ⭐ <strong className="text-lg">{averageRating}</strong> / 5 (
          {ratings.length} reviews)
        </p>
      )}

      {/* Only show form if user hasn't rated and has purchased */}
      {canReview && (
        <div className="mb-6">
          <h3 className="font-medium text-sm mb-2 text-gray-700">
            Write a review:
          </h3>
          <RatingForm
            productId={productId}
            orderId={null}
            onSubmitted={fetchRatings}
            onCancel={() => {}}
          />
        </div>
      )}

      {ratings.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No reviews yet for this product.
        </p>
      ) : (
        <div className="space-y-4">
          {previewRatings.map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold text-gray-800">
                      ⭐ Rating:
                    </span>{" "}
                    <span className="text-yellow-600 font-bold">{r.score}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">
                      👤 Reviewer:
                    </span>{" "}
                    <span className="text-blue-700 font-medium">
                      {userMap[r.userId] || r.fullname || "Anonymous"}
                    </span>
                  </p>
                </div>

                {currentUser?.id === r.userId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(r.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === r.id ? (
                <div className="mt-2">
                  <RatingForm
                    productId={productId}
                    orderId={r.orderId}
                    initialScore={r.score}
                    initialComment={r.comment}
                    ratingId={r.id}
                    onSubmitted={() => {
                      fetchRatings();
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-800">
                  <span className="font-semibold">💬 Comment:</span> {r.comment}
                </p>
              )}
            </div>
          ))}

          {ratings.length > 5 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Show all reviews ({ratings.length})
            </button>
          )}
        </div>
      )}

      {showModal && (
        <ReviewModal
          ratings={ratings}
          userMap={userMap}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
