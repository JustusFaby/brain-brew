import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-cream-50">
      {/* Ambient background effects */}
      <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-coffee-300/10 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 -left-40 w-[500px] h-[500px] bg-coffee-200/8 rounded-full blur-[100px] animate-pulse-slow" />

      <div className="glass-card p-8 sm:p-10 w-full max-w-md relative animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="BrainBrew" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-lg shadow-coffee-500/15" />
          <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
          <p className="text-dark-500 mt-2">Sign in to your study space</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-600 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-dark-500 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-coffee-500 hover:text-coffee-400 font-medium transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
