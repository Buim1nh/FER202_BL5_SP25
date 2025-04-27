export default function SimilarProducts({ productId }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    setRelated([]);

    (async () => {
      try {
        // Fetch đúng entry của productId
        const simRes = await fetch(
          `http://localhost:9999/similarItems?id=${productId}`
        );
        const simArr = await simRes.json();
        const recommendIds = simArr[0]?.recommendIds || [];

        // Debug: kiểm tra recommendIds
        console.log("similarItems →", simArr, "recommendIds →", recommendIds);

        if (!recommendIds.length) {
          setLoading(false);
          return;
        }

        // Fetch chi tiết các sản phẩm theo recommendIds
        const query = recommendIds.map((id) => `id=${id}`).join("&");
        const prodRes = await fetch(`http://localhost:9999/products?${query}`);
        const prodData = await prodRes.json();
        setRelated(prodData);
      } catch (err) {
        console.error("Error fetching related products:", err);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  if (loading) return <p>Loading related products…</p>;
  if (!related.length) return <p>No related products found.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {related.map((p) => (
        <Link
          key={p.id}
          to={`/product/${p.id}`}
          className="border p-2 hover:shadow"
        >
          {/* ...render ảnh, tiêu đề, giá… */}
        </Link>
      ))}
    </div>
  );
}
