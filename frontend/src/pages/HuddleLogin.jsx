import React, { useState } from "react";
import { loginUser } from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
import H from "../assets/H.png";

const HuddleLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    
    const res = await loginUser(formData);

    console.log("✅ Login successful:", res);

    
    if (res?.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
    }

  
    if (res?.message) alert(res.message);

  
    navigate("/homepage", { replace: true });
  } catch (err) {
    console.error("❌ Login error:", err);
    setError(err.message || "Login failed. Please check your credentials.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl transition-all duration-300">
        <div className="flex flex-col items-center justify-center mb-8">
          <img src={H} alt="Logo" className="w-[80px]" />
          <p className="text-xl text-gray-700 mt-4">Log in to Huddle</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            required
            className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
            className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-6 text-white font-semibold rounded-lg shadow-md text-sm ${
              loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-purple-600 font-medium hover:text-purple-800 transition-colors duration-200"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HuddleLogin;
