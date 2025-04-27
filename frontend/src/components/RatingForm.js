import { useState, useMemo } from "react";

export default function RatingForm({
  productId,
  orderId,
  onSubmitted,
  onCancel,
  initialScore = 5,
  initialComment = "",
  ratingId = null,
}) {
  const [score, setScore] = useState(initialScore);
  const [hovered, setHovered] = useState(null);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useMemo(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      alert("Please log in to submit a review.");
      return;
    }

    setSubmitting(true);

    const payload = {
      productId,
      orderId,
      userId: currentUser.id,
      userName: currentUser.name,
      score,
      comment,
    };

    const url = ratingId
      ? `http://localhost:9999/ratings/${ratingId}`
      : `http://localhost:9999/ratings`;
    const method = ratingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSubmitted && onSubmitted();
      } else {
        alert("Failed to submit rating.");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("An error occurred while submitting your rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded-lg bg-white shadow p-4 space-y-3 text-sm"
    >
      <div>
        <label className="block font-medium mb-1">Your Rating:</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              onClick={() => setScore(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              xmlns="http://www.w3.org/2000/svg"
              fill={(hovered || score) >= star ? "#facc15" : "none"}
              viewBox="0 0 24 24"
              stroke="#facc15"
              strokeWidth={1.5}
              className="w-6 h-6 cursor-pointer transition-colors duration-150"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499c.266-.81 1.409-.81 1.675 0l1.618 4.928a1 1 0 00.95.69h5.184c.857 0 1.213 1.096.522 1.618l-4.194 3.047a1 1 0 00-.364 1.118l1.618 4.928c.266.81-.663 1.48-1.35.987L12 17.347l-4.194 3.047c-.687.493-1.616-.177-1.35-.987l1.618-4.928a1 1 0 00-.364-1.118L3.516 10.735c-.691-.522-.335-1.618.522-1.618h5.184a1 1 0 00.95-.69l1.308-4.928z"
              />
            </svg>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full border px-3 py-1 rounded resize-none"
          required
        />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          {submitting ? "Submitting..." : ratingId ? "Update" : "Submit Review"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
