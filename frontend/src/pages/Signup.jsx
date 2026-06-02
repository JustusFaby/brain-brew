import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-cream-50">
      {/* Ambient background effects */}
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-coffee-200/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-coffee-300/8 rounded-full blur-[100px] animate-pulse-slow" />

      <div className="glass-card p-8 sm:p-10 w-full max-w-md relative animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="BrainBrew" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg shadow-coffee-500/15" />
          <h1 className="text-3xl font-bold gradient-text">Join BrainBrew</h1>
          <p className="text-dark-500 mt-2">Create your study account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-600 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1.5">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-dark-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-coffee-500 hover:text-coffee-400 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
