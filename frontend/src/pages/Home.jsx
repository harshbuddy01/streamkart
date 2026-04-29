import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Headphones, BookOpen, Play, Wifi, Globe2 } from "lucide-react";
import { fetchProducts, fetchAuthors } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { AuthorMarquee } from "../components/AuthorMarquee";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/26a13d95-9a81-4a7b-888d-0068c84116d6/images/2e5f7b9d4f5f17d4c5aa2355bd89702af151c78e3e5c9880385b45b3f3994958.png";
const AUDIO_IMG = "https://images.pexels.com/photos/12955927/pexels-photo-12955927.jpeg?auto=compress&w=1200";
const LIB_IMG = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [audiobooks, setAudiobooks] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchProducts({ featured: true, limit: 8 }),
      fetchProducts({ bestseller: true, limit: 6 }),
      fetchProducts({ category: "audiobook", limit: 4 }),
      fetchAuthors(),
    ]).then(([f, b, a, au]) => {
      setFeatured(f); setBestsellers(b); setAudiobooks(a); setAuthors(au);
    });
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section data-testid="hero-section" className="sk-paper">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 lg:pt-20 pb-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs tracking-[0.4em] uppercase text-[#722F37] mb-6">
                <Wifi size={12} /> Streaming Edition · Spring 2026
              </div>
              <h1 className="font-serif-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-[#1A1A1A]">
                Read the world,
                <br />
                <span className="italic text-[#722F37]">instantly,</span>
                <br />
                online.
              </h1>
              <p className="mt-8 text-base md:text-lg text-[#4A4A4A] max-w-xl leading-relaxed">
                A digital bookstore for international readers. Stream books and audiobooks from
                Murakami to Márquez, Atwood to Adichie, Roy to Rushdie — straight to your browser.
                No shipping. No waiting. Open and read.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 bg-[#722F37] text-white px-8 py-4 rounded-sm hover:bg-[#5a252b] transition-colors text-sm tracking-wider uppercase"
                  data-testid="hero-cta-shop"
                >
                  Browse Library <ArrowRight size={16} />
                </Link>
                <Link
                  to="/browse?category=audiobook"
                  className="inline-flex items-center gap-2 border border-[#1A1A1A] text-[#1A1A1A] px-8 py-4 rounded-sm hover:bg-[#1A1A1A] hover:text-white transition-colors text-sm tracking-wider uppercase"
                  data-testid="hero-cta-audio"
                >
                  <Play size={14} /> Stream Audiobooks
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm text-[#4A4A4A]">
                <div className="flex items-center gap-2"><Globe2 size={14} className="text-[#722F37]" /> 10+ international authors</div>
                <div className="flex items-center gap-2"><Wifi size={14} className="text-[#722F37]" /> Read instantly online</div>
                <div className="flex items-center gap-2"><Headphones size={14} className="text-[#722F37]" /> Stream on any device</div>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] overflow-hidden rounded-sm border border-[#D4AF37]/30">
                <img src={HERO_IMG} alt="StreamKart curated stack" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#F9F6F0] border border-[#D4AF37]/40 px-6 py-4 rounded-sm hidden md:block">
                <div className="font-serif-display text-2xl text-[#722F37]">2,400+</div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-[#1A1A1A]">Digital titles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthorMarquee authors={authors} />

      {/* CATEGORIES */}
      <section data-testid="categories-section" className="sk-paper">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 grid md:grid-cols-2 gap-6">
          {[
            { slug: "book", title: "Books", desc: "Read complete digital editions on any browser.", Icon: BookOpen },
            { slug: "audiobook", title: "Audiobooks", desc: "Stream world-class narrators in HD audio.", Icon: Headphones },
          ].map((c) => (
            <Link
              key={c.slug}
              to={`/browse?category=${c.slug}`}
              className="group bg-white border border-[#EFE9DF] p-10 rounded-sm sk-card-hover"
              data-testid={`category-card-${c.slug}`}
            >
              <div className="text-[#722F37] mb-6"><c.Icon size={22} /></div>
              <div className="font-serif-display text-3xl text-[#1A1A1A] mb-2">{c.title}</div>
              <p className="text-sm text-[#4A4A4A] mb-8">{c.desc}</p>
              <span className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#722F37] group-hover:gap-4 transition-all">
                Explore <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section data-testid="featured-products" className="sk-paper">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-3">Editor's Selection</div>
              <h2 className="font-serif-display text-4xl md:text-5xl text-[#1A1A1A]">Featured this season</h2>
            </div>
            <Link to="/browse" className="hidden md:inline-flex items-center gap-2 text-sm tracking-wider uppercase text-[#1A1A1A] hover:text-[#722F37]">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* DARK STREAMING BAND */}
      <section className="bg-[#1A1A1A] text-[#F9F6F0] relative overflow-hidden">
        <img src={LIB_IMG} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 py-24 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
              <Play size={12} className="fill-[#D4AF37]" /> Now Streaming
            </div>
            <h2 className="font-serif-display text-4xl md:text-6xl leading-tight">
              Open in browser. <br />
              <em className="text-[#D4AF37]">Begin reading</em> in seconds.
            </h2>
            <p className="mt-6 text-[#F9F6F0]/75 max-w-xl leading-relaxed">
              Every StreamKart purchase unlocks instantly in your library. No app installs, no
              waiting on couriers — just open your browser and read. Sync your spot across phone,
              tablet and laptop.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="aspect-[3/4] bg-white/10 border border-white/10 rounded-sm overflow-hidden">
                {featured[i] && (
                  <img src={featured[i].cover_image} alt="" className="w-full h-full object-cover opacity-90" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIOBOOK SHOWCASE */}
      <section className="sk-paper">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-sm">
              <img src={AUDIO_IMG} alt="Audiobook listener" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-4">Now playing</div>
            <h2 className="font-serif-display text-4xl md:text-6xl text-[#1A1A1A] leading-tight mb-6">
              Audiobooks, the way <em className="text-[#722F37]">authors intended.</em>
            </h2>
            <p className="text-[#4A4A4A] max-w-lg mb-8 leading-relaxed">
              Hear Murakami in Japanese cadence, Coelho in his own voice. Streamed in HD audio —
              chosen for performance as much as story.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {audiobooks.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section data-testid="bestsellers-section" className="bg-[#EFE9DF] py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-3">This week</div>
              <h2 className="font-serif-display text-4xl md:text-5xl text-[#1A1A1A]">Bestsellers</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
