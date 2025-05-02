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
  alternates: {
    canonical: "https://tensorify.io/about",
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
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Tensorify</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <div className="bg-gradient-to-br from-primary/10 to-violet-500/10 p-6 rounded-xl border border-primary/20 mb-12">
            <p className="text-xl font-medium mb-0">
              Tensorify.io is a product of <span className="text-primary font-semibold">ALPHAWOLF VENTURES, INC.</span>
            </p>
          </div>
          
          <p className="text-xl mb-8">
            We&apos;re a team of AI researchers and engineers who&apos;ve experienced firsthand the frustrations, inefficiencies, and technical barriers to innovation in AI model development.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Story</h2>
          <p className="mb-4">
            Tensorify was born from our own research struggles. As AI researchers, we spent countless hours writing boilerplate code, debugging complex model architectures, and translating conceptual designs into working implementations. We watched brilliant ideas fail to materialize because of technical implementation challenges rather than flaws in the underlying concepts.
          </p>
          <p className="mb-4">
            What started as an internal tool to visualize our own model architectures evolved into Tensorify—a platform that transforms how researchers and engineers approach AI development. Founded in 2023 as part of ALPHAWOLF VENTURES, INC., we set out to bridge the gap between research concepts and production-ready code.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Built By Researchers, For Researchers</h2>
          <p className="mb-4">
            We understand the pain points because we&apos;ve lived them:
          </p>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>Hours wasted on writing repetitive boilerplate code</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>The frustration of debugging complex model architectures</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>The disconnect between mental model design and implementation</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>The challenge of making cutting-edge research accessible to others</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">→</span>
              <span>The time lost to misaligned tensor dimensions and incompatible layers</span>
            </li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
          <p className="mb-4">
            We&apos;re on a mission to revolutionize AI development by eliminating technical friction and empowering researchers to focus on innovation rather than implementation. Tensorify transforms abstract model designs into production-ready code, bridging the gap between concept and deployment.
          </p>
          <p className="mb-4">
            Our platform enables researchers to visualize complex neural architectures, experiment rapidly, and generate optimized code—all without writing a single line of boilerplate. By providing a visual development environment, we&apos;re making advanced AI techniques more accessible, collaborative, and efficient.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Approach</h2>
          <p className="mb-4">
            We believe that AI innovation should be limited only by imagination, not technical implementation barriers. Our node-based visual interface transforms how researchers interact with complex model architectures:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-background border border-primary/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-primary">Visualize</h3>
              <p>Design complex architectures visually by connecting components, seeing data flow, and understanding relationships at a glance.</p>
            </div>
            <div className="bg-background border border-primary/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-primary">Generate</h3>
              <p>Transform visual designs into clean, optimized, production-ready PyTorch code with a single click.</p>
            </div>
            <div className="bg-background border border-primary/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-primary">Iterate</h3>
              <p>Experiment rapidly, test variations, and refine architectures in real-time without lengthy rewrites.</p>
            </div>
            <div className="bg-background border border-primary/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-primary">Collaborate</h3>
              <p>Share visual representations of complex models with teammates and across disciplines for better understanding.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Join Us on This Journey</h2>
          <p className="mb-4">
            We&apos;re still early in our mission to transform how AI research is conducted and implemented. As researchers ourselves, we&apos;re building the tool we always wished we had—and we&apos;re excited to put it in the hands of the global research community.
          </p>
          <p className="mb-4">
            Whether you&apos;re a seasoned AI researcher, an engineer implementing models, or an organization looking to accelerate your AI development, we invite you to join us on this journey to make AI development more visual, intuitive, and accessible.
          </p>
        </div>
      </div>
    </div>
  );
} 