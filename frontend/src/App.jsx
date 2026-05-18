/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import OtpLoginModal from './components/OtpLoginModal/OtpLoginModal';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import './App.css';
import './styles/global.css';
import './styles/variables.css';
import Home from './pages/Home';
import UniversityDetail from './pages/UniversityDetail';
import SearchResults from './pages/SearchResults';
import WriteReview from './pages/WriteReview';
import Compare from './pages/Compare';
import Community from './pages/Community';
import Colleges from './pages/Colleges';
import Reviews from './pages/Reviews';

// Static Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function AppContent() {
  const { toast, hideToast } = useAuth();

  return (
    <div className="app-container">
      <Navbar />

      <AnimatePresence>
        {toast.visible && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className={`toast-notification ${toast.type}`}
            onClick={hideToast}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/university/:id" element={<UniversityDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/write-review" element={<WriteReview />} />
        <Route path="/write-review/:id" element={<WriteReview />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/community" element={<Community />} />

        {/* Static Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />
      
      {/* OTP Login Modal */}
      <OtpLoginModal />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;