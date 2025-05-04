import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          setError(data.message || 'An error occurred while fetching the profile.');
        }
      } catch (err) {
        setError('Error fetching profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20">
        <div className="spinner-border animate-spin border-4 border-t-4 border-blue-600 rounded-full w-12 h-12"></div>
        <p className="mt-4">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-20 text-red-600">{error}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg text-black">
      <NavBar />

      <h1 className="text-3xl font-bold mb-4">Profile</h1>

      <div className="mb-6">
        <p className="text-lg"><strong>Name:</strong> {user.name}</p>
        <p className="text-lg"><strong>Email:</strong> {user.email}</p>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Watch History</h2>
      {user.moviesHistory.length === 0 ? (
        <p>No movies watched yet.</p>
      ) : (
        <ul className="list-disc list-inside space-y-4">
          {user.moviesHistory.map((entry, index) => (
            <li key={index} className="bg-gray-100 p-4 rounded-md shadow-sm">
              <p><strong>Name:</strong> {entry.name}</p>
              <p><strong>Genre:</strong> {entry.genre}</p>
              <p><strong>Overview:</strong> {entry.overview}</p>
              <p><strong>Watched At:</strong> {new Date(entry.watchedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex space-x-4">

        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            navigate('/login');
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold shadow-md hover:bg-red-500 transition-all duration-300"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
