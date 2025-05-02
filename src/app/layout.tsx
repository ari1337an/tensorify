import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Tensorify.io - AI Development Platform",
    template: "%s | Tensorify.io"
  },
  description: "Modern AI development platform for researchers and engineers. Design your model pipeline visually and generate production-ready code instantly.",
  keywords: "AI platform, visual AI development, PyTorch, model architecture, code generation, neural networks, machine learning",
  authors: [
    { name: "Tensorify Team", url: "https://tensorify.io" }
  ],
  creator: "Tensorify.io",
  publisher: "Tensorify.io",
  metadataBase: new URL("https://tensorify.io"),
  alternates: {
    canonical: "https://tensorify.io/",
  },
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon-16x16.png?v=2",
    apple: "/apple-touch-icon.png?v=2",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png?v=2",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png?v=2",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: "/apple-touch-icon.png?v=2",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tensorify.io",
    siteName: "Tensorify.io",
    title: "Tensorify.io - AI Development Platform",
    description: "Modern AI development platform for researchers and engineers. Design your model pipeline visually and generate production-ready code instantly.",
    images: [
      {
        url: "https://tensorify.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tensorify.io - Visual AI Development Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tensorify.io - AI Development Platform",
    description: "Modern AI development platform for researchers and engineers. Design your model pipeline visually and generate production-ready code instantly.",
    images: ["https://tensorify.io/twitter-image.png"],
    creator: "@tensorify",
    site: "@tensorify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "verification_token",
    yandex: "verification_token",
    other: {
      me: ["mailto:info@tensorify.io", "https://tensorify.io"],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="hide-scrollbar">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="Ey1D/Da5BY/S4h/iJ/S4oQ"
          async
        ></script>
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://tensorify.io/#website",
              "url": "https://tensorify.io",
              "name": "Tensorify.io",
              "description": "Modern AI development platform for researchers and engineers. Design your model pipeline visually and generate production-ready code instantly.",
              "publisher": {
                "@id": "https://tensorify.io/#organization"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://tensorify.io/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://tensorify.io/#organization",
              "name": "Tensorify.io",
              "url": "https://tensorify.io",
              "logo": "https://tensorify.io/tensorify-logo-only.svg",
              "sameAs": [
                "https://twitter.com/tensorify",
                "https://github.com/tensorify",
                "https://www.linkedin.com/company/tensorify-io/"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-800-123-4567",
                "contactType": "customer service",
                "email": "support@tensorify.io",
                "areaServed": "Worldwide"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 AI Street",
                "addressLocality": "San Francisco",
                "addressRegion": "CA",
                "postalCode": "94107",
                "addressCountry": "US"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative overscroll-none`}
      >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <div className="text-foreground min-h-screen flex flex-col">
          <Header />
          {/* Add padding-top to match header height */}
          <main className="flex-1 pt-16 md:pt-20">
            {children}
          </main>
          <Footer />
          <NewsletterSignup />
        </div>
      </ThemeProvider>
    </body>
    </html>
  );
}
