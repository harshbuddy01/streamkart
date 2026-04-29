import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";
import { useCart } from "../lib/cart";
import { createOrder, verifyPayment } from "../lib/api";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    navigate("/browse");
    return null;
  }

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email";
    if (!/^\+?[0-9]{7,15}$/.test(form.phone.replace(/\s/g, ""))) return "Please enter a valid phone number";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      const orderResp = await createOrder({
        items: items.map((i) => ({
          product_id: i.product_id,
          title: i.title,
          author: i.author,
          price: i.price,
          quantity: i.quantity,
          cover_image: i.cover_image,
        })),
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        payment_method: paymentMethod,
      });

      // Simulate payment gateway redirect / popup with mock 1.2s delay
      toast.message(`Opening ${paymentMethod === "razorpay" ? "Razorpay" : "Cashfree"} secure checkout…`);
      await new Promise((r) => setTimeout(r, 1200));

      const mockPaymentId =
        (paymentMethod === "razorpay" ? "pay_" : "cf_pay_") +
        Math.random().toString(36).slice(2, 14);

      await verifyPayment({
        order_id: orderResp.order_id,
        payment_id: mockPaymentId,
        payment_method: paymentMethod,
      });

      toast.success("Payment successful");
      clear();
      navigate(`/order/${orderResp.order_id}`);
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sk-paper min-h-screen pb-24" data-testid="checkout-page">
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-10">
        <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-3">Final Step</div>
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#1A1A1A]">Checkout</h1>
      </section>

      <form onSubmit={submit} className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <div>
            <h2 className="font-serif-display text-2xl text-[#1A1A1A] mb-5">Contact details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                placeholder="Full name"
                value={form.name} onChange={update("name")}
                className="bg-white border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
                data-testid="checkout-name"
                required
              />
              <input
                type="email" placeholder="Email"
                value={form.email} onChange={update("email")}
                className="bg-white border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
                data-testid="checkout-email"
                required
              />
              <input
                placeholder="Phone (with country code)"
                value={form.phone} onChange={update("phone")}
                className="sm:col-span-2 bg-white border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
                data-testid="checkout-phone"
                required
              />
            </div>
          </div>

          <div>
            <h2 className="font-serif-display text-2xl text-[#1A1A1A] mb-5">Payment method</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { id: "razorpay", label: "Razorpay", desc: "Cards, UPI, Netbanking, Wallets" },
                { id: "cashfree", label: "Cashfree", desc: "Cards, UPI, EMI, Pay Later" },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`cursor-pointer bg-white border rounded-sm p-5 flex items-start gap-4 transition-colors ${
                    paymentMethod === m.id ? "border-[#722F37] ring-1 ring-[#722F37]" : "border-[#EFE9DF] hover:border-[#1A1A1A]/30"
                  }`}
                  data-testid={`payment-option-${m.id}`}
                >
                  <input
                    type="radio" name="paymentMethod" value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="mt-1 accent-[#722F37]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-[#722F37]" />
                      <span className="font-serif-display text-xl text-[#1A1A1A]">{m.label}</span>
                    </div>
                    <p className="text-xs text-[#4A4A4A] mt-1">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-[#4A4A4A] mt-4 flex items-center gap-2">
              <Lock size={12} /> Demo mode — payments are simulated. Connect live keys to enable real charges.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-[#EFE9DF] rounded-sm p-7 sticky top-32" data-testid="checkout-summary">
            <h2 className="font-serif-display text-2xl text-[#1A1A1A] mb-5">Order</h2>
            <div className="space-y-3 max-h-72 overflow-auto pr-2">
              {items.map((it) => (
                <div key={it.product_id} className="flex gap-3 text-sm">
                  <div className="w-12 h-16 bg-[#EFE9DF] overflow-hidden rounded-sm flex-shrink-0">
                    <img src={it.cover_image} alt={it.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[#1A1A1A]">{it.title}</div>
                    <div className="text-xs text-[#4A4A4A]">Qty {it.quantity} · ${it.price.toFixed(2)}</div>
                  </div>
                  <div className="text-[#1A1A1A]">${(it.price * it.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#D4AF37]/30 mt-5 pt-5 flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-[0.2em] text-[#1A1A1A]">Total</span>
              <span className="font-serif-display text-3xl text-[#722F37]" data-testid="checkout-total">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-7 bg-[#722F37] text-white py-4 rounded-sm uppercase text-sm tracking-wider hover:bg-[#5a252b] disabled:opacity-60 transition-colors"
              data-testid="place-order-button"
            >
              {submitting ? "Processing…" : `Pay $${subtotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
