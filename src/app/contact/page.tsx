import { Metadata, Viewport } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Tensorify team for support, feedback, or partnership inquiries.",
  openGraph: {
    title: "Contact Tensorify.io",
    description: "Get in touch with the Tensorify team for support, feedback, or partnership inquiries.",
    type: "website",
  },
};

export default function ContactPage() {
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
                "name": "Contact",
                "item": "https://tensorify.io/contact"
              }
            ]
          })
        }}
      />
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Have questions or feedback? We&apos;d love to hear from you. Use the form below or reach out directly.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input 
                  id="name" 
                  placeholder="Your Name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <textarea 
                  id="message" 
                  placeholder="Your message"
                  className="w-full min-h-[120px] p-2 border rounded-md bg-background"
                />
              </div>
              
              <Button className="w-full">Send Message</Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This is a placeholder form. Functionality will be implemented later.
              </p>
            </form>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">support@tensorify.io</p>
              </div>
              
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-muted-foreground">
                  123 AI Street<br />
                  San Francisco, CA 94107<br />
                  United States
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Social Media</h3>
                <div className="flex gap-4 mt-2">
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Twitter
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    LinkedIn
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 