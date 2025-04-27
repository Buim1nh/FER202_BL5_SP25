import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/formatCurrency";
import { useRegion } from "../context/RegionContext";

export default function Product({ product }) {
  const { currencyMeta, exchangeRate } = useRegion();
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    if (product?.id) {
      fetch(`http://localhost:9999/ratings?productId=${product.id}`)
        .then((res) => res.json())
        .then(setRatings)
        .catch((err) => console.error("Lỗi khi fetch ratings:", err));
    }
  }, [product?.id]);

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((acc, r) => acc + (r.score || 0), 0) / ratings.length
        ).toFixed(1)
      : null;

  return (
    <Link
      to={`/product/${product?.id}`}
      className="max-w-[200px] p-1.5 border border-gray-50 hover:border-gray-200 hover:shadow-xl bg-gray-100 rounded mx-auto"
    >
      {product?.url && (
        <div className="relative">
          <img
            className="rounded cursor-pointer"
            src={`${product.url}/190`}
            alt={product.title}
          />
          {product.status === "unavailable" && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Sold Out
            </div>
          )}
        </div>
      )}

      <div className="pt-2 px-1">
        <div className="font-semibold text-[15px] hover:underline cursor-pointer">
          {product?.title}
        </div>

        <div className="font-extrabold">
          {formatCurrency(
            (product?.price / 100) * exchangeRate,
            currencyMeta.code,
            currencyMeta.symbol
          )}
        </div>

        <div className="relative flex items-center text-[12px] text-gray-500">
          <div className="line-through">
            {formatCurrency(
              ((product?.price * 1.2) / 100) * exchangeRate,
              currencyMeta.code,
              currencyMeta.symbol
            )}
          </div>
          <div className="px-2">-</div>
          <div className="line-through">20%</div>
        </div>

        {/* ⭐ Rating */}
        <div className="mt-1 text-[12px] text-yellow-600 font-medium">
          {averageRating ? (
            <>
              <span className="mr-1">⭐ {averageRating}</span>
              <span className="text-gray-600">({ratings.length} reviews)</span>
            </>
          ) : (
            <span className="text-gray-400 italic">No reviews yet</span>
          )}
        </div>

        {/* Category badge */}
        <div className="mt-1 inline-block bg-gray-200 rounded-full px-2 py-0.5 text-xs">
          Category: {product.categoryId}
        </div>
      </div>
    </Link>
  );
}
