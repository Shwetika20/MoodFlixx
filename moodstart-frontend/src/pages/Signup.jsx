// src/pages/Signup.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        alert('Signup successful')
        navigate('/login')
      } else {
        alert(data.message || 'Signup failed')
      }
    } catch (err) {
      console.error(err)
      alert('Server error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4">
      <div className="w-full max-w-md bg-[#1f1b38] p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-green-400 to-cyan-400 text-transparent bg-clip-text">
          📝 Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#2d254b] text-white border border-cyan-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#2d254b] text-white border border-cyan-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
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
              className="w-full px-4 py-3 rounded-lg bg-[#2d254b] text-white border border-cyan-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg transition duration-300"
          >
            ✅ Sign Up
          </button>
        </form>
        {/* Link to Login */}
        <p className="text-center text-sm mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-200 underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
