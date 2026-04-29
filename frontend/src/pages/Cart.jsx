import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../lib/cart";

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="sk-paper min-h-[70vh] flex items-center justify-center" data-testid="cart-empty">
        <div className="text-center max-w-md">
          <ShoppingBag className="mx-auto mb-6 text-[#722F37]" size={40} />
          <h1 className="font-serif-display text-4xl text-[#1A1A1A] mb-3">Your cart is empty</h1>
          <p className="text-[#4A4A4A] mb-8">Begin a new chapter — explore our curated collection.</p>
          <Link
            to="/browse"
            className="inline-block bg-[#722F37] text-white px-8 py-4 rounded-sm uppercase text-sm tracking-wider hover:bg-[#5a252b] transition-colors"
            data-testid="browse-from-empty-cart"
          >
            Browse books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sk-paper min-h-screen pb-24" data-testid="cart-page">
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-10">
        <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-3">Your Order</div>
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#1A1A1A]">Shopping cart</h1>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-4" data-testid="cart-items">
          {items.map((it) => (
            <div
              key={it.product_id}
              className="bg-white border border-[#EFE9DF] rounded-sm p-5 flex gap-5"
              data-testid={`cart-item-${it.product_id}`}
            >
              <div className="w-24 h-32 flex-shrink-0 bg-[#EFE9DF] overflow-hidden rounded-sm">
                <img src={it.cover_image} alt={it.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-serif-display text-2xl text-[#1A1A1A] leading-tight">{it.title}</h3>
                <p className="text-sm text-[#4A4A4A] italic mb-3">by {it.author}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-[#1A1A1A]/30 rounded-sm text-sm">
                    <button onClick={() => updateQty(it.product_id, it.quantity - 1)} className="px-3 py-1 hover:bg-[#EFE9DF]" data-testid={`decrease-${it.product_id}`}>−</button>
                    <span className="px-4 py-1">{it.quantity}</span>
                    <button onClick={() => updateQty(it.product_id, it.quantity + 1)} className="px-3 py-1 hover:bg-[#EFE9DF]" data-testid={`increase-${it.product_id}`}>+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-serif-display text-2xl text-[#722F37]">
                      ${(it.price * it.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(it.product_id)}
                      className="text-[#4A4A4A] hover:text-[#722F37] transition-colors"
                      data-testid={`remove-${it.product_id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white border border-[#EFE9DF] rounded-sm p-7 sticky top-32" data-testid="cart-summary">
            <h2 className="font-serif-display text-2xl text-[#1A1A1A] mb-6">Order summary</h2>
            <div className="flex justify-between text-sm text-[#4A4A4A] mb-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#4A4A4A] mb-2">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-[#D4AF37]/30 mt-5 pt-5 flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-[0.2em] text-[#1A1A1A]">Total</span>
              <span className="font-serif-display text-3xl text-[#722F37]" data-testid="cart-total">${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-7 bg-[#722F37] text-white py-4 rounded-sm uppercase text-sm tracking-wider hover:bg-[#5a252b] transition-colors"
              data-testid="checkout-button"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
