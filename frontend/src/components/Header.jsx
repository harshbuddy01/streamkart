import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { useCart } from "../lib/cart";
import { useState } from "react";

export const Header = () => {
  const { totalCount } = useCart();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/browse?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl bg-[#F9F6F0]/85 border-b border-[#D4AF37]/30"
      data-testid="site-header"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 grid grid-cols-3 items-center gap-4">
        {/* Left: Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide text-[#1A1A1A]">
          <Link to="/browse?category=book" className="hover:text-[#722F37] transition-colors" data-testid="nav-books">Books</Link>
          <Link to="/browse?category=audiobook" className="hover:text-[#722F37] transition-colors" data-testid="nav-audiobooks">Audiobooks</Link>
          <Link to="/browse?category=news" className="hover:text-[#722F37] transition-colors" data-testid="nav-news">News</Link>
        </nav>
        <button className="md:hidden justify-self-start text-[#1A1A1A]" data-testid="mobile-menu">
          <Menu size={22} />
        </button>

        {/* Center: Logo */}
        <Link to="/" className="text-center" data-testid="site-logo">
          <div className="font-serif-display text-3xl lg:text-4xl text-[#1A1A1A] leading-none">
            StreamKart
          </div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#722F37] mt-1">
            International Bookstore
          </div>
        </Link>

        {/* Right: Search + Cart */}
        <div className="flex items-center justify-end gap-4">
          <form onSubmit={submit} className="hidden lg:flex items-center bg-white border border-[#EFE9DF] rounded-sm px-3 py-2 w-64">
            <Search size={16} className="text-[#722F37]" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search authors, titles…"
              className="bg-transparent outline-none px-2 text-sm w-full text-[#1A1A1A] placeholder:text-[#4A4A4A]/60"
              data-testid="header-search-input"
            />
          </form>
          <Link
            to="/cart"
            className="relative flex items-center gap-2 text-[#1A1A1A] hover:text-[#722F37] transition-colors"
            data-testid="cart-button"
          >
            <ShoppingBag size={20} />
            <span className="hidden sm:inline text-sm">Cart</span>
            {totalCount > 0 && (
              <span
                className="absolute -top-2 -right-3 bg-[#722F37] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-medium"
                data-testid="cart-badge"
              >
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
