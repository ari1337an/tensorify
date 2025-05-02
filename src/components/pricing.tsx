'use client';
import Link from "next/link";
import { CheckIcon, SparklesIcon, RocketIcon, BuildingIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SectionWrapper } from "./section-wrapper";
import { useNewsletterSignup } from "@/hooks/use-newsletter-signup";

export function Pricing() {
  const { openNewsletterSignup } = useNewsletterSignup();

  const plans = [
    {
      name: "Early Adopter",
      description: "Limited availability for our founding users",
      price: "Free",
      period: "during beta",
      popular: true,
      icon: RocketIcon,
      features: [
        "Full access to all features",
        "PyTorch",
        "Unlimited models and components",
        "Priority support",
        "Influence product roadmap",
        "Lock in favorable pricing post-beta"
      ],
      action: {
        text: "Apply for Early Access",
        onClick: openNewsletterSignup
      }
    },
    {
      name: "Enterprise",
      description: "Tailored solutions for organizations with specific AI needs",
      price: "Custom",
      icon: BuildingIcon,
      features: [
        "Custom deployment options",
        "Integration with existing MLOps stack",
        "Team collaboration features",
        "Dedicated support manager",
        "Security and compliance features",
        "Training and onboarding"
      ],
      action: {
        text: "Contact Us",
        variant: "outline"
      }
    }
  ];

  return (
    <SectionWrapper id="pricing">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Become an{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto]">
            Early Adopter
          </span>
        </h2>
        <p className="max-w-4xl text-lg sm:text-xl text-muted-foreground">
          We&apos;re looking for forward-thinking AI professionals to help shape the future of Tensorify
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-16 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-2xl border border-primary/10 hover:border-primary/30 bg-background/50 backdrop-blur-sm p-6 md:p-8 transition-all duration-500 hover:shadow-2xl ${plan.popular ? 'md:scale-105 md:shadow-xl' : 'shadow-lg'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge
                    className="px-4 py-1 bg-gradient-to-r from-primary to-violet-500 text-white font-medium shadow-lg"
                  >
                    <SparklesIcon className="h-4 w-4 mr-1" />
                    Limited Availability
                  </Badge>
                </div>
              )}

              <div className="mb-6 md:mb-8 space-y-3 relative">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                    {plan.name}
                  </h3>
                </div>
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

              {plan.action.href ? (
                <Button
                  variant={plan.action.variant as "default" | "outline" | undefined}
                  className={`mt-auto relative h-11 md:h-12 ${!plan.action.variant ? 'bg-gradient-to-r from-primary to-violet-500 hover:opacity-90' : 'border-primary/20 hover:bg-primary/5'
                    } shadow-lg hover:shadow-xl transition-all duration-300`}
                  asChild
                >
                  <Link href={plan.action.href}>
                    {plan.action.text}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant={plan.action.variant as "default" | "outline" | undefined}
                  className={`mt-auto relative h-11 md:h-12 ${!plan.action.variant ? 'bg-gradient-to-r from-primary to-violet-500 hover:opacity-90' : 'border-primary/20 hover:bg-primary/5'
                    } shadow-lg hover:shadow-xl transition-all duration-300`}
                  onClick={plan.action.onClick}
                >
                  {plan.action.text}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
} 