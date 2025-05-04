// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MainPage from './pages/MainPage'; // use for either /embracing or /exploring
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import React from 'react';
import MainPage2 from './pages/MainPage2';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/embracing" element={<MainPage />} />
      <Route path="/exploring" element={<MainPage2/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/profile" element={<Profile/>} />
    </Routes>
  );
}

export default App;
