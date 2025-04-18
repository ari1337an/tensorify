import * as React from 'react';
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-12 md:py-16 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">Tensorify</span>
            </Link>
            <p className="text-muted-foreground mt-2 text-sm">
              Connect different parts of AI systems and get runnable code instantly. Accelerate your AI research and development.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium mb-1">Product</h3>
            <Link href="#features" className="text-sm text-muted-foreground hover:underline">Features</Link>
            <Link href="#for-whom" className="text-sm text-muted-foreground hover:underline">For Whom</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:underline">Pricing</Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:underline">Documentation</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium mb-1">Company</h3>
            <Link href="/about" className="text-sm text-muted-foreground hover:underline">About</Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:underline">Blog</Link>
            <Link href="/careers" className="text-sm text-muted-foreground hover:underline">Careers</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium mb-1">Legal</h3>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:underline">Cookie Policy</Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t pt-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Tensorify. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="https://github.com/tensorify" className="text-muted-foreground hover:text-foreground">
              <GithubIcon className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://www.linkedin.com/company/tensorify-io/" className="text-muted-foreground hover:text-foreground">
              <LinkedinIcon className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
} 