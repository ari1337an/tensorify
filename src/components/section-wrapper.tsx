'use client';

import { useRef, useEffect } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  gradientColor?: 'primary' | 'secondary' | 'accent' | 'none';
}

export function SectionWrapper({
  children,
  id,
  className = "",
  containerClassName = "",
  gradientColor = 'primary'
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  
  useEffect(() => {
    if (isInView && sectionRef.current) {
      sectionRef.current.classList.add('is-visible');
    }
  }, [isInView]);

  // Choose gradient colors based on the gradientColor prop
  const getGradientStyle = () => {
    switch (gradientColor) {
      case 'primary':
        return "from-[#A371D3]/10 to-[#8257AC]/5";
      case 'secondary':
        return "from-[#5E48BF]/10 to-[#8F9EBE]/5";
      case 'accent':
        return "from-[#8257AC]/10 to-[#5E48BF]/5";
      case 'none':
        return "from-transparent to-transparent";
      default:
        return "from-[#A371D3]/10 to-[#8257AC]/5";
    }
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`py-12 md:py-24 relative animate-on-scroll ${className}`}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getGradientStyle()} opacity-50`}></div>
      
      {/* Top separator line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A371D3]/20 to-transparent"></div>
      
      {/* Container for content */}
      <div className={`container relative z-10 mx-auto px-4 md:px-6 transition-all duration-1000 transform ${containerClassName}`}>
        {children}
      </div>
      
      {/* Flowing particles effect */}
      <div className="absolute top-1/2 left-0 w-full h-20 pointer-events-none overflow-hidden">
        {isInView && (
          <>
            <div className="absolute h-1 w-1 rounded-full bg-[#A371D3]/70 animate-float" style={{ left: '15%', top: '20%', animationDelay: '0.1s' }}></div>
            <div className="absolute h-2 w-2 rounded-full bg-[#5E48BF]/70 animate-float" style={{ left: '45%', top: '60%', animationDelay: '0.5s' }}></div>
            <div className="absolute h-1 w-1 rounded-full bg-[#8257AC]/70 animate-float" style={{ left: '75%', top: '30%', animationDelay: '0.9s' }}></div>
          </>
        )}
      </div>
      
      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full text-[#A371D3]/5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            fillOpacity="1"
            d="M0,160L60,181.3C120,203,240,245,360,250.7C480,256,600,224,720,213.3C840,203,960,213,1080,208C1200,203,1320,181,1380,170.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
} 