"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    // Function to update the scroll progress
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };
    
    // Add event listener
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    
    // Set initial scroll position
    updateScrollProgress();
    
    // Clean up event listener
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);
  
  return (
    <div className="scroll-progress-container">
      <div 
        className="scroll-progress-bar"
        style={{ height: `${scrollProgress}%` }}
      />
    </div>
  );
} 