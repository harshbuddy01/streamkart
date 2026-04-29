import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Sun, Moon, Coffee,
  Type, BookOpen, Headphones, Play, Pause, Rewind, FastForward,
} from "lucide-react";
import { toast } from "sonner";
import { API } from "../lib/api";

const THEMES = {
  paper: { bg: "#F9F6F0", surface: "#FFFFFF", text: "#1A1A1A", muted: "#4A4A4A", accent: "#722F37" },
  sepia: { bg: "#F4ECD8", surface: "#FBF3DC", text: "#3B2A14", muted: "#6B5635", accent: "#8B4513" },
  night: { bg: "#1A1A1A", surface: "#222020", text: "#EAE3D2", muted: "#9A9181", accent: "#D4AF37" },
};

const FONT_SIZES = [16, 18, 20, 22];

export default function Reader() {
  const { orderId, productId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/read/${orderId}/${productId}`)
      .then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          throw new Error(e.detail || "Unable to open title");
        }
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId, productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center text-[#4A4A4A]">
        Opening your title…
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center" data-testid="reader-error">
        <div className="text-center max-w-md">
          <h1 className="font-serif-display text-3xl text-[#1A1A1A] mb-3">{error}</h1>
          <p className="text-[#4A4A4A] mb-6">
            If you've just paid and this seems wrong, please reach out via support.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="border border-[#1A1A1A] text-[#1A1A1A] px-6 py-3 rounded-sm uppercase text-xs tracking-wider"
            >
              Go back
            </button>
            <Link
              to="/policy/support"
              className="bg-[#722F37] text-white px-6 py-3 rounded-sm uppercase text-xs tracking-wider"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (data.reader.kind === "audiobook") return <AudiobookPlayer data={data} />;
  return <BookReader data={data} />;
}

/* -------------------------- Book Reader -------------------------- */
function BookReader({ data }) {
  const { product, reader, order_id } = data;
  const [chapter, setChapter] = useState(0);
  const [theme, setTheme] = useState("paper");
  const [fontIdx, setFontIdx] = useState(1);
  const t = THEMES[theme];
  const c = reader.chapters[chapter];

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [chapter]);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: t.bg, color: t.text }} data-testid="book-reader">
      <ReaderTopBar
        product={product}
        order_id={order_id}
        theme={theme}
        setTheme={setTheme}
        fontIdx={fontIdx}
        setFontIdx={setFontIdx}
        accent={t.accent}
        muted={t.muted}
        surface={t.surface}
      />

      <div className="max-w-[760px] mx-auto px-6 lg:px-12 pt-12">
        <div className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: t.accent }}>
          {product.author}
        </div>
        <h1 className="font-serif-display text-4xl md:text-5xl leading-tight mb-6" style={{ color: t.text }}>
          {product.title}
        </h1>
        <div className="text-xs italic mb-12 px-4 py-3 border-l-2" style={{ borderColor: t.accent, color: t.muted, backgroundColor: t.surface }}>
          {reader.preview_note}
        </div>

        <h2 className="font-serif-display text-2xl mb-6" data-testid="chapter-title" style={{ color: t.text }}>
          {c.title}
        </h2>
        <article
          className="font-serif-display leading-[1.85]"
          data-testid="chapter-body"
          style={{ fontSize: `${FONT_SIZES[fontIdx]}px`, color: t.text }}
        >
          {c.paragraphs.map((p, i) => (
            <p key={i} className="mb-6 first-letter:font-serif-display first-letter:text-[2.4em] first-letter:leading-none first-letter:font-medium first-letter:mr-1 first-letter:float-left">
              {p}
            </p>
          ))}
        </article>

        {/* Pagination */}
        <div className="mt-16 flex items-center justify-between gap-4 border-t pt-8" style={{ borderColor: `${t.muted}33` }}>
          <button
            onClick={() => setChapter((i) => Math.max(0, i - 1))}
            disabled={chapter === 0}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-sm border disabled:opacity-30 transition-colors"
            style={{ borderColor: t.text, color: t.text }}
            data-testid="prev-chapter"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-xs tracking-[0.3em] uppercase" style={{ color: t.muted }}>
            {chapter + 1} / {reader.chapters.length}
          </span>
          <button
            onClick={() => setChapter((i) => Math.min(reader.chapters.length - 1, i + 1))}
            disabled={chapter === reader.chapters.length - 1}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-sm transition-colors disabled:opacity-30"
            style={{ backgroundColor: t.accent, color: theme === "night" ? "#1A1A1A" : "#FFFFFF" }}
            data-testid="next-chapter"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- Audiobook Player -------------------------- */
function AudiobookPlayer({ data }) {
  const { product, reader, order_id } = data;
  const audioRef = useRef(null);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const t = THEMES.night;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => { setProgress(el.currentTime); setDuration(el.duration || 0); };
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    el.addEventListener("ended", onEnd);
    el.playbackRate = speed;
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
      el.removeEventListener("ended", onEnd);
    };
  }, [speed, track]);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      try { await el.play(); setPlaying(true); }
      catch { toast.error("Tap play once more — your browser blocked autoplay."); }
    } else { el.pause(); setPlaying(false); }
  };

  const seek = (delta) => {
    const el = audioRef.current; if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta));
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text }} data-testid="audiobook-player">
      <ReaderTopBar product={product} order_id={order_id} accent={t.accent} muted={t.muted} surface={t.surface} dark />

      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-16 pb-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-2xl" style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
            <img src={product.cover_image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="mt-3 text-xs italic px-4 py-3 border-l-2" style={{ borderColor: t.accent, color: t.muted, backgroundColor: t.surface }}>
            {reader.preview_note}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: t.accent }}>{product.author}</div>
          <h1 className="font-serif-display text-4xl md:text-5xl leading-tight mb-2">{product.title}</h1>
          <p className="text-sm" style={{ color: t.muted }}>Total runtime: {reader.duration}</p>

          {/* Now playing */}
          <div className="mt-10 p-6 rounded-sm" style={{ backgroundColor: t.surface, border: `1px solid ${t.muted}22` }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: t.accent }}>Now Playing</div>
            <div className="font-serif-display text-2xl mb-6" data-testid="now-playing-title">{reader.tracks[track].title}</div>

            {/* Progress */}
            <div className="h-1.5 w-full rounded-full overflow-hidden mb-2" style={{ backgroundColor: `${t.muted}33` }}>
              <div className="h-full transition-[width] duration-200" style={{ width: `${pct}%`, backgroundColor: t.accent }} />
            </div>
            <div className="flex justify-between text-xs mb-7" style={{ color: t.muted }}>
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => seek(-15)} className="p-2 hover:opacity-80" data-testid="rewind-15" aria-label="rewind 15s">
                <Rewind size={22} />
                <span className="text-[9px] block -mt-1">15s</span>
              </button>
              <button
                onClick={toggle}
                className="w-16 h-16 flex items-center justify-center rounded-full transition-transform hover:scale-105"
                style={{ backgroundColor: t.accent, color: "#1A1A1A" }}
                data-testid="play-toggle"
                aria-label={playing ? "pause" : "play"}
              >
                {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>
              <button onClick={() => seek(30)} className="p-2 hover:opacity-80" data-testid="forward-30" aria-label="forward 30s">
                <FastForward size={22} />
                <span className="text-[9px] block -mt-1">30s</span>
              </button>
            </div>

            {/* Speed */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: t.muted }}>
              <span className="tracking-[0.2em] uppercase">Speed</span>
              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded-sm transition-colors ${speed === s ? "" : "opacity-50 hover:opacity-100"}`}
                  style={speed === s ? { backgroundColor: t.accent, color: "#1A1A1A" } : { color: t.text }}
                  data-testid={`speed-${s}`}
                >
                  {s}×
                </button>
              ))}
            </div>

            <audio ref={audioRef} src={reader.tracks[track].url} preload="metadata" />
          </div>

          {/* Track list */}
          <div className="mt-10">
            <div className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: t.accent }}>Tracks</div>
            <div className="space-y-1">
              {reader.tracks.map((tr, i) => (
                <button
                  key={tr.index}
                  onClick={() => { setTrack(i); setPlaying(false); setTimeout(toggle, 100); }}
                  className="w-full flex items-center justify-between text-left px-4 py-3 rounded-sm transition-colors hover:bg-white/5"
                  style={{ backgroundColor: track === i ? `${t.accent}22` : "transparent", borderLeft: track === i ? `2px solid ${t.accent}` : "2px solid transparent" }}
                  data-testid={`track-${tr.index}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-6" style={{ color: t.muted }}>{String(tr.index).padStart(2, "0")}</span>
                    <span className="font-serif-display text-lg">{tr.title}</span>
                  </div>
                  <span className="text-xs" style={{ color: t.muted }}>{tr.length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- Top Bar -------------------------- */
function ReaderTopBar({ product, order_id, theme, setTheme, fontIdx, setFontIdx, accent, muted, surface, dark }) {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b"
      style={{
        backgroundColor: dark ? "rgba(26,26,26,0.85)" : `${surface}cc`,
        borderColor: `${muted}33`,
      }}
      data-testid="reader-topbar"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between gap-3">
        <Link
          to={`/order/${order_id}`}
          className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
          style={{ color: dark ? "#EAE3D2" : "#1A1A1A" }}
          data-testid="back-to-order"
        >
          <ArrowLeft size={16} /> <span>Back to library</span>
        </Link>
        <div className="hidden md:flex items-center gap-3 text-xs uppercase tracking-[0.3em]" style={{ color: muted }}>
          {product.category === "audiobook" ? <Headphones size={14} /> : <BookOpen size={14} />}
          <span>{product.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {setFontIdx && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-sm border" style={{ borderColor: `${muted}55` }}>
              <Type size={12} style={{ color: muted }} />
              <button onClick={() => setFontIdx(Math.max(0, fontIdx - 1))} className="px-1 text-sm" data-testid="font-smaller">A−</button>
              <button onClick={() => setFontIdx(Math.min(FONT_SIZES.length - 1, fontIdx + 1))} className="px-1 text-base" data-testid="font-larger">A+</button>
            </div>
          )}
          {setTheme && (
            <div className="flex items-center rounded-sm border overflow-hidden" style={{ borderColor: `${muted}55` }}>
              {[
                { id: "paper", Icon: Sun, label: "Paper" },
                { id: "sepia", Icon: Coffee, label: "Sepia" },
                { id: "night", Icon: Moon, label: "Night" },
              ].map(({ id, Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  title={label}
                  className="px-2.5 py-1.5 transition-colors"
                  style={theme === id ? { backgroundColor: accent, color: "#FFFFFF" } : { color: muted }}
                  data-testid={`theme-${id}`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
