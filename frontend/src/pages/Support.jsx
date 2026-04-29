import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Send, ChevronLeft, Inbox } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth, formatApiError } from "../lib/auth";

const CATEGORIES = [
  { id: "order",   label: "Order issue" },
  { id: "payment", label: "Payment / Refund" },
  { id: "reader",  label: "Reader access" },
  { id: "account", label: "My account" },
  { id: "other",   label: "Other" },
];

const STATUS_LABEL = {
  open: { text: "Open", color: "#722F37", bg: "#722F3711" },
  awaiting_support: { text: "Awaiting Support", color: "#9A6B00", bg: "#D4AF3722" },
  responded: { text: "Responded", color: "#1A1A1A", bg: "#EFE9DF" },
  closed: { text: "Closed", color: "#4A4A4A", bg: "#EFE9DF" },
};

export default function Support() {
  const { isAuthed, user, loading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthed) {
      navigate(`/login?next=${encodeURIComponent("/support")}`);
    }
  }, [loading, isAuthed, navigate]);

  const refresh = async () => {
    try {
      const { data } = await api.get("/tickets");
      setTickets(data);
      if (data.length === 0) setShowForm(true);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  useEffect(() => { if (isAuthed) refresh(); /* eslint-disable-next-line */ }, [isAuthed]);

  if (loading || !isAuthed) {
    return <div className="sk-paper min-h-[60vh] flex items-center justify-center text-[#4A4A4A]">Loading…</div>;
  }

  if (selected) {
    return <TicketDetail ticket={selected} onBack={() => { setSelected(null); refresh(); }} />;
  }

  return (
    <div className="sk-paper min-h-screen pb-24" data-testid="support-page">
      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-12 pb-8">
        <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-3">We're here to help</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif-display text-5xl md:text-6xl text-[#1A1A1A]">Support</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-[#722F37] text-white px-6 py-3 rounded-sm uppercase text-xs tracking-wider hover:bg-[#5a252b] transition-colors"
            data-testid="toggle-new-ticket"
          >
            <Plus size={14} /> {showForm ? "Hide form" : "New ticket"}
          </button>
        </div>
        <p className="text-[#4A4A4A] mt-3">
          Hello, <span className="text-[#1A1A1A] font-medium">{user.name}</span>. Open a ticket and our team will respond within one business day.
        </p>
      </section>

      {showForm && <NewTicketForm onCreated={(t) => { setShowForm(false); refresh(); toast.success("Ticket created"); }} />}

      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-4">
        <div className="text-xs tracking-[0.3em] uppercase text-[#722F37] mb-4 flex items-center gap-2">
          <Inbox size={14} /> Your tickets
        </div>
        {tickets.length === 0 ? (
          <div className="bg-white border border-[#EFE9DF] rounded-sm p-10 text-center" data-testid="tickets-empty">
            <MessageSquare className="mx-auto mb-3 text-[#722F37]" size={28} />
            <p className="text-[#4A4A4A]">No tickets yet — open one above and our team will be in touch.</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="tickets-list">
            {tickets.map((t) => {
              const st = STATUS_LABEL[t.status] || STATUS_LABEL.open;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="w-full text-left bg-white border border-[#EFE9DF] rounded-sm p-5 hover:border-[#722F37] transition-colors"
                  data-testid={`ticket-${t.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-serif-display text-xl text-[#1A1A1A] leading-snug">{t.subject}</div>
                      <div className="text-xs text-[#4A4A4A] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="uppercase tracking-[0.2em]">{t.category}</span>
                        {t.order_id && <span>· Order #{String(t.order_id).slice(0, 8)}</span>}
                        <span>· {t.messages.length} {t.messages.length === 1 ? "message" : "messages"}</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm whitespace-nowrap"
                      style={{ color: st.color, backgroundColor: st.bg }}
                    >
                      {st.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 mt-16 grid sm:grid-cols-3 gap-4 text-sm text-[#4A4A4A]">
        <div className="bg-white border border-[#EFE9DF] rounded-sm p-5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#722F37] mb-1">Email</div>
          support@streamkart.example
        </div>
        <div className="bg-white border border-[#EFE9DF] rounded-sm p-5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#722F37] mb-1">Hours</div>
          Mon–Fri, 9am–7pm IST
        </div>
        <div className="bg-white border border-[#EFE9DF] rounded-sm p-5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#722F37] mb-1">Response time</div>
          Within 1 business day
        </div>
      </section>
    </div>
  );
}

function NewTicketForm({ onCreated }) {
  const [form, setForm] = useState({ subject: "", category: "order", order_id: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        subject: form.subject,
        category: form.category,
        message: form.message,
      };
      if (form.order_id.trim()) payload.order_id = form.order_id.trim();
      const { data } = await api.post("/tickets", payload);
      onCreated(data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-[1100px] mx-auto px-6 lg:px-12 mb-8">
      <form
        onSubmit={submit}
        className="bg-white border border-[#EFE9DF] rounded-sm p-7 space-y-5"
        data-testid="new-ticket-form"
      >
        <h2 className="font-serif-display text-2xl text-[#1A1A1A]">Open a new ticket</h2>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Subject</span>
          <input
            type="text" required minLength={3} maxLength={140}
            value={form.subject} onChange={update("subject")}
            className="mt-2 w-full bg-[#F9F6F0] border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
            placeholder="Briefly describe the issue"
            data-testid="ticket-subject"
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Category</span>
            <select
              value={form.category} onChange={update("category")}
              className="mt-2 w-full bg-[#F9F6F0] border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
              data-testid="ticket-category"
            >
              {CATEGORIES.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Order ID (optional)</span>
            <input
              type="text" value={form.order_id} onChange={update("order_id")}
              className="mt-2 w-full bg-[#F9F6F0] border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
              placeholder="e.g., 9f35c9e4-…"
              data-testid="ticket-order-id"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Message</span>
          <textarea
            required minLength={10} rows={6}
            value={form.message} onChange={update("message")}
            className="mt-2 w-full bg-[#F9F6F0] border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
            placeholder="Tell us what's happening — the more detail the better"
            data-testid="ticket-message"
          />
        </label>

        {error && (
          <div className="text-sm text-[#722F37] bg-[#722F37]/8 border border-[#722F37]/30 px-3 py-2 rounded-sm" data-testid="ticket-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-[#722F37] text-white px-7 py-3 rounded-sm uppercase text-xs tracking-wider hover:bg-[#5a252b] disabled:opacity-60 transition-colors"
          data-testid="submit-ticket"
        >
          <Send size={14} /> {submitting ? "Sending…" : "Submit ticket"}
        </button>
      </form>
    </section>
  );
}

function TicketDetail({ ticket: initial, onBack }) {
  const [ticket, setTicket] = useState(initial);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const st = STATUS_LABEL[ticket.status] || STATUS_LABEL.open;

  const send = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/tickets/${ticket.id}/messages`, { body: reply });
      setTicket(data);
      setReply("");
      toast.success("Reply sent");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sk-paper min-h-screen pb-24" data-testid="ticket-detail">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12 pt-10">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-[#4A4A4A] hover:text-[#722F37]" data-testid="back-to-tickets">
          <ChevronLeft size={14} /> Back to tickets
        </button>
      </div>
      <section className="max-w-[900px] mx-auto px-6 lg:px-12 pt-6 pb-8 border-b border-[#D4AF37]/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-[#722F37] mb-2">{ticket.category}</div>
            <h1 className="font-serif-display text-3xl md:text-4xl text-[#1A1A1A]">{ticket.subject}</h1>
            {ticket.order_id && (
              <p className="text-xs text-[#4A4A4A] mt-2">Order #{ticket.order_id}</p>
            )}
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm whitespace-nowrap" style={{ color: st.color, backgroundColor: st.bg }}>
            {st.text}
          </span>
        </div>
      </section>
      <section className="max-w-[900px] mx-auto px-6 lg:px-12 py-10 space-y-6" data-testid="ticket-thread">
        {ticket.messages.map((m, i) => {
          const fromUser = m.author === "user";
          return (
            <div key={i} className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-sm border p-4 ${fromUser ? "bg-[#722F37] text-white border-[#722F37]" : "bg-white text-[#1A1A1A] border-[#EFE9DF]"}`}>
                <div className={`text-[10px] uppercase tracking-[0.3em] mb-1.5 ${fromUser ? "text-white/70" : "text-[#722F37]"}`}>
                  {m.name} · {new Date(m.at).toLocaleString()}
                </div>
                <div className="whitespace-pre-line leading-relaxed text-sm">{m.body}</div>
              </div>
            </div>
          );
        })}
      </section>
      {ticket.status !== "closed" && (
        <form onSubmit={send} className="max-w-[900px] mx-auto px-6 lg:px-12">
          <textarea
            rows={4} value={reply} onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply…"
            className="w-full bg-white border border-[#EFE9DF] rounded-sm px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#722F37]"
            data-testid="ticket-reply-input"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit" disabled={sending || !reply.trim()}
              className="inline-flex items-center gap-2 bg-[#722F37] text-white px-6 py-3 rounded-sm uppercase text-xs tracking-wider hover:bg-[#5a252b] disabled:opacity-60 transition-colors"
              data-testid="send-reply"
            >
              <Send size={14} /> Send reply
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
