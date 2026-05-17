/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal/AuthModal';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import './App.css';
import './styles/global.css';
import './styles/variables.css';
import Home from './pages/Home';
import UniversityDetail from './pages/UniversityDetail';
import SearchResults from './pages/SearchResults';
import WriteReview from './pages/WriteReview';
import ProjectsShowcase from './pages/ProjectsShowcase';
import Compare from './pages/Compare';
import Community from './pages/Community';
import Colleges from './pages/Colleges';
import Reviews from './pages/Reviews';

// Static Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Admin Pages Imports - Comment out missing ones for now
// import AdminLayout from './pages/admin/AdminLayout';
// import Dashboard from './pages/admin/Dashboard';
// import AdminUniversities from './pages/admin/Universities';
// import AdminReviews from './pages/admin/Reviews';
// import AdminUsers from './pages/admin/Users';
// import AdminDiscussions from './pages/admin/Discussions';
// import AdminAddUniversity from './pages/admin/AddUniversity';
// import AdminEditUniversity from './pages/admin/EditUniversity';
// import Settings from './pages/admin/Settings';
// import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { isAuthenticated, toast, hideToast, user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin@campusreveal.com';

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
        <Route path="/university/:id/projects" element={<ProjectsShowcase />} />
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
      
      {/* Auth Modal - shows on homepage when not authenticated */}
      <AuthModal />
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