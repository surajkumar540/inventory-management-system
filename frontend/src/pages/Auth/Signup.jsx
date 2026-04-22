import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signupUser, verifyOTP, resendOTP } from "../../api/auth";
import useAuthStore from "../../stores/useAuthStore";
import {
  Zap, Mail, Lock, ArrowRight, AlertCircle,
  CheckCircle, User, ShieldCheck, RefreshCw,
} from "lucide-react";

// ── OTP Input Component ──────────────────────────────────────────────────────
const OTPInput = ({ value, onChange, disabled }) => {
  const inputs = useRef([]);
  const digits = value.split("");

  const handleKey = (e, i) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
        onChange(next.join(""));
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        next[i - 1] = "";
        onChange(next.join(""));
      }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits];
    next[i] = e.key;
    onChange(next.join(""));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onChange={() => {}}
          disabled={disabled}
          className={`w-11 h-12 text-center text-[18px] font-bold rounded-xl border-2 outline-none transition-all
            ${digits[i]
              ? "border-indigo-400 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-slate-50 text-slate-700"
            }
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
};

// ── Countdown Timer ──────────────────────────────────────────────────────────
const Countdown = ({ seconds, onEnd }) => {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => {
      setLeft((p) => {
        if (p <= 1) { clearInterval(t); onEnd(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const m = Math.floor(left / 60).toString().padStart(2, "0");
  const s = (left % 60).toString().padStart(2, "0");
  return <span className="font-mono font-bold text-indigo-600">{m}:{s}</span>;
};

// ── Main Signup ──────────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Step: "form" | "otp"
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const inputClass = `w-full h-11 pl-10 pr-4 text-[13px] text-slate-700 bg-slate-50 border border-slate-200
    rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white
    transition-all placeholder:text-slate-300`;

  // ── Submit signup form ──
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
      await signupUser({ name: form.name, email: form.email, password: form.password, confirmPassword: form.confirmPassword });
      setOtpEmail(form.email);
      setStep("otp");
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError("Enter all 6 digits"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await verifyOTP({ email: otpEmail, otp });
      login(res.data); // store token + user
      navigate(res.data.user?.role === "STAFF" ? "/orders" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await resendOTP({ email: otpEmail, type: "verify" });
      setSuccess("OTP resent successfully!");
      setCanResend(false);
      setTimerKey((k) => k + 1);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const perks = ["Inventory tracking", "Order management", "AI-powered analytics"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-violet-50/20 flex items-center justify-center px-4 py-8">
      {/* Background blobs */}
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

          <AnimatePresence mode="wait">

            {/* ── STEP 1: FORM ── */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
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
                  {/* Name */}
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

                  {/* Email */}
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

                  {/* Password */}
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

                  {/* Confirm Password */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input type="password" placeholder="Re-enter password" className={inputClass}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required />
                    </div>
                    {/* Live match indicator */}
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
              </motion.div>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200 mx-auto mb-5">
                  <ShieldCheck size={24} className="text-white" />
                </div>

                <h1 className="text-[22px] font-bold text-slate-800 tracking-tight mb-1">Verify your email</h1>
                <p className="text-[13px] text-slate-400 mb-1">
                  We sent a 6-digit OTP to
                </p>
                <p className="text-[13px] font-semibold text-indigo-600 mb-6">{otpEmail}</p>

                {/* Error / Success */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[12px] font-medium"
                    >
                      <AlertCircle size={13} /> {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[12px] font-medium"
                    >
                      <CheckCircle size={13} /> {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP boxes */}
                <div className="mb-6">
                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                {/* Timer */}
                <div className="text-[12px] text-slate-400 mb-5">
                  {canResend ? (
                    <button onClick={handleResend}
                      className="flex items-center gap-1.5 mx-auto text-indigo-500 font-semibold hover:text-indigo-600 transition-colors"
                    >
                      <RefreshCw size={12} /> Resend OTP
                    </button>
                  ) : (
                    <span>
                      Resend in <Countdown key={timerKey} seconds={600} onEnd={() => setCanResend(true)} />
                    </span>
                  )}
                </div>

                <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <>Verify & Continue <ArrowRight size={14} /></>}
                </button>

                <button onClick={() => { setStep("form"); setError(""); setOtp(""); }}
                  className="w-full mt-3 text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ← Back to signup
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;