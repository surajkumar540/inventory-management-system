import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser } from "../../api/auth";
import useAuthStore from "../../stores/useAuthStore";
import { Zap, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass = `w-full h-11 pl-10 pr-4 text-[13px] text-slate-700 bg-slate-50 border border-slate-200
    rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white
    transition-all placeholder:text-slate-300`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data);
      navigate(
        res.data.user?.role === "ADMIN" || res.data.user?.role === "MANAGER"
          ? "/" : "/orders"
      );
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-violet-50/20 flex items-center justify-center px-4">
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
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

          <h1 className="text-[24px] font-bold text-slate-800 tracking-tight mb-1">Welcome back</h1>
          <p className="text-[13px] text-slate-400 mb-7">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-500 font-semibold hover:text-indigo-600 transition-colors">
              Sign up
            </Link>
          </p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium"
              >
                <AlertCircle size={13} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-11 mt-1 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <>Sign in <ArrowRight size={14} /></>}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;