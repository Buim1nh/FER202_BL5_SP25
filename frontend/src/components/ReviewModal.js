export default function ReviewModal({ ratings, userMap, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">All Customer Reviews</h2>

        <div className="space-y-4">
          {ratings.map((r) => (
            <div
              key={r.id}
              className="border border-gray-200 rounded p-4 bg-gray-50 text-sm"
            >
              <div className="text-yellow-600 font-semibold">⭐ {r.score}</div>
              <div className="text-gray-700 mt-1">
                <strong>
                  👤 {userMap[r.userId] || r.userName || "Anonymous"}
                </strong>
              </div>
              <p className="mt-2 text-gray-800">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
