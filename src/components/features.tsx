'use client';

import { Code as CodeIcon, Brain as BrainCircuitIcon, Zap as ZapIcon, Plug as PlugIcon, BookOpen as BookOpenIcon, Wand2 as WandIcon, Rocket as RocketIcon, ArrowDown as ArrowDownIcon } from 'lucide-react';
import { Badge } from "./ui/badge";
import { SectionWrapper } from "./section-wrapper";
import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

// Feature interface
interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  perfect: string;
  persona: string;
  position: { x: number; y: number };
  connections: number[];
}

// Node component for feature display
const FeatureNode = ({
  feature,
  isActive,
  onClick
}: {
  feature: Feature;
  isActive: boolean;
  onClick: () => void;
}) => {
  // Color scheme based on persona
  const colorSchemes: Record<string, string> = {
    "Researcher": "from-violet-500/20 to-purple-500/20 hover:from-violet-500/30 hover:to-purple-500/30 border-violet-400/30",
    "Engineer": "from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-400/30",
    "Leader": "from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border-emerald-400/30",
    "MLOps": "from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border-blue-400/30"
  };

  const colorScheme = colorSchemes[feature.persona] || colorSchemes.Researcher;

  return (
    <div
      className="absolute transition-all duration-500 cursor-pointer group"
      style={{
        left: `${feature.position.x}%`,
        top: `${feature.position.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isActive ? 10 : 1,
        width: "240px"
      }}
      onClick={onClick}
    >
      <div className={`
        backdrop-blur-md bg-gray-900/70 rounded-xl border 
        ${isActive ? 'scale-105 shadow-lg shadow-primary/20 ring-2 ring-primary/40' : 'shadow-sm hover:shadow-md hover:scale-[1.02]'} 
        transition-all duration-300 p-4 bg-gradient-to-br ${colorScheme}
      `}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900/60 
            ${isActive ? 'bg-gradient-to-br from-gray-800 to-gray-900' : ''}`}>
            <feature.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-white'}`} />
          </div>
          <h3 className="font-semibold text-white">{feature.title}</h3>
        </div>

        {isActive && (
          <>
            <p className="text-white/80 text-sm mt-2 leading-relaxed">
              {feature.description}
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs bg-black/20 rounded-md p-1.5 px-2 text-white/70">
              <WandIcon className="h-3 w-3 text-primary" />
              <span>Perfect for: <span className="text-primary-foreground">{feature.perfect}</span></span>
            </div>
          </>
        )}
      </div>

      {/* Glow effect */}
      <div className={`absolute -inset-2 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-70' : ''}`}></div>
    </div>
  );
};

// Connection line between nodes
const ConnectionLine = ({
  startPos,
  endPos,
  isActive
}: {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  isActive: boolean;
}) => {
  // Calculate control points for a nice curve
  const midX = (startPos.x + endPos.x) / 2;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id={`gradient-${startPos.x}-${endPos.x}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isActive ? "rgba(139, 92, 246, 0.9)" : "rgba(139, 92, 246, 0.3)"} />
          <stop offset="100%" stopColor={isActive ? "rgba(124, 58, 237, 0.9)" : "rgba(124, 58, 237, 0.3)"} />
        </linearGradient>
        <marker
          id={`arrow-${startPos.x}-${endPos.x}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={isActive ? "rgba(139, 92, 246, 0.9)" : "rgba(139, 92, 246, 0.4)"} />
        </marker>
      </defs>
      <path
        d={`M ${startPos.x} ${startPos.y} C ${midX} ${startPos.y}, ${midX} ${endPos.y}, ${endPos.x} ${endPos.y}`}
        stroke={`url(#gradient-${startPos.x}-${endPos.x})`}
        strokeWidth={isActive ? 2 : 1.5}
        fill="none"
        markerEnd={`url(#arrow-${startPos.x}-${endPos.x})`}
        className={isActive ? "animate-pulse-slow" : ""}
        strokeDasharray={isActive ? "none" : "5,5"}
        style={{
          filter: isActive ? "drop-shadow(0 0 3px rgba(139, 92, 246, 0.5))" : "none",
          transition: "all 0.3s ease"
        }}
      />
      {isActive && (
        <circle r="3" fill="#a855f7" className="animate-flow-particle">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={`M ${startPos.x} ${startPos.y} C ${midX} ${startPos.y}, ${midX} ${endPos.y}, ${endPos.x} ${endPos.y}`}
          />
        </circle>
      )}
    </svg>
  );
};

export function Features() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTime = useRef<number>(0);
  
  // Function to handle cycling through features
  const cycleFeatures = () => {
    setActiveFeature(prev => prev === null ? 0 : (prev + 1) % features.length);
  };
  
  // Set up auto-cycling through features and client-side rendering check
  useEffect(() => {
    setIsClient(true);
    
    // Start the initial timer
    timerRef.current = setInterval(cycleFeatures, 4000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle click on a feature node
  const handleFeatureClick = (idx: number) => {
    // Clear any existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update active feature
    setActiveFeature(idx);
    
    // Store the click time
    lastClickTime.current = Date.now();
    
    // Set a new interval after 5 seconds
    timerRef.current = setInterval(() => {
      // Only start cycling again if it's been at least 5 seconds since the last click
      if (Date.now() - lastClickTime.current >= 5000) {
        cycleFeatures();
      }
    }, 4000);
  };

  // Feature data with node positions - adjusted for better visualization
  const features: Feature[] = [
    {
      icon: BrainCircuitIcon,
      title: "Visual Model Architecture",
      description: "Debug your model architecture, not your implementation code. Convert research papers to working models in minutes instead of days.",
      perfect: "Researchers & educators",
      persona: "Researcher",
      position: { x: 20, y: 30 },
      connections: [1, 2, 3]
    },
    {
      icon: CodeIcon,
      title: "Production-Ready Code",
      description: "Generate optimized code for PyTorch with a single click. Eliminate boilerplate and reduce implementation time by 80%.",
      perfect: "MLOps specialists",
      persona: "Engineer",
      position: { x: 50, y: 20 },
      connections: [2, 3, 5]
    },
    {
      icon: ZapIcon,
      title: "Lightning-Fast Iteration",
      description: "Test five different architectural variations in a single day. The implementation bottleneck disappears, transforming days of work into minutes.",
      perfect: "Research exploration",
      persona: "Researcher",
      position: { x: 80, y: 30 },
      connections: [3, 4, 5]
    },
    {
      icon: PlugIcon,
      title: "Reusable Components",
      description: "Create standardized, reusable AI components for your team. Eliminate knowledge silos and ensure consistent implementations across projects.",
      perfect: "Technical leaders",
      persona: "Engineer",
      position: { x: 30, y: 70 },
      connections: [0, 1, 4]
    },
    {
      icon: BookOpenIcon,
      title: "Self-Documenting Models",
      description: "Visualize complex architectures that new team members understand at a glance. Reduce onboarding time from months to days.",
      perfect: "Team collaboration",
      persona: "Leader",
      position: { x: 60, y: 70 },
      connections: [2, 3, 5]
    },
    {
      icon: RocketIcon,
      title: "Seamless Deployment",
      description: "Design once, deploy anywhere. Generate optimized implementations for cloud servers and edge devices without manual recoding.",
      perfect: "Production pipelines",
      persona: "MLOps",
      position: { x: 85, y: 60 },
      connections: [2, 4]
    }
  ];

  // Build connection lines
  const connections: { start: Feature; end: Feature }[] = [];
  features.forEach((feature) => {
    feature.connections.forEach(targetIdx => {
      // Validate target exists
      if (targetIdx >= 0 && targetIdx < features.length) {
        connections.push({
          start: feature,
          end: features[targetIdx]
        });
      }
    });
  });

  return (
    <SectionWrapper id="features" className="pt-20 pb-24">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <Badge 
            variant="outline" 
            className="px-6 py-2 rounded-full bg-primary/5 text-primary border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors duration-300"
          >
            Why Tensorify?
          </Badge>
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          Stop Rewriting Boilerplate.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            Start Building AI
          </span>
        </h2>
        <p className="max-w-[800px] text-lg sm:text-xl text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          Debug your model architecture, not your implementation code. Tensorify transforms how AI professionals turn concepts into reality.
        </p>
      </div>

      {/* Interactive node flow diagram */}
      <div
        ref={containerRef}
        className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] mb-16 animate-fade-in opacity-0 overflow-hidden"
        style={{ animationDelay: '0.8s' }}
      >
        {/* Flow visualization */}
        {isClient && containerRef.current && (
          <>
            {/* Draw connections first so they appear behind nodes */}
            {connections.map((connection, connectionIdx) => {
              const isConnectionActive =
                activeFeature === features.indexOf(connection.start) ||
                activeFeature === features.indexOf(connection.end);

              // Calculate start and end positions based on container dimensions
              const containerWidth = containerRef.current?.clientWidth || 0;
              const containerHeight = containerRef.current?.clientHeight || 0;
              
              // Get node center positions based on percentages
              const startPosition = {
                x: connection.start.position.x * containerWidth / 100,
                y: connection.start.position.y * containerHeight / 100
              };

              const endPosition = {
                x: connection.end.position.x * containerWidth / 100,
                y: connection.end.position.y * containerHeight / 100
              };

              return (
                <ConnectionLine
                  key={`connection-${connectionIdx}`}
                  startPos={startPosition}
                  endPos={endPosition}
                  isActive={isConnectionActive}
                />
              );
            })}

            {/* Draw nodes on top of connections */}
            {features.map((feature, idx) => (
              <FeatureNode
                key={`feature-${idx}`}
                feature={feature}
                isActive={activeFeature === idx}
                onClick={() => handleFeatureClick(idx)}
              />
            ))}
          </>
        )}

        {/* Flow diagram UI elements */}
        <div className="absolute bottom-4 right-4">
          <Badge variant="outline" className="bg-gray-900/70 text-white/70 border-gray-800 text-xs">
            Click nodes to explore features
          </Badge>
        </div>
      </div>


      <div className="flex justify-center mt-24 mb-4">
        <div className="flex flex-col items-center animate-fade-in opacity-0" style={{ animationDelay: '1.8s' }}>
          <p className="text-muted-foreground mb-2">Discover how Tensorify transforms workflows for each role</p>
          <div className="h-16 w-px bg-gradient-to-b from-primary/10 to-primary/30"></div>
          <ArrowDownIcon className="h-6 w-6 text-primary mt-2 animate-bounce" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        @keyframes flow-particle {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flow-particle {
          animation: flow-particle 2s infinite;
        }
      `}</style>
    </SectionWrapper>
  );
} 