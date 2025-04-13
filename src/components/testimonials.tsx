import Image from "next/image";
import { Badge } from "./ui/badge";
import { QuoteIcon } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

export function Testimonials() {
  const testimonials = [
    {
      quote: "Our team was spending 70% of our sprint capacity on boilerplate AI code. With Tensorify, that dropped to 10%. We're now shipping new features at three times our previous velocity.",
      author: "Dr. Sarah Chen",
      role: "Lead ML Engineer at Fortune 500 Company",
      image: "/testimonial-1.png"
    },
    {
      quote: "I implemented a custom GAN architecture in 45 minutes that would have taken two days of coding. The best part? When I needed to radically change the discriminator structure, it took 5 minutes instead of starting over.",
      author: "Prof. Michael Rodriguez",
      role: "AI Researcher at Top University",
      image: "/testimonial-2.png"
    },
    {
      quote: "Tensorify eliminated the communication gap between our research team and engineers. Now they speak the same visual language, and implementation delays have virtually disappeared.",
      author: "Eliza Johnson",
      role: "AI Director at Growing Startup",
      image: "/testimonial-3.png"
    }
  ];

  return (
    <SectionWrapper id="testimonials">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          <Badge 
            variant="outline" 
            className="px-6 py-2 rounded-full bg-primary/5 text-primary border-primary/20 text-sm font-medium hover:bg-primary/10 transition-colors duration-300"
          >
            Testimonials
          </Badge>
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          Real Examples from{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            AI Professionals
          </span>
        </h2>
        <p className="max-w-[900px] text-lg sm:text-xl text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          Hear from the researchers, engineers, and team leads who have transformed their AI development workflow with Tensorify.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
        {testimonials.map((testimonial, index) => (
          <div 
            key={testimonial.author}
            className="flex flex-col space-y-4 animate-fade-in opacity-0"
            style={{ animationDelay: `${0.8 + index * 0.2}s` }}
          >
            <blockquote className="group relative rounded-2xl bg-background/5 backdrop-blur-sm p-6 md:p-8 shadow-lg border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <QuoteIcon className="h-8 w-8 text-primary/20 mb-4 group-hover:text-primary/40 transition-colors duration-300" />
              <p className="mb-6 text-muted-foreground leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="relative flex items-center gap-4 mt-auto">
                <div className="rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 p-1 group-hover:from-primary/20 group-hover:to-violet-500/20 transition-all duration-300">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </blockquote>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}