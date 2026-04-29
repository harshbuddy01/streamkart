import { Link } from "react-router-dom";
import { Headphones, BookOpen, Star, Play } from "lucide-react";
import { useCurrency } from "../lib/currency";

const categoryMeta = (c) => {
  if (c === "audiobook") return { Icon: Headphones, label: "Stream" };
  return { Icon: BookOpen, label: "Read" };
};

export const ProductCard = ({ product }) => {
  const { Icon, label } = categoryMeta(product.category);
  const { format } = useCurrency();
  return (
    <Link
      to={`/product/${product.id}`}
      className="group block bg-white border border-[#EFE9DF] rounded-sm sk-card-hover overflow-hidden"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative overflow-hidden bg-[#1A1A1A]/95 aspect-[2/3]">
        <img
          src={product.cover_image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#F9F6F0]/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[#722F37]">
          <Icon size={11} />
          <span>{product.category}</span>
        </div>
        {product.bestseller && (
          <div className="absolute top-3 right-3 bg-[#722F37] text-white text-[10px] px-2 py-1 tracking-[0.2em] uppercase">
            Bestseller
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#1A1A1A]/85 backdrop-blur text-[#F9F6F0] text-[10px] px-2.5 py-1 tracking-[0.2em] uppercase">
          <Play size={9} className="fill-[#D4AF37] text-[#D4AF37]" />
          {label} online
        </div>
      </div>
      <div className="p-5">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-1">{product.genre}</div>
        <h3 className="font-serif-display text-xl text-[#1A1A1A] leading-tight mb-1 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-[#4A4A4A] italic mb-3">by {product.author}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-2xl text-[#722F37]" data-testid={`product-price-${product.id}`}>
              {format(product.price)}
            </span>
            {product.original_price && (
              <span className="text-xs text-[#4A4A4A]/60 line-through">{format(product.original_price)}</span>
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
