import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../../features/auditor/useComparison';

const Navbar = () => {
  const { basket } = useComparison();

  return (
    <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50 p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-black italic">PULSE.</Link>
        <Link to="/compare" className="text-sm font-bold bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all">
          Comparison Basket ({basket.length})
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;