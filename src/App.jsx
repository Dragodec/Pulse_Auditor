import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { ComparisonProvider } from './context/ComparisonProvider';
import Home from './pages/Home';
import Report from './pages/Report';

const Navbar = () => (
  <nav className="border-b border-white/5 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
      <Link to="/" className="text-xl font-black tracking-tighter italic">
        PULSE<span className="text-emerald-500">.</span>
      </Link>
    </div>
  </nav>
);

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/:owner/:repo" element={<PageTransition><Report /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ComparisonProvider>
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
          <Toaster position="bottom-right" />
          <Navbar />
          <main><AnimatedRoutes /></main>
        </div>
      </ComparisonProvider>
    </BrowserRouter>
  );
};

export default App;