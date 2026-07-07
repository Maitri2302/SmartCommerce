import "../styles/ProductSpecifications.css";

function ProductSpecifications({ specifications }) {
  return (
    <section className="specifications">
      <h2>📋 Product Specifications</h2>

      <table>
        <tbody>
          {Object.entries(specifications).map(([key, value]) => (
            <tr key={key}>
              <td className="spec-key">{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default ProductSpecifications;
