import { useNavigate } from 'react-router-dom';
import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  // Check login status
  const isLoggedIn = !!localStorage.getItem('authToken'); // Replace with your actual key

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-800 text-white">
      {/* Navbar */}
      <NavBar/>

      {/* Main Section */}
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 py-6">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 mb-12">
          What are you in the mood for?
        </h2>

        <div className="flex flex-col sm:flex-row sm:space-x-10 space-y-6 sm:space-y-0">
          <button
            onClick={() => navigate('/embracing')}
            className="relative px-8 py-4 rounded-full bg-orange-500 text-white text-2xl font-semibold hover:bg-orange-400 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-700 rounded-full blur-sm opacity-50"></span>
            Embracing
          </button>

          <button
            onClick={() => navigate('/exploring')}
            className="relative px-8 py-4 rounded-full bg-blue-500 text-white text-2xl font-semibold hover:bg-blue-400 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 rounded-full blur-sm opacity-50"></span>
            Exploring
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default LandingPage;
