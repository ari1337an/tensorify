"use client";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { ForWhom } from "@/components/for-whom";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { useEffect, useRef } from "react";
// import { Demo } from "@/components/demo";

export default function Home() {
  const parallaxRef1 = useRef<HTMLDivElement>(null);
  const parallaxRef2 = useRef<HTMLDivElement>(null);
  const parallaxRef3 = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Add interactive background effect only
  useEffect(() => {
    // Function to handle mouse movement for interactive background
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current) return;

      const { clientX, clientY } = e;
      const x = Math.round((clientX / window.innerWidth) * 100);
      const y = Math.round((clientY / window.innerHeight) * 100);

      // Create an interactive gradient effect following mouse movement
      backgroundRef.current.style.backgroundPosition = `${x}% ${y}%`;
    };

    // Attach event listeners
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* Dynamic background container - made darker and less purple */}
      <div 
        ref={backgroundRef}
        className="fixed inset-0 -z-20 bg-[#0a0a14] dark:bg-[#050508]"
      ></div>
      
      {/* Background pattern overlay - more subtle */}
      <div className="fixed inset-0 -z-20 opacity-20 dark:opacity-15"></div>
      
      <Header />
      <main className="flex-1">
        <div className="relative">
          {/* Decorative elements with parallax - more subtle and darker */}
          <div 
            ref={parallaxRef1}
            className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#2A1E3D]/20 via-[#1E1D33]/15 to-transparent blur-3xl"
          ></div>
          <div 
            ref={parallaxRef2}
            className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#1E2A3D]/20 via-[#202433]/15 to-transparent blur-3xl"
          ></div>
          <div 
            ref={parallaxRef3}
            className="absolute top-[40%] left-0 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-[#2A1E3D]/10 to-[#27274D]/10 blur-3xl"
          ></div>
          
          {/* Main content with sections */}
          <div className="space-y-16">
            <section className="fluid-section">
              <Hero />
            </section>
            
            <section className="fluid-section">
              <Features />
            </section>
            
            <section className="fluid-section">
              <ForWhom />
            </section>
            
            <section className="fluid-section">
              <Pricing />
            </section>
            
            <section className="fluid-section">
              <FAQ />
            </section>
            
            <section className="fluid-section">
              <CTA />
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
