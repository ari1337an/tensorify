'use client';

import { Code as CodeIcon, Brain as BrainCircuitIcon, Zap as ZapIcon, Plug as PlugIcon, BookOpen as BookOpenIcon, Wand2 as WandIcon, Rocket as RocketIcon, ArrowDown as ArrowDownIcon } from 'lucide-react';
import { Badge } from "./ui/badge";
import { SectionWrapper } from "./section-wrapper";
import { useState, useEffect, useRef, useCallback } from 'react';
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
    "Researcher": "from-[#A371D3]/20 to-[#5E48BF]/20 hover:from-[#A371D3]/30 hover:to-[#5E48BF]/30 border-[#A371D3]/30",
    "Engineer": "from-[#8257AC]/20 to-[#5E48BF]/20 hover:from-[#8257AC]/30 hover:to-[#5E48BF]/30 border-[#8257AC]/30",
    "Leader": "from-[#5E48BF]/20 to-[#8F9EBE]/20 hover:from-[#5E48BF]/30 hover:to-[#8F9EBE]/30 border-[#5E48BF]/30",
    "MLOps": "from-[#8F9EBE]/20 to-[#8257AC]/20 hover:from-[#8F9EBE]/30 hover:to-[#8257AC]/30 border-[#8F9EBE]/30"
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
        ${isActive ? 'scale-105 shadow-lg shadow-[#A371D3]/20 ring-2 ring-[#A371D3]/40' : 'shadow-sm hover:shadow-md hover:scale-[1.02]'} 
        transition-all duration-300 p-4 bg-gradient-to-br ${colorScheme}
      `}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-900/60 
            ${isActive ? 'bg-gradient-to-br from-gray-800 to-gray-900' : ''}`}>
            <feature.icon className={`h-5 w-5 ${isActive ? 'text-[#A371D3]' : 'text-white'}`} />
          </div>
          <h3 className="font-semibold text-white">{feature.title}</h3>
        </div>

        {isActive && (
          <>
            <p className="text-white/80 text-sm mt-2 leading-relaxed">
              {feature.description}
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs bg-black/20 rounded-md p-1.5 px-2 text-white/70">
              <WandIcon className="h-3 w-3 text-[#A371D3]" />
              <span>Perfect for: <span className="text-primary-foreground">{feature.perfect}</span></span>
            </div>
          </>
        )}
      </div>

      {/* Glow effect */}
      <div className={`absolute -inset-2 bg-gradient-to-r from-[#A371D3]/20 to-[#5E48BF]/20 rounded-xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-70' : ''}`}></div>
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
  // Improved curve calculation for more natural flow
  const dx = endPos.x - startPos.x;
  // const dy = endPos.y - startPos.y; // Not needed currently
  const controlPointOffsetX = Math.abs(dx) * 0.4;
  
  // Calculate control points for a natural curve
  const control1X = startPos.x + Math.sign(dx) * controlPointOffsetX;
  const control1Y = startPos.y;
  const control2X = endPos.x - Math.sign(dx) * controlPointOffsetX;
  const control2Y = endPos.y;
  
  // Generate a unique ID for each connection
  const connectionId = `${Math.round(startPos.x)}-${Math.round(startPos.y)}-${Math.round(endPos.x)}-${Math.round(endPos.y)}`;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id={`gradient-${connectionId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isActive ? "rgba(163, 113, 211, 0.9)" : "rgba(163, 113, 211, 0.5)"} />
          <stop offset="100%" stopColor={isActive ? "rgba(94, 72, 191, 0.9)" : "rgba(94, 72, 191, 0.5)"} />
        </linearGradient>
        <marker
          id={`arrow-${connectionId}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={isActive ? "rgba(163, 113, 211, 0.9)" : "rgba(163, 113, 211, 0.6)"} />
        </marker>
      </defs>
      
      {/* Main connection path */}
      <path
        d={`M ${startPos.x} ${startPos.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endPos.x} ${endPos.y}`}
        stroke={`url(#gradient-${connectionId})`}
        strokeWidth={isActive ? 2.5 : 2}
        fill="none"
        markerEnd={`url(#arrow-${connectionId})`}
        strokeDasharray={isActive ? "none" : "5,5"}
        style={{
          transition: "all 0.3s ease"
        }}
      />
      
      {isActive && (
        <circle r="3" fill="#A371D3">
          <animateMotion
            dur="1.8s"
            repeatCount="indefinite"
            path={`M ${startPos.x} ${startPos.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endPos.x} ${endPos.y}`}
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

  // Feature data with node positions - moved up
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

  // Function to handle cycling through features - memoized with useCallback
  const cycleFeatures = useCallback(() => {
    setActiveFeature(prev => prev === null ? 0 : (prev + 1) % features.length);
  }, [features.length]);

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
  }, [cycleFeatures]);

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

  // Build connection lines
  const connections: { start: Feature; end: Feature }[] = [];

  // Create a set to track which connections we've already added
  const connectionSet = new Set<string>();

  // First, manually add the important connection that might be missed
  connections.push({
    start: features[3], // Reusable Components
    end: features[4]    // Self-Documenting Models
  });
  connectionSet.add("3-4"); // Mark as added

  // Add the rest of the connections
  features.forEach((feature, sourceIdx) => {
    feature.connections.forEach(targetIdx => {
      // Validate target exists
      if (targetIdx >= 0 && targetIdx < features.length) {
        // Create a connection ID that will be the same regardless of direction
        const minIdx = Math.min(sourceIdx, targetIdx);
        const maxIdx = Math.max(sourceIdx, targetIdx);
        const connectionId = `${minIdx}-${maxIdx}`;
        
        // Only add this connection if we haven't already
        if (!connectionSet.has(connectionId)) {
          connectionSet.add(connectionId);
          connections.push({
            start: feature,
            end: features[targetIdx]
          });
        }
      }
    });
  });

  return (
    <SectionWrapper
      id="features"
      className="pt-8 md:pt-12 pb-24 mt-[-2rem]"
      gradientColor="secondary"
    >
      {/* Enhanced connection from Hero section - static version */}
      <div className="relative">
        {/* Main connector line */}
        <div className="absolute top-[-80px] left-1/2 transform -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-[#A371D3]/5 via-[#A371D3]/20 to-[#A371D3]/40"></div>

        {/* Glowing node at intersection - static version */}
        <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#A371D3]/30 to-[#5E48BF]/20 backdrop-blur-sm border border-[#A371D3]/30 flex items-center justify-center shadow-lg shadow-[#A371D3]/10">
          <div className="w-2 h-2 rounded-full bg-[#A371D3]"></div>
          <div className="absolute w-5 h-5 rounded-full bg-[#A371D3]/20"></div>
        </div>

        {/* Static gradient circle */}
        <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-[#A371D3]/5 to-[#5E48BF]/5 blur-3xl"></div>

        {/* Static particles around connector */}
        <div className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 w-40 h-40 pointer-events-none">
          <div className="absolute w-1.5 h-1.5 rounded-full bg-[#A371D3]/80 top-[20%] left-[30%]"></div>
          <div className="absolute w-1 h-1 rounded-full bg-[#5E48BF]/80 top-[40%] right-[25%]"></div>
          <div className="absolute w-2 h-2 rounded-full bg-[#A371D3]/60 bottom-[30%] left-[40%]"></div>
          <div className="absolute w-1 h-1 rounded-full bg-[#5E48BF]/60 bottom-[15%] right-[35%]"></div>
        </div>

        {/* Background blur gradient */}
        <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-[#A371D3]/10 to-[#5E48BF]/5 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 mt-12 relative z-10">
        
        <h2 className="pt-6 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Stop Rewriting Boilerplate.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A371D3] via-[#5E48BF] to-[#A371D3] bg-[200%_auto]">
            Start Building AI
          </span>
        </h2>
        <p className="max-w-[800px] text-lg sm:text-xl text-muted-foreground">
          Debug your model architecture, not your implementation code. Tensorify transforms how AI professionals turn concepts into reality.
        </p>
      </div>

      {/* Interactive node flow diagram */}
      <div
        ref={containerRef}
        className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] mb-16 overflow-hidden backdrop-blur-[1px] rounded-xl"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#A371D3]/5 via-transparent to-[#5E48BF]/5 rounded-xl"></div>

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
        <div className="flex flex-col items-center">
          <p className="text-muted-foreground mb-2">Discover how Tensorify transforms workflows for each role</p>
          <div className="h-16 w-px bg-gradient-to-b from-[#A371D3]/10 to-[#A371D3]/30"></div>
          <ArrowDownIcon className="h-6 w-6 text-[#A371D3] mt-2" />
        </div>
      </div>
    </SectionWrapper>
  );
} 