'use client';

import { useRef } from 'react';
import { Beaker as BeakerIcon, Briefcase as BriefcaseIcon, Users as UsersIcon, ArrowRight as ArrowRightIcon, GraduationCap as GraduationCapIcon } from 'lucide-react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { SectionWrapper } from "./section-wrapper";
import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    nodeType: "engineer"
  },
  {
    key: "leaders",
    icon: UsersIcon,
    title: "For AI Team Leads",
    challenge: "Your experts waste valuable time on routine coding tasks instead of solving core business problems. Knowledge silos create bottlenecks, and onboarding new team members to your complex AI systems takes months instead of days.",
    quote: "Half my senior researchers are stuck debugging PyTorch code instead of advancing our core technology.",
    benefits: [
      { icon: ArrowRightIcon, title: "Eliminate documentation debt", description: "Self-documenting visual models" },
      { icon: ArrowRightIcon, title: "Accelerate onboarding", description: "New team members understand complex systems at a glance" },
      { icon: ArrowRightIcon, title: "Increase team productivity", description: "3x faster development cycle" }
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
    nodeType: "lead"
  }
];

// Add the BenefitNode component definition
const BenefitNode = ({
  benefit
}: {
  benefit: { icon: LucideIcon; title: string; description: string };
}) => {
  return (
    <div className="relative pl-8 py-4">
      {/* Node marker */}
      <div className="absolute left-0 top-5 w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-md shadow-primary/10">
        <benefit.icon className="h-4 w-4 text-primary" />
      </div>

      {/* Content */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 shadow-md shadow-primary/5">
        <h5 className="font-semibold text-base text-primary mb-1">{benefit.title}</h5>
        <p className="text-sm text-muted-foreground">{benefit.description}</p>
      </div>
    </div>
  );
};

// UserTypeSection with static rendering
const UserTypeSection = ({
  data
}: {
  data: typeof userTypes[0];
}) => {
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className="w-full max-w-6xl px-4 mb-16 md:mb-20 relative" // Reduced spacing between cards
    >
      <Card className="border-primary/10 bg-gray-950/20 backdrop-blur-xl overflow-hidden rounded-xl shadow-xl">
        <div className="p-6 sm:p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left column with title, challenge, and quote */}
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center flex-wrap gap-4">
                <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                  {data.key.charAt(0).toUpperCase() + data.key.slice(1)}
                </Badge>
                <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">{data.title}</h3>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-base md:text-lg text-foreground">Your Current Challenge:</h4>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {data.challenge}
                  </p>
                </div>

                <blockquote className="border-l-4 border-primary/60 pl-4 md:pl-6 py-3 italic text-sm md:text-base text-muted-foreground bg-primary/5 rounded-r-md">
                  &ldquo;{data.quote}&rdquo;
                </blockquote>
              </div>
            </div>

            {/* Right column with vertical benefit nodes */}
            <div className="pt-4 md:pt-6">
              {/* Section title */}
              <div className="mb-6 md:mb-8">
                <h4 className="font-semibold text-base md:text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500 inline-block">
                  How Tensorify Helps:
                </h4>
                <div className="mt-2 h-0.5 w-24 md:w-32 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>

              {/* Let's keep the vertical decorative line inside each benefit card but remove the connecting animated lines */}
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gradient-to-b from-primary/50 via-violet-500/30 to-transparent"></div>

                {/* Benefit nodes */}
                <div className="space-y-0">
                  {data.benefits.map((benefit, idx) => (
                    <BenefitNode
                      key={idx}
                      benefit={benefit}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export function ForWhom() {
  const sectionRef = useRef(null);

  return (
    <SectionWrapper
      id="for-whom"
      className="pt-16 md:pt-24 pb-24 md:pb-32"
      containerClassName="flex flex-col items-center"
    >
      <div
        ref={sectionRef}
        className="flex flex-col items-center justify-center space-y-4 md:space-y-6 text-center mb-16 md:mb-24 px-4"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
          For the AI Professional Who&apos;s{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto]">
            Had Enough
          </span>
        </h2>
        <p className="max-w-[800px] text-base md:text-lg lg:text-xl text-muted-foreground">
          Discover how Tensorify solves specific pain points for each role in the AI development lifecycle
        </p>
      </div>

      {/* Vertical sequence of sections */}
      {userTypes.map((userData) => (
        <UserTypeSection key={userData.key} data={userData} />
      ))}
    </SectionWrapper>
  );
}