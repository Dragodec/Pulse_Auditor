import React, { useState, useEffect } from 'react';
import { ComparisonContext } from './ComparisonContext';

export const ComparisonProvider = ({ children }) => {
  const [basket, setBasket] = useState(() => {
    const saved = localStorage.getItem('pulse_comparison');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pulse_comparison', JSON.stringify(basket));
  }, [basket]);

  const addToComparison = (repo) => {
    if (basket.length >= 3) return false;
    if (basket.find((item) => item.full_name === repo.full_name)) return false;
    setBasket([...basket, repo]);
    return true;
  };

  const removeFromComparison = (fullName) => {
    setBasket(basket.filter((item) => item.full_name !== fullName));
  };

  const clearComparison = () => setBasket([]);

  return (
    <ComparisonContext.Provider value={{ basket, addToComparison, removeFromComparison, clearComparison }}>
      {children}
    </ComparisonContext.Provider>
  );
};