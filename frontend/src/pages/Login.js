import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { motion } from "framer-motion";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

const BG = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>
      {/* BG IMAGE */}
      <img src={BG} alt="cinema" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", filter: "brightness(0.25)"
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(10,15,30,0.9) 0%, rgba(30,10,50,0.8) 100%)"
      }} />

      {/* LEFT PANEL */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px", position: "relative", zIndex: 1
      }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: "linear-gradient(135deg,#ff004f,#cc0040)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", boxShadow: "0 0 30px rgba(255,0,79,0.5)"
            }}>🎬</div>
            <span style={{ fontSize: "28px", fontWeight: "900", background: "linear-gradient(135deg,#ff004f,#ff6b9d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              CineVerse
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,4vw,56px)", fontWeight: "900", color: "white", lineHeight: 1.1, marginBottom: "16px" }}>
            Your Cinema,<br />
            <span style={{ background: "linear-gradient(135deg,#ff004f,#ff6b9d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your Way.
            </span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "400px", lineHeight: 1.7 }}>
            Book tickets for the latest blockbusters. Real-time seat selection with instant confirmation.
          </p>
          <div style={{ display: "flex", gap: "24px", marginTop: "40px" }}>
            {["🎬 Latest Movies", "💺 Live Seats", "🎟️ Instant Booking"].map(f => (
              <div key={f} style={{ color: "#94a3b8", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>{f}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div style={{
        width: "460px", minWidth: "460px", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px", position: "relative", zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px", padding: "40px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)"
          }}
        >
          <h2 style={{ fontSize: "26px", fontWeight: "800", color: "white", marginBottom: "6px" }}>Welcome back</h2>
          <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "14px" }}>Sign in to your account</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Email address</label>
              <div style={inputWrap}>
                <FaEnvelope color="#64748b" size={14} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com" style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Password</label>
              <div style={inputWrap}>
                <FaLock color="#64748b" size={14} />
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="Enter password" style={inputStyle}
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", color: "#64748b" }}>
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "#334155" : "linear-gradient(135deg,#ff004f,#cc0040)",
                border: "none", borderRadius: "12px", color: "white",
                fontSize: "16px", cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "700", boxShadow: loading ? "none" : "0 8px 25px rgba(255,0,79,0.35)"
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </motion.button>
          </form>

          <p style={{ marginTop: "24px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>
            New to CineVerse?{" "}
            <Link to="/register" style={{ color: "#ff004f", textDecoration: "none", fontWeight: "700" }}>
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", color: "#94a3b8", fontSize: "13px", fontWeight: "600", marginBottom: "8px" };
const inputWrap = {
  display: "flex", alignItems: "center", gap: "10px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px", padding: "12px 16px"
};
const inputStyle = {
  flex: 1, background: "transparent", border: "none", outline: "none",
  color: "white", fontSize: "15px"
};

export default Login;