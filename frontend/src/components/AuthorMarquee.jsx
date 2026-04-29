export const AuthorMarquee = ({ authors }) => {
  if (!authors || authors.length === 0) return null;
  const list = [...authors, ...authors];
  return (
    <section
      className="bg-[#EFE9DF] border-y border-[#D4AF37]/20 py-8 overflow-hidden"
      data-testid="author-marquee"
    >
      <div className="flex sk-marquee-track whitespace-nowrap" style={{ width: "max-content" }}>
        {list.map((a, i) => (
          <div key={i} className="flex items-center gap-32 px-16">
            <span className="font-serif-display text-3xl md:text-4xl text-[#1A1A1A] italic">
              {a.name}
            </span>
            <span className="text-[#D4AF37] text-2xl">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
};
