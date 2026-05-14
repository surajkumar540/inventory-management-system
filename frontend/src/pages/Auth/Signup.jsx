import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signupUser } from "../../api/auth";
import useAuthStore from "../../stores/useAuthStore";
import {
  Zap, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, User,
} from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass = `w-full h-11 pl-10 pr-4 text-[13px] text-slate-700 bg-slate-50 border border-slate-200
    rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white
    transition-all placeholder:text-slate-300`;

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await signupUser({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      login(res.data);
      navigate(res.data.user?.role === "STAFF" ? "/orders" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const perks = ["Inventory tracking", "Order management", "AI-powered analytics"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-violet-50/20 flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-slate-200/60 p-8">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-7">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-[16px] font-bold text-slate-800 tracking-tight">
              Stock<span className="text-indigo-500">Flow</span>
            </span>
          </div>

          <h1 className="text-[24px] font-bold text-slate-800 tracking-tight mb-1">Create account</h1>
          <p className="text-[13px] text-slate-400 mb-5">
            Already registered?{" "}
            <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-600 transition-colors">
              Sign in
            </Link>
          </p>

          {/* Perks */}
          <div className="flex flex-col gap-1.5 mb-5 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2 text-[12px] text-indigo-700 font-medium">
                <CheckCircle size={11} className="text-indigo-400 shrink-0" />
                {p}
              </div>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium"
              >
                <AlertCircle size={13} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
              <div className="relative">
                <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" placeholder="John Doe" className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="email" placeholder="you@example.com" className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="password" placeholder="Min. 6 characters" className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="password" placeholder="Re-enter password" className={inputClass}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required />
              </div>
              {form.confirmPassword && (
                <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${form.password === form.confirmPassword ? "text-emerald-500" : "text-red-400"}`}>
                  {form.password === form.confirmPassword
                    ? <><CheckCircle size={10} /> Passwords match</>
                    : <><AlertCircle size={10} /> Passwords don't match</>}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <>Create account <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;