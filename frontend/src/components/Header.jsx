import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, Globe, User, LifeBuoy, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCart } from "../lib/cart";
import { useCurrency } from "../lib/currency";
import { useAuth } from "../lib/auth";

export const Header = () => {
  const { totalCount } = useCart();
  const { code, meta, currencies, setCurrency } = useCurrency();
  const { user, isAuthed, logout } = useAuth();
  const [q, setQ] = useState("");
  const [openCurrency, setOpenCurrency] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/browse?search=${encodeURIComponent(q.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setOpenAccount(false);
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl bg-[#F9F6F0]/85 border-b border-[#D4AF37]/30"
      data-testid="site-header"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5 grid grid-cols-3 items-center gap-4">
        <nav className="hidden md:flex items-center gap-7 text-sm tracking-wide text-[#1A1A1A]">
          <Link to="/browse?category=book" className="hover:text-[#722F37] transition-colors" data-testid="nav-books">Books</Link>
          <Link to="/browse?category=audiobook" className="hover:text-[#722F37] transition-colors" data-testid="nav-audiobooks">Audiobooks</Link>
          <Link to="/browse" className="hover:text-[#722F37] transition-colors" data-testid="nav-all">All Titles</Link>
          <Link to="/support" className="hover:text-[#722F37] transition-colors flex items-center gap-1" data-testid="nav-support">
            <LifeBuoy size={14} /> Support
          </Link>
        </nav>
        <button className="md:hidden justify-self-start text-[#1A1A1A]" data-testid="mobile-menu">
          <Menu size={22} />
        </button>

        <Link to="/" className="text-center" data-testid="site-logo">
          <div className="font-serif-display text-3xl lg:text-4xl text-[#1A1A1A] leading-none">
            StreamKart
          </div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-[#722F37] mt-1">
            Read Online · Worldwide
          </div>
        </Link>

        <div className="flex items-center justify-end gap-3">
          <form onSubmit={submit} className="hidden lg:flex items-center bg-white border border-[#EFE9DF] rounded-sm px-3 py-2 w-48">
            <Search size={16} className="text-[#722F37]" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="bg-transparent outline-none px-2 text-sm w-full text-[#1A1A1A] placeholder:text-[#4A4A4A]/60"
              data-testid="header-search-input"
            />
          </form>

          {/* Currency selector */}
          <div className="relative">
            <button
              onClick={() => { setOpenCurrency((v) => !v); setOpenAccount(false); }}
              className="flex items-center gap-1.5 text-sm text-[#1A1A1A] hover:text-[#722F37] transition-colors px-2 py-1 border border-transparent hover:border-[#D4AF37]/30 rounded-sm"
              data-testid="currency-toggle"
              aria-label="Change currency"
            >
              <Globe size={16} />
              <span className="hidden sm:inline font-medium">{code}</span>
            </button>
            {openCurrency && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenCurrency(false)} />
                <div className="absolute right-0 mt-2 z-50 bg-white border border-[#EFE9DF] rounded-sm shadow-lg py-2 w-56" data-testid="currency-menu">
                  <div className="px-4 py-2 text-[10px] tracking-[0.3em] uppercase text-[#722F37]">Display Currency</div>
                  {Object.values(currencies).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setOpenCurrency(false); }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between text-sm hover:bg-[#EFE9DF] ${c.code === code ? "text-[#722F37] font-medium" : "text-[#1A1A1A]"}`}
                      data-testid={`currency-option-${c.code}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 text-center">{c.symbol}</span>
                        <span>{c.code}</span>
                      </span>
                      <span className="text-xs text-[#4A4A4A]">{c.name}</span>
                    </button>
                  ))}
                  <div className="px-4 pt-2 mt-1 border-t border-[#EFE9DF] text-[10px] text-[#4A4A4A]/80 leading-relaxed">
                    Detected from your location · charged in {meta.code}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Account */}
          {!isAuthed ? (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#1A1A1A] hover:text-[#722F37] transition-colors px-3 py-1.5 border border-[#1A1A1A]/30 rounded-sm hover:border-[#1A1A1A]"
              data-testid="header-login"
            >
              <User size={14} /> Sign in
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => { setOpenAccount((v) => !v); setOpenCurrency(false); }}
                className="flex items-center gap-1.5 text-sm text-[#1A1A1A] hover:text-[#722F37] transition-colors px-2 py-1 border border-transparent hover:border-[#D4AF37]/30 rounded-sm"
                data-testid="account-toggle"
              >
                <span className="w-7 h-7 rounded-full bg-[#722F37] text-white flex items-center justify-center text-[11px] font-medium">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden md:inline">{user.name?.split(" ")[0]}</span>
                <ChevronDown size={12} />
              </button>
              {openAccount && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenAccount(false)} />
                  <div className="absolute right-0 mt-2 z-50 bg-white border border-[#EFE9DF] rounded-sm shadow-lg py-2 w-60" data-testid="account-menu">
                    <div className="px-4 py-2 border-b border-[#EFE9DF]">
                      <div className="text-sm font-medium text-[#1A1A1A]">{user.name}</div>
                      <div className="text-xs text-[#4A4A4A]">{user.email}</div>
                    </div>
                    <Link to="/support" onClick={() => setOpenAccount(false)} className="block px-4 py-2 text-sm hover:bg-[#EFE9DF] text-[#1A1A1A]" data-testid="menu-tickets">
                      <LifeBuoy size={14} className="inline mr-2 text-[#722F37]" /> Support tickets
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-[#EFE9DF] text-[#1A1A1A]" data-testid="menu-logout">
                      <LogOut size={14} className="inline mr-2 text-[#722F37]" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <Link
            to="/cart"
            className="relative flex items-center gap-2 text-[#1A1A1A] hover:text-[#722F37] transition-colors"
            data-testid="cart-button"
          >
            <ShoppingBag size={20} />
            <span className="hidden lg:inline text-sm">Cart</span>
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-[#722F37] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-medium" data-testid="cart-badge">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
