import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { ForWhom } from "@/components/for-whom";
import { Testimonials } from "@/components/testimonials";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
// import { Demo } from "@/components/demo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-accent/30 via-accent/20 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-accent/30 via-accent/20 to-transparent blur-3xl"></div>
          
          {/* Main content */}
          <div className="stagger-animation">
            <Hero />
            <Features />
            {/* <Demo /> */}
            <ForWhom />
            {/* <Testimonials /> */}
            <Pricing />
            <FAQ />
            <CTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
