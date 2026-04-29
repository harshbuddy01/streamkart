import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, formatApiError } from "../lib/auth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const u = await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(`Welcome to StreamKart, ${u.name.split(" ")[0]}`);
      navigate(next);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sk-paper min-h-[80vh] flex items-center justify-center px-6 py-16" data-testid="register-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-3">Begin Reading</div>
          <h1 className="font-serif-display text-4xl md:text-5xl text-[#1A1A1A] leading-tight">Create your account</h1>
          <p className="text-sm text-[#4A4A4A] mt-2">A library of international voices, in one breath</p>
        </div>

        <form onSubmit={submit} className="bg-white border border-[#EFE9DF] rounded-sm p-8 space-y-5">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Full name</span>
            <div className="mt-2 flex items-center border border-[#EFE9DF] rounded-sm px-3 focus-within:border-[#722F37]">
              <User size={16} className="text-[#722F37]" />
              <input
                type="text" required autoComplete="name" minLength={2}
                value={form.name} onChange={update("name")}
                className="bg-transparent outline-none px-3 py-3 text-[#1A1A1A] w-full"
                data-testid="register-name"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Email</span>
            <div className="mt-2 flex items-center border border-[#EFE9DF] rounded-sm px-3 focus-within:border-[#722F37]">
              <Mail size={16} className="text-[#722F37]" />
              <input
                type="email" required autoComplete="email"
                value={form.email} onChange={update("email")}
                className="bg-transparent outline-none px-3 py-3 text-[#1A1A1A] w-full"
                data-testid="register-email"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Password</span>
            <div className="mt-2 flex items-center border border-[#EFE9DF] rounded-sm px-3 focus-within:border-[#722F37]">
              <Lock size={16} className="text-[#722F37]" />
              <input
                type="password" required minLength={6} autoComplete="new-password"
                value={form.password} onChange={update("password")}
                className="bg-transparent outline-none px-3 py-3 text-[#1A1A1A] w-full"
                data-testid="register-password"
              />
            </div>
            <p className="text-xs text-[#4A4A4A] mt-1.5">At least 6 characters</p>
          </label>

          {error && (
            <div className="text-sm text-[#722F37] bg-[#722F37]/8 border border-[#722F37]/30 px-3 py-2 rounded-sm" data-testid="register-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#722F37] text-white py-4 rounded-sm uppercase text-sm tracking-wider hover:bg-[#5a252b] disabled:opacity-60 transition-colors"
            data-testid="register-submit"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <>Create account <ArrowRight size={16} /></>}
          </button>

          <p className="text-[10px] text-[#4A4A4A] text-center leading-relaxed">
            By creating an account you agree to our <Link to="/policy/terms" className="underline">Terms</Link> and acknowledge our <Link to="/policy/refund" className="underline">no-refund-after-purchase policy</Link>.
          </p>
        </form>

        <p className="text-center text-sm text-[#4A4A4A] mt-6">
          Already have an account?{" "}
          <Link to={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-[#722F37] underline" data-testid="goto-login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
