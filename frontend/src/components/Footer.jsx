import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="bg-[#1A1A1A] text-[#F9F6F0] mt-24" data-testid="site-footer">
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 grid grid-cols-2 md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <div className="font-serif-display text-4xl mb-3">StreamKart</div>
        <p className="text-[#F9F6F0]/70 text-sm leading-relaxed max-w-md">
          A curated bookstore for international readers — books, audiobooks and news collections from the
          world's most celebrated voices. Delivered in print, in audio, in good company.
        </p>
        <div className="mt-8 flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#D4AF37]">
          <span>Est. 2026</span>
          <span className="w-8 h-px bg-[#D4AF37]/50" />
          <span>Worldwide Shipping</span>
        </div>
      </div>
      <div>
        <div className="text-xs tracking-[0.3em] uppercase text-[#D4AF37] mb-4">Browse</div>
        <ul className="space-y-2 text-sm text-[#F9F6F0]/80">
          <li><Link to="/browse?category=book" className="hover:text-[#D4AF37]">Books</Link></li>
          <li><Link to="/browse?category=audiobook" className="hover:text-[#D4AF37]">Audiobooks</Link></li>
          <li><Link to="/browse?category=news" className="hover:text-[#D4AF37]">News</Link></li>
          <li><Link to="/browse" className="hover:text-[#D4AF37]">All Titles</Link></li>
        </ul>
      </div>
      <div>
        <div className="text-xs tracking-[0.3em] uppercase text-[#D4AF37] mb-4">Customer</div>
        <ul className="space-y-2 text-sm text-[#F9F6F0]/80">
          <li>Shipping & Delivery</li>
          <li>Returns</li>
          <li>Gift Cards</li>
          <li>Contact</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-[#F9F6F0]/50">
        <span>© 2026 StreamKart. All rights reserved.</span>
        <span className="font-serif-display italic">"A reader lives a thousand lives."</span>
      </div>
    </div>
  </footer>
);
