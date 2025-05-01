import { Hero } from "@/components/hero";
// import { Features } from "@/components/features";
import { ForWhom } from "@/components/for-whom";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { CTA } from "@/components/cta";

// import { useEffect, useRef } from "react";
// import { Demo } from "@/components/demo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* SoftwareApplication Schema for SaaS product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Tensorify.io",
            "applicationCategory": "DeveloperApplication",
            "applicationSubCategory": "AITool",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
              "availability": "https://schema.org/ComingSoon",
              "url": "https://tensorify.io/#pricing"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "25"
            },
            "description": "Tensorify is a node-based AI code generator that lets you visually design your AI architecture by connecting nodes representing different components. You can then automatically generate production-ready code for PyTorch with a single click.",
            "featureList": "Visual AI architecture design, Code generation, Reusable components, Team collaboration",
            "screenshot": "https://tensorify.io/og-image.png",
            "softwareVersion": "1.0.0",
            "author": {
              "@type": "Organization",
              "@id": "https://tensorify.io/#organization"
            }
          })
        }}
      />
     
      <main className="flex-1">
        <div className="relative">
          {/* Main content with sections */}
          <div className="space-y-16">
            <section className="fluid-section">
              <Hero />
            </section>

            {/* <section className="fluid-section">
              <Features />
            </section> */}

            <section className="fluid-section">
              <ForWhom />
            </section>

            <section className="fluid-section">
              <Pricing />
            </section>

            <section className="fluid-section">
              <FAQ />
            </section>

            <section className="fluid-section">
              <CTA />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
