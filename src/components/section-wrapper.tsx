import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
}

export function SectionWrapper({
  children,
  id,
  className,
  containerClassName
}: SectionWrapperProps) {
  return (
    <section 
      id={id} 
      className={cn(
        "relative w-full py-24 md:py-32 lg:py-40 overflow-hidden",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-pattern [mask-image:radial-gradient(white,transparent_85%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-1/2 bg-gradient-to-r from-primary/20 to-transparent blur-[100px]" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-1/2 bg-gradient-to-l from-violet-500/20 to-transparent blur-[100px]" />

      <div className={cn(
        "container relative mx-auto max-w-7xl px-4 md:px-6",
        containerClassName
      )}>
        {children}
      </div>
    </section>
  );
} 