import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, formatApiError } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const u = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      navigate(next);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sk-paper min-h-[80vh] flex items-center justify-center px-6 py-16" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-[#722F37] mb-3">Welcome back</div>
          <h1 className="font-serif-display text-4xl md:text-5xl text-[#1A1A1A] leading-tight">Sign in</h1>
          <p className="text-sm text-[#4A4A4A] mt-2">to your StreamKart library</p>
        </div>

        <form onSubmit={submit} className="bg-white border border-[#EFE9DF] rounded-sm p-8 space-y-5">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Email</span>
            <div className="mt-2 flex items-center border border-[#EFE9DF] rounded-sm px-3 focus-within:border-[#722F37]">
              <Mail size={16} className="text-[#722F37]" />
              <input
                type="email" required autoComplete="email"
                value={form.email} onChange={update("email")}
                className="bg-transparent outline-none px-3 py-3 text-[#1A1A1A] w-full"
                data-testid="login-email"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#722F37]">Password</span>
            <div className="mt-2 flex items-center border border-[#EFE9DF] rounded-sm px-3 focus-within:border-[#722F37]">
              <Lock size={16} className="text-[#722F37]" />
              <input
                type="password" required autoComplete="current-password"
                value={form.password} onChange={update("password")}
                className="bg-transparent outline-none px-3 py-3 text-[#1A1A1A] w-full"
                data-testid="login-password"
              />
            </div>
          </label>

          {error && (
            <div className="text-sm text-[#722F37] bg-[#722F37]/8 border border-[#722F37]/30 px-3 py-2 rounded-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#722F37] text-white py-4 rounded-sm uppercase text-sm tracking-wider hover:bg-[#5a252b] disabled:opacity-60 transition-colors"
            data-testid="login-submit"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <>Sign in <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-[#4A4A4A] mt-6">
          New to StreamKart?{" "}
          <Link to={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-[#722F37] underline" data-testid="goto-register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
