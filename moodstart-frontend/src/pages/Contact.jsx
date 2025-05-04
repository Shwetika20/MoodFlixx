import React from "react";
import NavBar from "../components/NavBar";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* NavBar */}
      <NavBar />

      {/* Contact Section */}
      <section className="py-12 px-6 flex items-center justify-center">
        <div className="max-w-3xl bg-white/10 backdrop-blur-md text-white p-8 shadow-xl rounded-lg w-full border border-white/20">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-300">
            Team Group 5 - Deep Learning
          </h2>
          <ul className="text-lg space-y-2 text-center">
            <li>Chanda Tharun</li>
            <li>Shashi</li>
            <li>Abhigyan</li>
            <li>Shwetika</li>
            <li>Palak</li>
            <li>Hardeep</li>
          </ul>

          <div className="text-center mt-8">
            <p className="text-xl font-medium mb-2">
              Want to contribute?
            </p>
            <a
              href="https://github.com/Tharunchanda/MoodStart"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Visit our GitHub Repository →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
