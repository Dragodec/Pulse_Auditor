import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200",
    outline: "border border-white/20 text-white hover:bg-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;