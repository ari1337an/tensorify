'use client';

import { useRef, useState } from 'react';
import { Beaker as BeakerIcon, Briefcase as BriefcaseIcon, Users as UsersIcon, ArrowRight as ArrowRightIcon, Database, Brain, Zap, GitBranch, Share2, GraduationCap as GraduationCapIcon, ArrowUp as ArrowUpIcon, Microscope, Cog, LineChart, FileText, Target, Users, TrendingUp, BarChart2 } from 'lucide-react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SectionWrapper } from "./section-wrapper";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import React from 'react';
import { InteractiveFlow, FlowItem } from './flow-components';

// Define user types with improved flow diagrams and connection points
const userTypes = [
  {
    key: "researchers",
    icon: BeakerIcon,
    title: "For AI Researchers",
    challenge: "Implementing your ideas in code is time-consuming, prone to bugs, and distracts from core research work. The gap between your theoretical models and working prototypes slows down your research cycle.",
    quote: "I spend too much time fixing implementation details instead of focusing on improving the actual algorithm.",
    benefits: [
      { icon: ArrowRightIcon, title: "Rapidly prototype ideas", description: "From concept to experiment in minutes" },
      { icon: ArrowRightIcon, title: "Focus on research goals", description: "Abstract away implementation details" },
      { icon: ArrowRightIcon, title: "Accelerate iterations", description: "Test variations with minimal friction" }
    ],
    flowItems: [
      { 
        id: 1, 
        icon: Microscope, 
        position: { x: 25, y: 30 }, 
        label: "Hypothesis",
        description: "Research formulation",
        params: { "novelty": "High", "scope": "Defined" }
      },
      { 
        id: 2, 
        icon: Cog, 
        position: { x: 75, y: 30 }, 
        label: "Experiment",
        description: "Methodology design",
        params: { "variables": "12", "controls": "5" },
        conditional: true
      },
      { 
        id: 3, 
        icon: Database, 
        position: { x: 50, y: 50 }, 
        label: "Data",
        description: "Collection & preprocessing",
        params: { "source": "Multi-modal", "size": "250GB" }
      },
      { 
        id: 4, 
        icon: LineChart, 
        position: { x: 25, y: 70 }, 
        label: "Analysis",
        description: "Statistical evaluation",
        params: { "methods": "5+", "significance": "p<0.01" }
      },
      { 
        id: 5, 
        icon: FileText, 
        position: { x: 75, y: 70 }, 
        label: "Publication",
        description: "Research documentation",
        params: { "journal": "Nature AI", "citations": "Projected 45+" }
      }
    ],
    connections: [
      { from: 1, to: 2, animated: true },
      { from: 2, to: 3, animated: true },
      { from: 3, to: 4, animated: true },
      { from: 4, to: 5, animated: true },
      { from: 5, to: 1, dashed: true }
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
      { icon: ArrowRightIcon, title: "Generate optimized code", description: "For PyTorch with one click" },
      { icon: ArrowRightIcon, title: "Maintain full control", description: "Access and customize the generated code" }
    ],
    flowItems: [
      { 
        id: 1, 
        icon: Database, 
        position: { x: 25, y: 30 }, 
        label: "Data",
        description: "Collection & integration",
        params: { "sources": "API, Files, DB", "format": "Tensor" }
      },
      { 
        id: 2, 
        icon: Brain, 
        position: { x: 75, y: 30 }, 
        label: "Model",
        description: "Architecture selection",
        params: { "framework": "TensorFlow", "complexity": "Medium" }
      },
      { 
        id: 3, 
        icon: Zap, 
        position: { x: 50, y: 50 }, 
        label: "Train",
        description: "GPU/TPU optimization",
        params: { "batch": "128", "epochs": "50" }
      },
      { 
        id: 4, 
        icon: GitBranch, 
        position: { x: 25, y: 70 }, 
        label: "Test",
        description: "Validation & metrics",
        params: { "accuracy": "94.7%", "loss": "0.023" }
      },
      { 
        id: 5, 
        icon: Share2, 
        position: { x: 75, y: 70 }, 
        label: "Deploy",
        description: "CI/CD pipeline",
        params: { "platform": "GCP", "latency": "<200ms" }
      }
    ],
    connections: [
      { from: 1, to: 2, animated: true },
      { from: 2, to: 3, animated: true },
      { from: 3, to: 4, dashed: true },
      { from: 4, to: 5, animated: true },
      { from: 3, to: 5, animated: true }
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
    flowItems: [
      { 
        id: 1, 
        icon: Target, 
        position: { x: 25, y: 30 }, 
        label: "Strategy",
        description: "Business alignment",
        params: { "timeframe": "3-5 years", "ROI": "25%" }
      },
      { 
        id: 2, 
        icon: Users, 
        position: { x: 75, y: 30 }, 
        label: "Team",
        description: "Resource allocation",
        params: { "headcount": "15", "budget": "$2.1M" }
      },
      { 
        id: 3, 
        icon: TrendingUp, 
        position: { x: 25, y: 70 }, 
        label: "KPIs",
        description: "Performance tracking",
        params: { "metrics": "7 core", "frequency": "Weekly" }
      },
      { 
        id: 4, 
        icon: BarChart2, 
        position: { x: 75, y: 70 }, 
        label: "Impact",
        description: "Business outcomes",
        params: { "revenue": "+18%", "efficiency": "+32%" }
      }
    ],
    connections: [
      { from: 1, to: 3, animated: true },
      { from: 2, to: 3, animated: true },
      { from: 3, to: 4, animated: true },
      { from: 3, to: 5, animated: true },
      { from: 4, to: 5, dashed: true }
    ],
    nodeType: "lead"
  },
  {
    key: "educators",
    icon: GraduationCapIcon,
    title: "For Academic Educators",
    challenge: "Your students spend more time debugging code than learning AI concepts. The complexity of implementation is a barrier to understanding the fundamental principles you're trying to teach.",
    quote: "I spend half my office hours helping students fix their PyTorch code instead of discussing the actual models.",
    benefits: [
      { icon: ArrowRightIcon, title: "Focus on concepts", description: "Students learn AI principles without getting lost in implementation details" },
      { icon: ArrowRightIcon, title: "Enable hands-on learning", description: "Experiment with complex architectures that would be impractical to code from scratch" },
      { icon: ArrowRightIcon, title: "Accelerate learning cycles", description: "Complete more meaningful projects within academic time constraints" }
    ],
    flowItems: [
      { 
        id: 1, 
        icon: Brain, 
        position: { x: 20, y: 30 }, 
        label: "Concept",
        description: "AI theory & fundamentals",
        params: { "depth": "Graduate", "topics": "12" }
      },
      { 
        id: 2, 
        icon: UsersIcon, 
        position: { x: 20, y: 70 }, 
        label: "Students",
        description: "Interactive learning",
        params: { "level": "Mixed", "cohort": "25" }
      },
      { 
        id: 3, 
        icon: Database, 
        position: { x: 50, y: 50 }, 
        label: "Visualization",
        description: "Interactive explanations",
        params: { "models": "8 types", "real-time": "Yes" }
      },
      { 
        id: 4, 
        icon: GitBranch, 
        position: { x: 80, y: 30 }, 
        label: "Experiments",
        description: "Hands-on exercises",
        params: { "difficulty": "Adaptive", "auto-grade": "Yes" }
      },
      { 
        id: 5, 
        icon: Zap, 
        position: { x: 80, y: 70 }, 
        label: "Learning",
        description: "Knowledge assessment",
        params: { "retention": "+78%", "feedback": "Instant" }
      }
    ],
    connections: [
      { from: 1, to: 3, animated: true },
      { from: 2, to: 3, animated: true },
      { from: 3, to: 4, animated: true },
      { from: 3, to: 5, animated: true },
      { from: 4, to: 5, dashed: true }
    ],
    nodeType: "lead"
  }
];

// UserTypeSection with ReactFlow integration
const UserTypeSection = ({ 
  data, 
  index 
}: { 
  data: typeof userTypes[0]; 
  index: number 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  
  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ 
        duration: 0.8, 
        delay: 0.1, 
        ease: [0.17, 0.55, 0.55, 1] 
      }}
      className="w-full max-w-6xl px-4 mb-32 relative"
    >
      {/* Connector Line for sequence */}
      {index !== 0 && (
        <div className="absolute top-[-80px] left-1/2 w-0.5 h-[80px] bg-gradient-to-b from-primary/5 to-primary/30"></div>
      )}
      
      {/* Flow node indicator */}
      <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2">
        <motion.div
          className="w-16 h-16 rounded-full bg-gray-900/70 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <data.icon className="h-7 w-7 text-primary" />
        </motion.div>
      </div>
      
      <Card className="border-primary/10 bg-gray-950/20 backdrop-blur-xl overflow-hidden rounded-xl shadow-xl">
        <div className="p-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                  {data.key.charAt(0).toUpperCase() + data.key.slice(1)}
                </Badge>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">{data.title}</h3>
              </motion.div>
              
              <div className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h4 className="font-semibold text-lg text-foreground">Your Current Challenge:</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {data.challenge}
                  </p>
                </motion.div>
                
                <motion.blockquote 
                  className="border-l-4 border-primary/60 pl-6 py-3 italic text-muted-foreground bg-primary/5 rounded-r-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  &ldquo;{data.quote}&rdquo;
                </motion.blockquote>
                
                <div>
                  <motion.h4 
                    className="font-semibold text-lg text-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    How Tensorify Helps:
                  </motion.h4>
                  <ul className="space-y-3 mt-4">
                    {data.benefits.map((benefit, idx) => (
                      <motion.li 
                        key={idx} 
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
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
              className="relative h-[500px] rounded-2xl overflow-hidden border border-primary/10 bg-gray-950/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <InteractiveFlow 
                flowItems={data.flowItems as FlowItem[]} 
                connections={data.connections}
                persona={data.nodeType}
                onNodeClick={handleNodeClick}
              />
              
              {/* Caption badge */}
              
              
              {/* Node details */}
              
            </motion.div>
          </div>
        </div>
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
  
  // Scroll progress mapping for animations
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [0.8, 1]);

  return (
    <SectionWrapper 
      id="benefits" 
      className="pt-24 pb-32"
      containerClassName="flex flex-col items-center"
    >
      <div className="relative mb-8">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-28 w-px bg-gradient-to-b from-primary/40 to-primary/10"></div>
      </div>
      
      <motion.div 
        ref={sectionRef}
        className="flex flex-col items-center justify-center space-y-6 text-center mb-24"
        style={{ opacity, scale }}
      >
        <Badge 
          variant="outline" 
          className="px-6 py-2 rounded-full bg-primary/5 text-primary border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors duration-300"
        >
          Role-Based Solutions
        </Badge>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          For the AI Professional Who&apos;s{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            Had Enough
          </span>
        </h2>
        <p className="max-w-[800px] text-lg sm:text-xl text-muted-foreground">
          Discover how Tensorify solves specific pain points for each role in the AI development lifecycle
        </p>
      </motion.div>

      {/* Vertical sequence of sections */}
      {userTypes.map((userData, index) => (
        <UserTypeSection key={userData.key} data={userData} index={index} />
      ))}
      
    
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