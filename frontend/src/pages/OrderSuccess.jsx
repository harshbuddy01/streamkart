import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check } from "lucide-react";
import { fetchOrder } from "../lib/api";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder(id).then(setOrder);
  }, [id]);

  if (!order) return <div className="sk-paper min-h-[70vh] flex items-center justify-center text-[#4A4A4A]">Loading…</div>;

  return (
    <div className="sk-paper min-h-screen pb-24" data-testid="order-success-page">
      <section className="max-w-[900px] mx-auto px-6 lg:px-12 pt-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#722F37] text-white mb-8">
          <Check size={28} />
        </div>
        <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-4">Thank you</div>
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#1A1A1A] mb-3">Your order is placed</h1>
        <p className="text-[#4A4A4A] mb-12">
          Order <span className="font-medium text-[#1A1A1A]" data-testid="order-id">{order.id.slice(0, 8)}</span> · A confirmation has been sent to {order.customer_email}.
        </p>

        <div className="bg-white border border-[#EFE9DF] rounded-sm p-8 text-left">
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="font-serif-display text-2xl text-[#1A1A1A]">Order details</h2>
            <span className="text-xs uppercase tracking-[0.2em] bg-[#EFE9DF] px-3 py-1 text-[#722F37]" data-testid="order-status">
              {order.status}
            </span>
          </div>
          <div className="space-y-4">
            {order.items.map((it) => (
              <div key={it.product_id} className="flex gap-4 text-sm pb-4 border-b border-[#EFE9DF] last:border-0 last:pb-0">
                <div className="w-12 h-16 bg-[#EFE9DF] overflow-hidden rounded-sm flex-shrink-0">
                  <img src={it.cover_image} alt={it.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-serif-display text-lg text-[#1A1A1A]">{it.title}</div>
                  <div className="text-xs text-[#4A4A4A] italic">by {it.author}</div>
                  <div className="text-xs text-[#4A4A4A] mt-1">Qty {it.quantity}</div>
                </div>
                <div className="text-[#1A1A1A]">${(it.price * it.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#D4AF37]/30 mt-6 pt-5 flex justify-between items-baseline">
            <span className="text-sm uppercase tracking-[0.2em] text-[#1A1A1A]">Total paid</span>
            <span className="font-serif-display text-3xl text-[#722F37]" data-testid="order-total">
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        <Link
          to="/browse"
          className="inline-block mt-10 border border-[#1A1A1A] text-[#1A1A1A] px-8 py-4 rounded-sm uppercase text-sm tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-colors"
          data-testid="continue-shopping"
        >
          Continue browsing
        </Link>
      </section>
    </div>
  );
}
