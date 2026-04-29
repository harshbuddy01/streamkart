import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ShoppingBag, Zap, ArrowLeft, Headphones, BookOpen, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { fetchProduct } from "../lib/api";
import { useCart } from "../lib/cart";

const icons = { audiobook: Headphones, news: Newspaper, book: BookOpen };

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct(id).then(setProduct).catch(() => navigate("/browse"));
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="sk-paper min-h-screen flex items-center justify-center">
        <div className="text-[#4A4A4A]">Loading…</div>
      </div>
    );
  }

  const Icon = icons[product.category] || BookOpen;

  const addToCart = () => {
    addItem(product, qty);
    toast.success(`Added "${product.title}" to your cart`);
  };

  const buyNow = () => {
    addItem(product, qty);
    navigate("/checkout");
  };

  return (
    <div className="sk-paper min-h-screen" data-testid="product-detail-page">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8">
        <Link to="/browse" className="inline-flex items-center gap-2 text-sm text-[#4A4A4A] hover:text-[#722F37]" data-testid="back-link">
          <ArrowLeft size={14} /> Back to catalog
        </Link>
      </div>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] bg-[#EFE9DF] overflow-hidden rounded-sm border border-[#EFE9DF]">
            <img src={product.cover_image} alt={product.title} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#722F37] mb-4">
            <Icon size={14} />
            <span>{product.category}</span>
            <span className="w-6 h-px bg-[#722F37]/40" />
            <span>{product.genre}</span>
          </div>
          <h1 className="font-serif-display text-5xl md:text-6xl text-[#1A1A1A] leading-tight mb-3" data-testid="product-title">
            {product.title}
          </h1>
          <p className="text-lg text-[#4A4A4A] italic mb-6">by {product.author}</p>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4AF37]/30"} />
              ))}
              <span className="text-sm text-[#1A1A1A] ml-2">{product.rating}</span>
              <span className="text-xs text-[#4A4A4A]">({product.reviews?.toLocaleString?.() || product.reviews} reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="font-serif-display text-5xl text-[#722F37]" data-testid="detail-price">
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-lg text-[#4A4A4A]/60 line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-[#4A4A4A] leading-relaxed mb-8 max-w-xl">{product.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-sm border-y border-[#D4AF37]/20 py-6">
            {product.pages && (
              <div><div className="text-[10px] uppercase tracking-[0.2em] text-[#722F37] mb-1">Pages</div><div className="text-[#1A1A1A]">{product.pages}</div></div>
            )}
            {product.duration && (
              <div><div className="text-[10px] uppercase tracking-[0.2em] text-[#722F37] mb-1">Duration</div><div className="text-[#1A1A1A]">{product.duration}</div></div>
            )}
            {product.publisher && (
              <div><div className="text-[10px] uppercase tracking-[0.2em] text-[#722F37] mb-1">Publisher</div><div className="text-[#1A1A1A]">{product.publisher}</div></div>
            )}
            {product.year && (
              <div><div className="text-[10px] uppercase tracking-[0.2em] text-[#722F37] mb-1">Year</div><div className="text-[#1A1A1A]">{product.year}</div></div>
            )}
            <div><div className="text-[10px] uppercase tracking-[0.2em] text-[#722F37] mb-1">Language</div><div className="text-[#1A1A1A]">{product.language}</div></div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[#1A1A1A]/30 rounded-sm">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-[#1A1A1A] hover:bg-[#EFE9DF]" data-testid="qty-decrease">−</button>
              <span className="px-5 py-3 text-[#1A1A1A] font-medium" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-[#1A1A1A] hover:bg-[#EFE9DF]" data-testid="qty-increase">+</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={addToCart}
              className="inline-flex items-center gap-2 border border-[#1A1A1A] text-[#1A1A1A] px-8 py-4 rounded-sm hover:bg-[#1A1A1A] hover:text-white transition-colors text-sm tracking-wider uppercase"
              data-testid="add-to-cart-button"
            >
              <ShoppingBag size={16} /> Add to cart
            </button>
            <button
              onClick={buyNow}
              className="inline-flex items-center gap-2 bg-[#722F37] text-white px-8 py-4 rounded-sm hover:bg-[#5a252b] transition-colors text-sm tracking-wider uppercase"
              data-testid="buy-now-button"
            >
              <Zap size={16} /> Buy now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
