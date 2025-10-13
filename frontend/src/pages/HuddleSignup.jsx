import React, { useState } from "react";
import { registerUser } from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
import H from "../assets/H.png";

const HuddleSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
  });
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
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Temporary placeholders for fields backend expects
      data.append("name", "");
      data.append("bio", "");
      data.append("file", new Blob()); // dummy file placeholder if backend needs it

      const res = await registerUser(data);
      alert(res.message);
      navigate("/"); // redirect to login page
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-2xl">
        <div className="text-center mb-4">
          <img src={H} alt="Huddle Logo" className="mx-auto w-[80px] mb-1" />
          <p className="text-lg text-gray-700 font-medium">Sign up for Huddle</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />
          <input
            type="text"
            name="gender"
            placeholder="Gender"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 mt-3 text-white font-semibold rounded-lg text-sm ${
              loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-3">
          Already have an account?{" "}
          <Link to="/" className="text-purple-600 hover:text-purple-800 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HuddleSignUp;
