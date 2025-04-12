import Link from "next/link";
import { CheckIcon, SparklesIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SectionWrapper } from "./section-wrapper";

export function Pricing() {
  const plans = [
    {
      name: "Researcher",
      description: "Perfect for academic researchers and hobbyists",
      price: "$0",
      period: "/month",
      features: [
        "Basic node library",
        "PyTorch code generation",
        "Up to 5 models",
        "Community support"
      ],
      action: {
        text: "Get Started",
        href: "/signup"
      }
    },
    {
      name: "Professional",
      description: "For individual ML engineers and small teams",
      price: "$49",
      period: "/month",
      popular: true,
      features: [
        "Full node library",
        "Multi-framework support (PyTorch, TensorFlow, JAX)",
        "Unlimited models",
        "Custom component creation",
        "Priority support"
      ],
      action: {
        text: "Start Free Trial",
        href: "/signup"
      }
    },
    {
      name: "Enterprise",
      description: "For organizations with advanced AI needs",
      price: "Custom",
      features: [
        "Everything in Professional",
        "Private deployment options",
        "Custom integrations",
        "Team collaboration features",
        "Dedicated support manager",
        "SLA guarantees"
      ],
      action: {
        text: "Contact Sales",
        href: "/contact",
        variant: "outline"
      }
    }
  ];

  return (
    <SectionWrapper id="pricing">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <Badge 
            variant="outline" 
            className="px-6 py-2 rounded-full bg-primary/5 text-primary border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors duration-300"
          >
            Pricing
          </Badge>
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          Choose Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            Plan
          </span>
        </h2>
        <p className="max-w-[900px] text-lg sm:text-xl text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          Flexible options for researchers, engineers, and enterprises
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
        {plans.map((plan, index) => (
          <div 
            key={plan.name}
            className={`group relative flex flex-col rounded-2xl border border-primary/10 hover:border-primary/30 bg-background/50 backdrop-blur-sm p-6 md:p-8 transition-all duration-500 hover:shadow-2xl animate-fade-in opacity-0 ${
              plan.popular ? 'md:scale-105 md:shadow-xl' : 'shadow-lg'
            }`}
            style={{ animationDelay: `${0.8 + index * 0.2}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge 
                  className="px-4 py-1 bg-gradient-to-r from-primary to-violet-500 text-white font-medium shadow-lg"
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="mb-6 md:mb-8 space-y-3 relative">
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                {plan.name}
              </h3>
              <p className="text-muted-foreground">
                {plan.description}
              </p>
            </div>

            <div className="mb-6 md:mb-8 relative">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
            </div>

            <ul className="mb-6 md:mb-8 space-y-3 text-base relative">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-violet-500/20 transition-colors duration-300">
                    <CheckIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button 
              variant={plan.action.variant || "default"}
              className={`mt-auto relative h-11 md:h-12 ${
                !plan.action.variant ? 'bg-gradient-to-r from-primary to-violet-500 hover:opacity-90' : 'border-primary/20 hover:bg-primary/5'
              } shadow-lg hover:shadow-xl transition-all duration-300`}
              asChild
            >
              <Link href={plan.action.href}>
                {plan.action.text}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
} 