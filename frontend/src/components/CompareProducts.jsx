import "../styles/CompareProducts.css";

function CompareProducts({ products }) {
  if (products.length !== 2) return null;

  const [p1, p2] = products;

  return (
    <section className="compare-section">
      <h2>⚖️ Product Comparison</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>{p1.name}</th>
            <th>{p2.name}</th>
          </tr>

          <tr>
            <td>Image</td>
            <td>
              <img
                src={p1.images?.[0] || p1.image}
                alt={p1.name}
                style={{ width: "70px", height: "70px", objectFit: "cover", margin: "0 auto", borderRadius: "8px" }}
              />
            </td>
            <td>
              <img
                src={p2.images?.[0] || p2.image}
                alt={p2.name}
                style={{ width: "70px", height: "70px", objectFit: "cover", margin: "0 auto", borderRadius: "8px" }}
              />
            </td>
          </tr>

          <tr>
            <td>Price</td>
            <td>₹{p1.price}</td>
            <td>₹{p2.price}</td>
          </tr>

          <tr>
            <td>Rating</td>
            <td>{p1.rating}</td>
            <td>{p2.rating}</td>
          </tr>

          <tr>
            <td>Reviews</td>
            <td>{p1.reviews}</td>
            <td>{p2.reviews}</td>
          </tr>

          <tr>
            <td>Discount</td>
            <td>{p1.discount}%</td>
            <td>{p2.discount}%</td>
          </tr>
        </tbody>
      </table>

      <div className="ai-verdict">
        🤖 <strong>AI Verdict</strong>
        <p>
          {p1.rating > p2.rating
            ? `${p1.name} is better overall.`
            : `${p2.name} is better overall.`}
        </p>
      </div>
    </section>
  );
}

export default CompareProducts;