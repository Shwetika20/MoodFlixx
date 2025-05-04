// src/pages/Login.jsx
import React ,{ useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      // ✅ Save token to localStorage (use actual token from response)
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // if user info is returned

      toast.success("Login successful!");
      navigate('/');
    } else {
      toast.error(data.message || 'Login failed');
    }
  } catch (err) {
    console.error(err);
    toast.error('Server error');
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4">
      <div className="w-full max-w-md bg-[#1f1b38] p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-500 to-purple-400 text-transparent bg-clip-text">
          🔐 Login to MoodStart
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#2d254b] text-white border border-pink-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#2d254b] text-white border border-pink-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg shadow-lg transition duration-300"
          >
            🚀 Log In
          </button>
        </form>
        <p className="text-center text-sm mt-6 text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-pink-400 hover:text-pink-200 underline">
            Sign Up
          </Link>
      </p>
      </div>
    </div>
  )
}

export default Login
