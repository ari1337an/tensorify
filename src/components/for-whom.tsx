'use client';

import { useRef, useEffect, useState } from 'react';
import { BeakerIcon, BriefcaseIcon, UsersIcon, ArrowRightIcon, Database, Brain, Zap, GitBranch, Share2, BarChart } from 'lucide-react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SectionWrapper } from "./section-wrapper";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

// Node component for the interactive flow visualization
const FlowNode = ({ icon: Icon, label, active, onClick, type = "default", position, size = "md" }) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-16 h-16 text-base"
  };
  
  const positionStyles = position ? { 
    position: 'absolute', 
    top: `${position.y}%`, 
    left: `${position.x}%`,
    transform: 'translate(-50%, -50%)'
  } : {};
  
  const colors = {
    researcher: "from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-500/50",
    engineer: "from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-500/50",
    lead: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/50",
    default: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 hover:border-indigo-500/50"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: active 
          ? '0 0 25px rgba(124, 58, 237, 0.5)' 
          : '0 0 5px rgba(124, 58, 237, 0.1)'
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      style={positionStyles}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[type]} backdrop-blur-md 
        border flex items-center justify-center cursor-pointer transition-all
        ${active ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 'shadow-sm'}`}
    >
      <Icon className={`${active ? 'text-white' : 'text-indigo-300'} transition-colors duration-300`} />
      {label && (
        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 text-xs font-medium text-indigo-200 whitespace-nowrap">
          {label}
        </div>
      )}
    </motion.div>
  );
};

// Connection line between nodes
const ConnectionLine = ({ from, to, color = "rgba(124, 58, 237, 0.3)", animated = false, dashed = false }) => {
  return (
    <svg
      className="absolute top-0 left-0 w-full h-full -z-10"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {animated && (
          <motion.path
            id="animatedPath"
            d={`M${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - 30}, ${to.x} ${to.y}`}
            fill="none"
            stroke="none"
          />
        )}
      </defs>
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        d={`M${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - 30}, ${to.x} ${to.y}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={dashed ? "5,5" : "0"}
        markerEnd="url(#arrowhead)"
      />
      {animated && (
        <motion.circle
          r="4"
          fill="#a855f7"
          initial={{ offset: 0 }}
          animate={{ offset: 1 }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={`M${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y - 30}, ${to.x} ${to.y}`}
          />
        </motion.circle>
      )}
      
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
    </svg>
  );
};

// UserTypeSection component
const UserTypeSection = ({ data, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ 
        duration: 0.8, 
        delay: 0.1, 
        ease: [0.17, 0.55, 0.55, 1] 
      }}
      className="w-full max-w-6xl px-4 mb-36 relative"
    >
      {/* Connector Line for sequence */}
      {index !== 0 && (
        <div className="absolute top-[-80px] left-1/2 w-0.5 h-[80px] bg-gradient-to-b from-violet-500/5 to-violet-500/30"></div>
      )}
      
      {/* Flow node indicator */}
      <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2">
        <motion.div
          className="w-16 h-16 rounded-full bg-gray-900/70 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-500/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <data.icon className="h-7 w-7 text-violet-400" />
        </motion.div>
      </div>
      
      <Card className="border-primary/10 bg-gray-900/20 backdrop-blur-lg overflow-hidden">
        <CardContent className="p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <data.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{data.title}</h3>
              </motion.div>
              
              <div className="space-y-4">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h4 className="font-medium text-lg">Your Current Challenge:</h4>
                  <p className="text-muted-foreground">
                    {data.challenge}
                  </p>
                </motion.div>
                
                <motion.blockquote 
                  className="border-l-4 border-primary/60 pl-6 py-2 italic text-muted-foreground bg-primary/5 rounded-r-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  "{data.quote}"
                </motion.blockquote>
                
                <div>
                  <motion.h4 
                    className="font-medium text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    How Tensorify Helps:
                  </motion.h4>
                  <ul className="space-y-3 mt-3">
                    {data.benefits.map((benefit, idx) => (
                      <motion.li 
                        key={idx} 
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.8 + idx * 0.1 }}
                      >
                        <benefit.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-primary block">{benefit.title}</span>
                          <span className="text-sm text-muted-foreground">{benefit.description}</span>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="relative h-full min-h-[350px] p-6 rounded-2xl overflow-hidden border border-gray-800/50 bg-gray-900/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              {/* Glowing background */}
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/10 via-primary/5 to-violet-500/10 rounded-xl blur-3xl z-0"></div>
              
              {/* Node flow visualization */}
              <div className="relative z-10 w-full h-full">
                {isClient && (
                  <>
                    {/* Connection lines */}
                    {data.connections.map((connection, i) => (
                      <ConnectionLine 
                        key={i} 
                        from={{ 
                          x: connection.from.x * 3, 
                          y: connection.from.y * 3 
                        }} 
                        to={{ 
                          x: connection.to.x * 3, 
                          y: connection.to.y * 3 
                        }}
                        animated={connection.animated} 
                        dashed={connection.dashed}
                      />
                    ))}
                    
                    {/* Nodes */}
                    {data.flowNodes.map((node, idx) => (
                      <FlowNode 
                        key={node.id} 
                        icon={node.icon}
                        label={node.label}
                        active={isInView}
                        type={data.nodeType}
                        position={{
                          x: node.position.x,
                          y: node.position.y
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
              
              {/* Caption text */}
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <Badge variant="outline" className="bg-gray-900/70 text-white backdrop-blur-md border-violet-600/30 shadow px-4 py-1.5">
                  Visual AI development workflow
                </Badge>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function ForWhom() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Define the content for each user type
  const userTypes = [
    {
      key: "researchers",
      icon: BeakerIcon,
      title: "For AI Researchers",
      challenge: "You spend 80% of your time implementing ideas rather than exploring them. Every experiment requires tedious code rewrites, slowing your research velocity and limiting creative exploration.",
      quote: "I had this idea for a novel attention mechanism last week. I'm still writing the code to test it.",
      benefits: [
        { icon: ArrowRightIcon, title: "Test ideas immediately", description: "Transform the research cycle from days to minutes" },
        { icon: ArrowRightIcon, title: "Iterate rapidly", description: "When your idea fails, you've lost minutes, not days" },
        { icon: ArrowRightIcon, title: "Focus on innovation", description: "Spend time on novel ideas, not boilerplate" }
      ],
      flowNodes: [
        { id: 1, icon: Database, position: { x: 25, y: 50 }, label: "Data" },
        { id: 2, icon: Brain, position: { x: 50, y: 25 }, label: "Model" },
        { id: 3, icon: GitBranch, position: { x: 75, y: 50 }, label: "Experiment" },
        { id: 4, icon: Zap, position: { x: 50, y: 75 }, label: "Results" }
      ],
      connections: [
        { from: { x: 25, y: 50 }, to: { x: 50, y: 25 }, animated: true },
        { from: { x: 25, y: 50 }, to: { x: 50, y: 75 }, dashed: true },
        { from: { x: 50, y: 25 }, to: { x: 75, y: 50 }, animated: true },
        { from: { x: 75, y: 50 }, to: { x: 50, y: 75 }, animated: true }
      ],
      nodeType: "researcher"
    },
    {
      key: "engineers",
      icon: BriefcaseIcon,
      title: "For ML Engineers",
      challenge: "Your team keeps reinventing the wheel with every project. Knowledge is trapped in fragmented codebases, making collaboration inefficient. The gap between research papers and production code costs you weeks of translation work.",
      quote: "We spent three weeks reimplementing the architecture from that paper, only to find a critical design flaw after deployment.",
      benefits: [
        { icon: ArrowRightIcon, title: "Bridge implementation gaps", description: "Go from whiteboard to working prototype in hours" },
        { icon: ArrowRightIcon, title: "Generate optimized code", description: "For TensorFlow, PyTorch, or JAX with one click" },
        { icon: ArrowRightIcon, title: "Maintain full control", description: "Access and customize the generated code" }
      ],
      flowNodes: [
        { id: 1, icon: Database, position: { x: 20, y: 50 }, label: "Data" },
        { id: 2, icon: Brain, position: { x: 40, y: 30 }, label: "Model" },
        { id: 3, icon: Zap, position: { x: 60, y: 30 }, label: "Train" },
        { id: 4, icon: GitBranch, position: { x: 60, y: 70 }, label: "Test" },
        { id: 5, icon: Share2, position: { x: 80, y: 50 }, label: "Deploy" }
      ],
      connections: [
        { from: { x: 20, y: 50 }, to: { x: 40, y: 30 }, animated: true },
        { from: { x: 40, y: 30 }, to: { x: 60, y: 30 }, animated: true },
        { from: { x: 60, y: 30 }, to: { x: 60, y: 70 }, dashed: true },
        { from: { x: 60, y: 70 }, to: { x: 80, y: 50 }, animated: true },
        { from: { x: 60, y: 30 }, to: { x: 80, y: 50 }, animated: true }
      ],
      nodeType: "engineer"
    },
    {
      key: "leaders",
      icon: UsersIcon,
      title: "For AI Team Leads",
      challenge: "Your experts waste valuable time on routine coding tasks instead of solving core business problems. Knowledge silos create bottlenecks, and onboarding new team members to your complex AI systems takes months instead of days.",
      quote: "Half my senior researchers are stuck debugging TensorFlow code instead of advancing our core technology.",
      benefits: [
        { icon: ArrowRightIcon, title: "Eliminate documentation debt", description: "Self-documenting visual models" },
        { icon: ArrowRightIcon, title: "Accelerate onboarding", description: "New team members understand complex systems at a glance" },
        { icon: ArrowRightIcon, title: "Increase team productivity", description: "3x faster development cycle" }
      ],
      flowNodes: [
        { id: 1, icon: Database, position: { x: 20, y: 30 }, label: "Data" },
        { id: 2, icon: UsersIcon, position: { x: 20, y: 70 }, label: "Team" },
        { id: 3, icon: Brain, position: { x: 50, y: 50 }, label: "Project" },
        { id: 4, icon: BarChart, position: { x: 80, y: 30 }, label: "Results" },
        { id: 5, icon: Share2, position: { x: 80, y: 70 }, label: "Deploy" }
      ],
      connections: [
        { from: { x: 20, y: 30 }, to: { x: 50, y: 50 }, animated: true },
        { from: { x: 20, y: 70 }, to: { x: 50, y: 50 }, animated: true },
        { from: { x: 50, y: 50 }, to: { x: 80, y: 30 }, animated: true },
        { from: { x: 50, y: 50 }, to: { x: 80, y: 70 }, animated: true }
      ],
      nodeType: "lead"
    }
  ];

  // Scroll progress mapping for animations
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [0.8, 1]);

  return (
    <SectionWrapper 
      id="benefits" 
      className="bg-background py-28"
      containerClassName="flex flex-col items-center"
    >
      <motion.div 
        ref={sectionRef}
        className="flex flex-col items-center justify-center space-y-4 text-center mb-24"
        style={{ opacity, scale }}
      >
        <Badge 
          variant="outline" 
          className="px-6 py-2 rounded-full bg-primary/5 text-primary border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors duration-300"
        >
          Who Benefits
        </Badge>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          For the AI Professional Who's{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            Had Enough
          </span>
        </h2>
        <p className="max-w-[800px] text-lg sm:text-xl text-muted-foreground">
          Tensorify solves the real pain points that slow down AI professionals at every level
        </p>
      </motion.div>

      {/* Vertical sequence of sections */}
      {userTypes.map((userData, index) => (
        <UserTypeSection key={userData.key} data={userData} index={index} />
      ))}
    </SectionWrapper>
  );
} 