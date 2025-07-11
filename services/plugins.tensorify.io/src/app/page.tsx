"use client";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "@/app/_components/ui/link";
import { motion, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowRightIcon,
  Code2,
  Puzzle,
  Zap,
  GithubIcon,
  CodeSquare,
  Sparkles,
  Star,
} from "lucide-react";

// Simple seedable random number generator
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Helper to ensure consistent number formatting
function formatNumber(num: number): string {
  return num.toFixed(6);
}

// CTA auth content component with loading state
const CTAAuthContent = () => {
  // Create a local loading state that simulates Clerk's loading behavior
  const [isLoading, setIsLoading] = useState(true);

  // Simulate auth loading with a brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700); // Small delay to avoid flash
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      // Loading skeleton for CTA auth state
      <>
        <div className="h-6 w-2/3 bg-primary/20 animate-pulse rounded mb-4"></div>
        <div className="h-[48px] w-full bg-primary/20 animate-pulse rounded-md mb-3"></div>
        <div className="h-4 w-1/2 bg-muted/30 animate-pulse rounded mx-auto mb-3"></div>
        <div className="h-[40px] w-full bg-muted/30 animate-pulse rounded-md"></div>
      </>
    );
  }

  return (
    <>
      <SignedIn>
        <h3 className="font-semibold mb-4 text-lg text-primary/80">
          Continue Your Journey
        </h3>
        <Link href="/dashboard">
          <motion.button
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Go to Dashboard
          </motion.button>
        </Link>
      </SignedIn>
      <SignedOut>
        <h3 className="font-semibold mb-4 text-lg text-primary/80">
          Start For Free
        </h3>
        <SignUpButton>
          <motion.button
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center mb-3"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>
        </SignUpButton>
        <p className="text-center text-sm text-muted-foreground mb-3">
          Already have an account?
        </p>
        <SignInButton>
          <motion.button
            className="w-full border-2 border-muted px-6 py-2.5 rounded-md font-semibold hover:bg-primary/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
        </SignInButton>
      </SignedOut>
    </>
  );
};

export default function Home() {
  // Count-up animation for stats section (currently commented out)
  const [countVisible, setCountVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const pluginCount = useMotionValue(0);
  const downloadCount = useMotionValue(0);
  const userCount = useMotionValue(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (countVisible) {
      const controls = [
        { current: pluginCount, target: 250, duration: 2 },
        { current: downloadCount, target: 25000, duration: 2.5 },
        { current: userCount, target: 5000, duration: 2 },
      ];

      controls.forEach(({ current, target, duration }) => {
        const animateCount = () => {
          const step = target / (duration * 60);
          if (current.get() < target) {
            current.set(current.get() + step);
            requestAnimationFrame(animateCount);
          } else {
            current.set(target);
          }
        };
        animateCount();
      });
    }
  }, [countVisible, pluginCount, downloadCount, userCount]);

  // Active tab for testimonials
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  // Define testimonials inside useMemo to avoid dependency changes on each render
  const testimonials = useMemo(
    () => [
      {
        quote:
          "The plugin-based AI workflow in Tensorify has transformed how our research team operates. We're seeing 3x faster model iterations. Completely changed the way we work.",
        author: "Dr. Emily Chen",
        role: "AI Research Lead",
        rating: 5,
      },
      {
        quote:
          "I can't imagine going back to traditional AI pipeline coding. Tensorify's plugin architecture saved our startup countless development hours and helped us iterate much faster.",
        author: "Michael Kwon",
        role: "Senior year CS student",
        rating: 5,
      },
      {
        quote:
          "As someone who struggled with complex ML pipelines, Tensorify's plugin ecosystem made my experiments not just easier, but actually enjoyable. The visualization plugins are game-changers.",
        author: "James Wilson",
        role: "ML Engineer",
        rating: 5,
      },
      {
        quote:
          "The official Tensorify plugins are phenomenal. Well-documented, optimized, and seamlessly integrated. They've become the foundation of our AI infrastructure.",
        author: "Sophia Rodriguez",
        role: "Research Scientist",
        rating: 5,
      },
      {
        quote:
          "Reusable AI pipeline components are the best thing that's happened to our team. We've built a library of custom plugins that has dramatically improved our workflow consistency.",
        author: "Priya Sharma",
        role: "Data Scientist",
        rating: 5,
      },
      {
        quote:
          "After years in ML engineering, I've never seen a tool that balances flexibility and structure so well. The plugin architecture lets us standardize workflows while still enabling innovation.",
        author: "Alex Thompson",
        role: "Senior AI Architect",
        rating: 5,
      },
      {
        quote:
          "Our research lab reduced model training setup time by 70% after implementing Tensorify's plugin system. The modular approach is revolutionary for our field.",
        author: "Dr. Marcus Lee",
        role: "ML Architect",
        rating: 5,
      },
      {
        quote:
          "What impressed me most was how easily our junior team members could contribute with their own plugins. The standardized architecture creates a level playing field.",
        author: "Aisha Johnson",
        role: "ML Engineer",
        rating: 5,
      },
      {
        quote:
          "The debugging capabilities alone justify the switch. Being able to visualize each step of our AI pipeline through specialized plugins has saved us countless hours.",
        author: "Thomas Wright",
        role: "AI/ML Engineer",
        rating: 5,
      },
      {
        quote:
          "Tensorify's ecosystem allowed us to prototype in days what used to take weeks. The plugin marketplace is a treasure trove of pre-built components.",
        author: "Leila Mazari",
        role: "Junior AI/ML Engineer",
        rating: 5,
      },
      {
        quote:
          "As a startup, we couldn't afford to build everything from scratch. Tensorify's plugin ecosystem gave us enterprise-grade AI capabilities on a startup budget.",
        author: "David Chen",
        role: "Founder",
        rating: 5,
      },
      {
        quote:
          "The consistent interface across plugins means my team spends less time learning new tools and more time solving actual problems. Game changer for productivity.",
        author: "Elena Vasquez",
        role: "ML Specialist",
        rating: 5,
      },
    ],
    []
  );

  // Auto-sliding effect for testimonials
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (autoSlide) {
      interval = setInterval(() => {
        setActiveTestimonial((prev) => {
          // When reaching the end, smoothly transition back to the beginning
          if (prev >= testimonials.length - 1) {
            return 0; // Reset to first testimonial
          }
          return prev + 1;
        });
      }, 3000); // Change testimonial every 3 seconds (was 5000)
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSlide, testimonials.length]);

  // For visually infinite scroll effect
  const displayedTestimonials = useMemo(() => {
    // Clone a few items from the beginning to the end and from the end to the beginning
    // to create the illusion of infinite scrolling
    const cloneCount = 3; // Number of items to clone on each end
    const firstItems = testimonials.slice(0, cloneCount);
    const lastItems = testimonials.slice(-cloneCount);

    return [...lastItems, ...testimonials, ...firstItems];
  }, [testimonials]);

  // Adjusted index to account for the cloned items
  const adjustedIndex = useMemo(() => {
    const cloneCount = 3;
    return activeTestimonial + cloneCount;
  }, [activeTestimonial]);

  // Handle the loop transition when scrolling
  const handleNextTestimonial = () => {
    if (activeTestimonial >= testimonials.length - 1) {
      // At the end, go back to first
      setActiveTestimonial(0);
    } else {
      setActiveTestimonial(activeTestimonial + 1);
    }
    setAutoSlide(false);
  };

  const handlePrevTestimonial = () => {
    if (activeTestimonial <= 0) {
      // At the beginning, go to last
      setActiveTestimonial(testimonials.length - 1);
    } else {
      setActiveTestimonial(activeTestimonial - 1);
    }
    setAutoSlide(false);
  };

  // Pre-generate static positions for particles
  const heroParticles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const x = seededRandom(i * 123) * 1000;
      const y = seededRandom(i * 456) * 800;
      const opacity = 0.3 + seededRandom(i * 789) * 0.5;
      return {
        x: formatNumber(x),
        y: formatNumber(y),
        opacity: formatNumber(opacity),
        xTarget1: formatNumber(seededRandom(i * 123) * 1000),
        xTarget2: formatNumber(seededRandom(i * 321) * 1000),
        yTarget1: formatNumber(seededRandom(i * 456) * 800),
        yTarget2: formatNumber(seededRandom(i * 789) * 800),
      };
    });
  }, []);

  const ctaParticles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const x = seededRandom(i * 321) * 500;
      const y = seededRandom(i * 654) * 200;
      const opacity = 0.3 + seededRandom(i * 654) * 0.5;
      return {
        x: formatNumber(x),
        y: formatNumber(y),
        opacity: formatNumber(opacity),
        xTarget1: formatNumber(seededRandom(i * 456) * 500),
        xTarget2: formatNumber(seededRandom(i * 789) * 500),
        yTarget1: formatNumber(seededRandom(i * 123) * 200),
        yTarget2: formatNumber(seededRandom(i * 987) * 200),
      };
    });
  }, []);

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background z-0"></div>
        <div className="absolute top-20 -left-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 overflow-hidden">
          {heroParticles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              initial={{
                x: parseFloat(particle.x),
                y: parseFloat(particle.y),
                opacity: parseFloat(particle.opacity),
              }}
              animate={{
                y: [
                  null,
                  parseFloat(particle.yTarget1),
                  parseFloat(particle.yTarget2),
                ],
                x: [
                  null,
                  parseFloat(particle.xTarget1),
                  parseFloat(particle.xTarget2),
                ],
              }}
              transition={{
                duration: 20 + seededRandom(i) * 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{
                opacity: particle.opacity,
                transform: `translateX(${particle.x}px) translateY(${particle.y}px)`,
              }}
            />
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-6">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
                  <Sparkles size={16} className="mr-1.5" /> The Official Plugin
                  Repository
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-500">
                  Tensorify
                </span>{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary">
                  Plugin Repository
                </span>
              </h1>

              <p className="text-lg sm:text-xl mb-10 text-muted-foreground max-w-3xl mx-auto">
                Discover and share powerful plugins that unlock the true
                potential of Tensorify.{" "}
                <span className="text-primary/90">
                  Amplify your AI workflow, boost productivity, and customize
                </span>{" "}
                your experience with our ecosystem of transformative plugins.
              </p>

              <div className="flex justify-center">
                <Link href="/search">
                  <motion.button
                    className="w-full sm:w-auto px-8 py-4 rounded-md font-semibold text-white shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:shadow-indigo-500/20 hover:scale-105 focus:ring-2 focus:ring-purple-500/40 relative overflow-hidden inline-flex items-center justify-center"
                    whileHover={{
                      backgroundPosition: ["0% 50%", "100% 50%"],
                      transition: { duration: 2 },
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                      backgroundPosition: "0% 50%",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 font-bold">Get Started</span>
                    <ArrowRightIcon className="ml-2 h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Supercharge Your Tensorify Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Plugins that complement Tensorify&apos;s core capabilities and
              empower users to achieve more
            </p>
          </div>

          {/* Stats Section */}
          {/* <div className="mb-20" ref={statsRef}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                className="p-6 bg-card rounded-xl border border-border shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Puzzle className="h-6 w-6 text-primary" />
                </div>
                <motion.h3 className="text-4xl font-bold text-foreground">
                  {displayPluginCount}
                </motion.h3>
                <p className="text-muted-foreground mt-2">Available Plugins</p>
              </motion.div>

              <motion.div
                className="p-6 bg-card rounded-xl border border-border shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <motion.h3 className="text-4xl font-bold text-foreground">
                  {displayDownloadCount}+
                </motion.h3>
                <p className="text-muted-foreground mt-2">Total Downloads</p>
              </motion.div>

              <motion.div
                className="p-6 bg-card rounded-xl border border-border shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <motion.h3 className="text-4xl font-bold text-foreground">
                  {displayUserCount}+
                </motion.h3>
                <p className="text-muted-foreground mt-2">Happy Users</p>
              </motion.div>
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <motion.div
              className="bg-card rounded-xl p-6 shadow-lg border border-border hover:border-primary/20 transition-all"
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Puzzle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary/90">
                Easy Integration
              </h3>
              <p className="text-muted-foreground">
                Seamlessly integrate plugins that complement Tensorify&apos;s
                core features and extend its capabilities.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              className="bg-card rounded-xl p-6 shadow-lg border border-border hover:border-primary/20 transition-all"
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary/90">
                Enhanced Workflow
              </h3>
              <p className="text-muted-foreground">
                Leverage community-driven plugins to customize and optimize your
                AI development process.
              </p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              className="bg-card rounded-xl p-6 shadow-lg border border-border hover:border-primary/20 transition-all"
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary/90">
                Empowered AI Development
              </h3>
              <p className="text-muted-foreground">
                Transform model training, visualization, and deployment with
                plugins that unlock Tensorify&apos;s full potential.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Plugin Demo Section */}
      {/* <section className="py-20 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles size={16} className="mr-1.5" /> Interactive Demo
            </span>
            <h2 className="text-3xl font-bold mb-4">
              See How Plugins Transform Your Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore how our plugins seamlessly integrate with Tensorify
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="p-1 bg-muted">
              <div className="flex space-x-1.5 px-3 py-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                <div className="w-3 h-3 rounded-full bg-chart-4/70"></div>
                <div className="w-3 h-3 rounded-full bg-chart-2/70"></div>
              </div>
            </div>
            <div className="p-6 relative">
              <motion.div
                className="relative h-[300px] md:h-[400px] bg-background rounded border border-border p-4 overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="text-4xl mb-4">✨</div>
                    <h3 className="text-xl font-bold mb-2">
                      Interactive Plugin Demo
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Experience how our plugins transform your workflow in
                      real-time
                    </p>
                    <motion.button
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Try Demo
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
              <Star size={16} className="mr-1.5" /> Testimonials
            </span>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their
              workflow with our{" "}
              <span className="text-primary/80">plugin ecosystem</span>
            </p>
          </div>

          {/* Center-focused carousel with peeking sides */}
          <div className="relative overflow-hidden py-4 px-4">
            {/* Main carousel container with drag interaction */}
            <motion.div
              className="flex items-center overflow-visible max-w-[95%] md:max-w-5xl mx-auto"
              drag="x"
              dragConstraints={{ left: -1200, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setAutoSlide(false)}
              onDragEnd={(_, info) => {
                // Implement drag to next/previous based on velocity
                if (info.velocity.x < -100) {
                  handleNextTestimonial();
                } else if (info.velocity.x > 100) {
                  handlePrevTestimonial();
                }
              }}
              animate={{ x: `-${(adjustedIndex * 100) / 3}%` }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
            >
              {displayedTestimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className={`min-w-[80%] sm:min-w-[60%] md:min-w-[45%] lg:min-w-[33%] px-4 transition-all duration-500 ${
                    index === adjustedIndex
                      ? "scale-100 opacity-100"
                      : "scale-95 opacity-70"
                  }`}
                  animate={{
                    scale: index === adjustedIndex ? 1 : 0.95,
                    opacity: index === adjustedIndex ? 1 : 0.7,
                  }}
                  onClick={() => {
                    // Adjust the index to account for the cloned items
                    const cloneCount = 3;
                    if (index < cloneCount) {
                      // Clicked on a cloned item from the end
                      setActiveTestimonial(
                        testimonials.length - cloneCount + index
                      );
                    } else if (index >= cloneCount + testimonials.length) {
                      // Clicked on a cloned item from the beginning
                      setActiveTestimonial(
                        index - testimonials.length - cloneCount
                      );
                    } else {
                      // Clicked on a regular item
                      setActiveTestimonial(index - cloneCount);
                    }
                    setAutoSlide(false);
                  }}
                  onHoverStart={() => setAutoSlide(false)}
                >
                  <div className="bg-card h-full relative rounded-xl overflow-hidden transition-all duration-300 border border-border hover:border-primary/30 hover:shadow-xl">
                    {/* Accent top bar */}
                    <motion.div
                      className="h-1.5 bg-gradient-to-r from-primary/80 to-chart-4/80"
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    ></motion.div>

                    <div className="p-6">
                      {/* Quote mark */}
                      <div className="absolute top-4 right-4 text-3xl text-primary/10 font-serif">
                        &ldquo;
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < testimonial.rating
                                ? "text-chart-4"
                                : "text-muted/30"
                            }`}
                            fill={
                              i < testimonial.rating ? "currentColor" : "none"
                            }
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="mb-6 relative z-10 text-foreground/90 text-sm">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>

                      {/* Author info */}
                      <div className="flex items-center border-t border-border/60 pt-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-primary/80">
                            {testimonial.author}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Navigation arrows and pagination */}
            <div className="mt-8 flex items-center justify-center">
              <motion.button
                onClick={handlePrevTestimonial}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary/80 transition-colors mr-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.button>

              <div className="flex justify-center items-center space-x-1 px-4">
                <span className="text-sm font-medium text-primary/80">
                  {activeTestimonial + 1}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {testimonials.length}
                </span>
              </div>

              <motion.button
                onClick={handleNextTestimonial}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary/80 transition-colors ml-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.56499 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Dots navigation */}
            <div className="flex justify-center mt-4 space-x-1 overflow-hidden max-w-full">
              <div className="flex space-x-1 overflow-x-auto px-2 py-1 no-scrollbar">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTestimonial(index);
                      setAutoSlide(false);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeTestimonial === index
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-muted hover:bg-primary/50"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>

            {/* Floating particles */}
            {ctaParticles.map((particle, i) => (
              <motion.div
                key={`cta-particle-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary/50"
                initial={{
                  x: parseFloat(particle.x),
                  y: parseFloat(particle.y),
                  opacity: parseFloat(particle.opacity),
                }}
                animate={{
                  y: [
                    null,
                    parseFloat(particle.yTarget1),
                    parseFloat(particle.yTarget2),
                  ],
                  x: [
                    null,
                    parseFloat(particle.xTarget1),
                    parseFloat(particle.xTarget2),
                  ],
                }}
                transition={{
                  duration: 10 + seededRandom(i * 10) * 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                style={{
                  opacity: particle.opacity,
                  transform: `translateX(${particle.x}px) translateY(${particle.y}px)`,
                }}
              />
            ))}

            <div className="relative z-10 text-center md:text-left md:flex md:items-center md:justify-between">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary/20 text-primary mb-4">
                  <Sparkles size={16} className="mr-1.5" /> Limited Time Offer
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Ready to transform your workflow?
                </h2>
                <p className="text-muted-foreground">
                  Join our community of developers and users today and get
                  access to exclusive plugins.
                </p>

                <div className="flex items-center mt-6 text-primary">
                  <div className="flex-1 h-0.5 bg-primary/20 rounded"></div>
                </div>

                <ul className="mt-6 space-y-2">
                  {[
                    "Access to all public plugins",
                    "Regular updates and new features",
                    "Community support and resources",
                    "Early access to beta plugins",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <svg
                        className="w-4 h-4 mr-2 text-primary flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 13L10 16L17 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4 md:min-w-[300px]">
                <div className="bg-card p-6 rounded-xl border border-border shadow-lg">
                  <CTAAuthContent />
                </div>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center hover:text-primary/70 transition-colors"
                >
                  <motion.button
                    className="w-full border-2 border-muted px-6 py-3 rounded-md font-semibold hover:bg-primary/10 hover:border-primary/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Read Documentation
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Tensorify Plugin Repository
              </h3>
              <p className="text-muted-foreground text-sm">
                Discover, share, and extend your Tensorify experience
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="https://github.com/tensorify"
                className="text-muted-foreground hover:text-primary/70 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="h-6 w-6" />
              </a>
              <a
                href="/docs"
                className="text-muted-foreground hover:text-primary/70 transition-colors"
                aria-label="Documentation"
              >
                <CodeSquare className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center md:text-left md:flex md:justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Tensorify. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex flex-wrap justify-center md:justify-start space-x-6">
                <li>
                  <a
                    href="https://tensorify.io/terms"
                    className="text-sm text-muted-foreground hover:text-primary/70 transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="https://tensorify.io/privacy"
                    className="text-sm text-muted-foreground hover:text-primary/70 transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
