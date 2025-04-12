import { CodeIcon, BrainCircuitIcon, ZapIcon, PlugIcon, BookOpenIcon, WandIcon, RocketIcon } from 'lucide-react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";

export function Features() {
  const features = [
    {
      icon: BrainCircuitIcon,
      title: "Visual Model Architecture",
      description: "Design complex AI architectures using an intuitive node-based interface. Connect layers, transformers, attention mechanisms, and other components visually.",
      perfect: "Rapid prototyping"
    },
    {
      icon: CodeIcon,
      title: "Production-Ready Code",
      description: "Generate optimized code for TensorFlow, PyTorch, or JAX with a single click. No more tedious translation from concept to implementation.",
      perfect: "Eliminating boilerplate"
    },
    {
      icon: ZapIcon,
      title: "Lightning-Fast Iteration",
      description: "Test hypotheses immediately by reconfiguring nodes rather than rewriting code. Turn days of work into minutes of exploration.",
      perfect: "Research exploration"
    },
    {
      icon: PlugIcon,
      title: "Custom Components",
      description: "Create and share custom nodes for your specific research domains. Build on top of your team's expertise with reusable components.",
      perfect: "Specialized research"
    },
    {
      icon: BookOpenIcon,
      title: "Self-Documenting Models",
      description: "Your visual architecture is living documentation. New team members understand complex systems at a glance, eliminating knowledge silos.",
      perfect: "Team collaboration"
    },
    {
      icon: RocketIcon,
      title: "Deployment Ready",
      description: "From research to production in one workflow. Export optimized, deployment-ready code that integrates with your existing infrastructure.",
      perfect: "Production pipelines"
    }
  ];

  return (
    <SectionWrapper id="features">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <Badge 
            variant="outline" 
            className="px-6 py-2 rounded-full bg-primary/5 text-primary border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors duration-300"
          >
            Why Tensorify?
          </Badge>
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          Solve Real AI Development{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            Challenges
          </span>
        </h2>
        <p className="max-w-[800px] text-lg sm:text-xl text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          From research to production, Tensorify eliminates the tedious parts of AI development so you can focus on innovation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 mb-20">
        {features.map((feature, index) => (
          <Card 
            key={feature.title}
            className="group relative bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl overflow-hidden animate-fade-in opacity-0"
            style={{ animationDelay: `${0.8 + index * 0.1}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col items-start space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 group-hover:from-primary/20 group-hover:to-violet-500/20 transition-all duration-500 group-hover:scale-110">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-violet-500 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground text-left leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-primary/80 font-medium mt-2">
                  <WandIcon className="h-4 w-4" />
                  <span>Perfect for: {feature.perfect}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-violet-500/5 border-primary/20 p-8 sm:p-12">
        <div className="absolute inset-0 bg-grid-white/5 bg-grid-pattern [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 space-y-6">
            <h3 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
              Ready to accelerate your AI development?
            </h3>
            <p className="text-xl text-muted-foreground">
              Join researchers and engineers from leading organizations who are building better AI, faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg"
                className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link href="/get-started">Get Started Free</Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-primary/20 hover:bg-primary/5 transition-all duration-300"
                asChild
              >
                <Link href="#demo">See Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </SectionWrapper>
  );
} 