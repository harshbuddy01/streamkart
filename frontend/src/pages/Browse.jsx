import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts, fetchCategories } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ category, search: search || undefined }).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [category, search]);

  const setCategory = (c) => {
    const params = new URLSearchParams(searchParams);
    if (c === "all") params.delete("category");
    else params.set("category", c);
    setSearchParams(params);
  };

  return (
    <div className="sk-paper min-h-screen" data-testid="browse-page">
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-10">
        <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-4">The Catalog</div>
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#1A1A1A] mb-2">
          {search ? <>Searching for <em className="text-[#722F37]">{search}</em></> : "Browse the collection"}
        </h1>
        <p className="text-[#4A4A4A]">{products.length} {products.length === 1 ? "title" : "titles"} available.</p>
      </section>

      {/* Category filter bar */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-10">
        <div className="flex flex-wrap gap-3 border-b border-[#D4AF37]/30 pb-6">
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`px-5 py-2 rounded-sm text-sm tracking-wider uppercase transition-colors border ${
                category === c.slug
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-transparent text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A]"
              }`}
              data-testid={`filter-${c.slug}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#EFE9DF] rounded-sm animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" data-testid="empty-state">
            <div className="font-serif-display text-3xl text-[#1A1A1A] mb-3">Nothing here, yet.</div>
            <p className="text-[#4A4A4A] mb-6">Try a different category or search term.</p>
            <Link to="/browse" className="inline-block bg-[#722F37] text-white px-6 py-3 rounded-sm uppercase text-sm tracking-wider">
              Reset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="browse-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
