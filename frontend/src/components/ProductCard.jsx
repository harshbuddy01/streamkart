import { Link } from "react-router-dom";
import { Headphones, BookOpen, Newspaper, Star } from "lucide-react";

const categoryIcon = (c) => {
  if (c === "audiobook") return <Headphones size={12} />;
  if (c === "news") return <Newspaper size={12} />;
  return <BookOpen size={12} />;
};

export const ProductCard = ({ product, variant = "default" }) => {
  const tall = variant === "tall";
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white border border-[#EFE9DF] rounded-sm sk-card-hover overflow-hidden"
      data-testid={`product-card-${product.id}`}
    >
      <div className={`relative overflow-hidden bg-[#EFE9DF] ${tall ? "aspect-[3/4]" : "aspect-[2/3]"}`}>
        <img
          src={product.cover_image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#F9F6F0]/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[#722F37]">
          {categoryIcon(product.category)}
          <span>{product.category}</span>
        </div>
        {product.bestseller && (
          <div className="absolute top-3 right-3 bg-[#722F37] text-white text-[10px] px-2 py-1 tracking-[0.2em] uppercase">
            Bestseller
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-1">
          {product.genre}
        </div>
        <h3 className="font-serif-display text-xl text-[#1A1A1A] leading-tight mb-1 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-sm text-[#4A4A4A] italic mb-3">by {product.author}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-2xl text-[#722F37]" data-testid={`product-price-${product.id}`}>
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-xs text-[#4A4A4A]/60 line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#1A1A1A]">
            <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
