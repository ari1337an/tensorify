import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Tensorify.io, our mission, and the team behind the visual AI development platform.",
  openGraph: {
    title: "About Tensorify.io",
    description: "Learn about Tensorify.io, our mission, and the team behind the visual AI development platform.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://tensorify.io"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "About Us",
                "item": "https://tensorify.io/about"
              }
            ]
          })
        }}
      />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Tensorify</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground mb-6">
            Tensorify is a cutting-edge AI development platform built for researchers and engineers.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
          <p>
            Placeholder for mission statement. We aim to revolutionize how AI models are created by providing a
            visual development environment that generates production-ready code.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Team</h2>
          <p>
            Placeholder for team information. Our diverse team of AI experts, researchers, and software developers
            is committed to building tools that accelerate AI development.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Story</h2>
          <p>
            Placeholder for company story. Tensorify was founded in 2023 to address the growing gap between AI research
            and implementation, making advanced AI techniques accessible to more developers and researchers.
          </p>
        </div>
      </div>
    </div>
  );
} 