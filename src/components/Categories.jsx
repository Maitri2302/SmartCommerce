import "../styles/Categories.css";

const categories = [
  "All",
  "Electronics",
  "Audio",
  "Gaming",
  "Accessories",
  "Wearables",
];

function Categories({ selected, setSelected }) {
  return (
    <section className="categories">
      <h2>Browse Categories</h2>

      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category}
            className={selected === category ? "active" : ""}
            onClick={() => setSelected(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}

export default Categories;