import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const POLICIES = {
  terms: {
    title: "Terms & Conditions",
    eyebrow: "The Fine Print",
    sections: [
      {
        h: "1. Welcome to StreamKart",
        p: "By accessing or using StreamKart (the \"Service\"), you agree to be bound by these Terms. StreamKart provides digital books, audiobooks and news publications for online reading and streaming only. We do not ship any physical product.",
      },
      {
        h: "2. Your Account & Library",
        p: "When you purchase a title, a non-transferable, non-exclusive licence is granted to read or stream that title online via our website on any compatible device. The licence is personal — it may not be sold, lent or shared.",
      },
      {
        h: "3. Acceptable Use",
        p: "You may not download, copy, redistribute, screenshot for resale, or attempt to circumvent any DRM or access control on the Service. Violation may result in immediate account termination without refund.",
      },
      {
        h: "4. Pricing & Currency",
        p: "All prices are listed in INR (Indian Rupees) as our base currency and are automatically displayed in your local currency for convenience. The final charge is processed in INR by our payment gateway. Conversion rates shown on-site are approximate; your card issuer's actual rate may vary slightly. We reserve the right to change pricing for future purchases at any time; prior purchases are unaffected.",
      },
      {
        h: "5. Availability",
        p: "Titles may be added or removed from the catalog at the publisher's discretion. If a title you have purchased is removed, you retain perpetual access to read it online via your account.",
      },
      {
        h: "6. Limitation of Liability",
        p: "StreamKart is provided \"as is\". To the fullest extent permitted by law, we are not liable for indirect, incidental or consequential damages arising from use of the Service.",
      },
      {
        h: "7. Governing Law",
        p: "These Terms are governed by the laws of the jurisdiction in which StreamKart is registered. Disputes shall be settled in the competent courts of that jurisdiction.",
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    eyebrow: "Final Sale",
    sections: [
      {
        h: "All sales are final.",
        p: "Because every StreamKart purchase grants instant digital access to the full title, all purchases are non-refundable once the order has been placed and payment is confirmed. There are no refunds, no exchanges and no chargebacks honoured after a successful purchase.",
      },
      {
        h: "Why a strict no-refund policy?",
        p: "Unlike a physical bookstore, our titles are delivered to you instantly and in full at the moment of purchase. We cannot \"un-read\" a digital book or recover an audiobook stream. To remain fair to authors, publishers and the wider StreamKart community, we operate a strict no-refund-after-purchase policy.",
      },
      {
        h: "Before you buy",
        p: "We strongly encourage you to review the title preview, sample chapters (where available), language, duration and edition details on the product page before completing your purchase. By proceeding to checkout, you acknowledge and accept this no-refund policy.",
      },
      {
        h: "Failed or duplicate payments",
        p: "If your payment was charged twice for the same order due to a technical error, or if you were charged but did not receive access to the title, please contact our support team within 7 days. Verified duplicate or failed deliveries are the only cases eligible for resolution — typically by re-issuing access to your library.",
      },
      {
        h: "Contact",
        p: "Questions about this policy? Reach our team via the Support page. We respond within one business day.",
      },
    ],
  },
  support: {
    title: "Support",
    eyebrow: "We're Here to Help",
    sections: [
      {
        h: "How can we help today?",
        p: "Whether you're having trouble accessing a title, need help with payment, or just want a recommendation from our editors — our team is here for you.",
      },
      {
        h: "Reach the team",
        p: "Email: support@streamkart.example  ·  Response time: within 1 business day  ·  Hours: 9am–7pm (your local time), Monday to Friday.",
      },
      {
        h: "Frequently asked",
        p: "› How do I read my book online? After purchase, your title appears in your StreamKart library on the order confirmation page. Open it on any browser to begin reading or streaming instantly.\n\n› Can I download books offline? Streaming is online-only on the standard plan. Offline reading is on our roadmap.\n\n› I was charged but didn't receive access. Forward your order confirmation to support and we'll restore access immediately.\n\n› Do you offer gift cards? Coming soon.",
      },
    ],
  },
};

export default function Policy() {
  const { type } = useParams();
  const data = POLICIES[type];

  if (!data) {
    return (
      <div className="sk-paper min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif-display text-4xl text-[#1A1A1A] mb-4">Page not found</h1>
          <Link to="/" className="text-[#722F37] underline">Return home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sk-paper min-h-screen pb-24" data-testid={`policy-${type}-page`}>
      <div className="max-w-[900px] mx-auto px-6 lg:px-12 pt-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#4A4A4A] hover:text-[#722F37]">
          <ArrowLeft size={14} /> Back to StreamKart
        </Link>
      </div>
      <section className="max-w-[900px] mx-auto px-6 lg:px-12 pt-10 pb-8 border-b border-[#D4AF37]/30">
        <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-4">{data.eyebrow}</div>
        <h1 className="font-serif-display text-5xl md:text-6xl text-[#1A1A1A] leading-tight">{data.title}</h1>
        <p className="text-xs text-[#4A4A4A] mt-4">Last updated: April 2026</p>
      </section>
      <article className="max-w-[900px] mx-auto px-6 lg:px-12 py-12 space-y-10">
        {data.sections.map((s, i) => (
          <div key={i} data-testid={`policy-section-${i}`}>
            <h2 className="font-serif-display text-2xl md:text-3xl text-[#1A1A1A] mb-3">{s.h}</h2>
            <p className="text-[#4A4A4A] leading-relaxed whitespace-pre-line">{s.p}</p>
          </div>
        ))}
      </article>
    </div>
  );
}
