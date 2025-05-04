import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  const isLoggedIn = !!localStorage.getItem('authToken'); // Replace 'token' with your actual key if different

  return (
    <nav className="flex justify-between items-center px-8 py-6 bg-gradient-to-r from-[#1f1b38] to-[#302b63] text-white shadow-lg">
      <h1
        className="text-3xl font-bold text-orange-400 transition-all duration-300 hover:text-orange-500 cursor-pointer"
        onClick={() => navigate('/')}
      >
        🎬 MoodStart
      </h1>
      <div className="space-x-6">
        {isLoggedIn ? (
          location.pathname !== '/profile' && (
            <button
              onClick={() => navigate('/profile')}
              className="text-lg font-medium text-white transition-all duration-300 hover:text-teal-300 cursor-pointer"
            >
              Profile
            </button>
          )
        ) : (
          <>
            {location.pathname !== '/login' && (
              <button
                onClick={() => navigate('/login')}
                className="text-lg font-medium text-white transition-all duration-300 hover:text-blue-300 cursor-pointer"
              >
                Login
              </button>
            )}
            {location.pathname !== '/signup' && (
              <button
                onClick={() => navigate('/signup')}
                className="text-lg font-medium text-white transition-all duration-300 hover:text-purple-300 cursor-pointer"
              >
                Sign Up
              </button>
            )}
          </>
        )}
        {location.pathname !== '/contact' && (
          <button
            onClick={() => navigate('/contact')}
            className="text-lg font-medium text-white transition-all duration-300 hover:text-green-300 cursor-pointer"
          >
            Contact
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
