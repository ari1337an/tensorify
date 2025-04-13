'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { SectionWrapper } from "./section-wrapper";
import { Button } from "./ui/button";
import { MailIcon, HelpCircleIcon } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "What exactly is Tensorify?",
      answer:
        "Tensorify is a node-based AI code generator that lets you visually design your AI architecture by connecting nodes representing different components. You can then automatically generate production-ready code for PyTorch with a single click."
    },
    {
      question: "How is this different from existing AI frameworks?",
      answer:
        "Unlike traditional frameworks where you write code first, Tensorify focuses on visual design and abstraction. You focus on the architecture and connections between components, and Tensorify handles the implementation details. This dramatically reduces development time and errors while making it easier to experiment with different designs."
    },
    {
      question: "Do I need to know Python or TensorFlow/PyTorch to use Tensorify?",
      answer:
        "While some familiarity with AI concepts is helpful, Tensorify drastically reduces the amount of code you need to write. You'll focus on architectural decisions rather than implementation details. This makes it more accessible for those new to AI development while still being powerful for experts."
    },
    {
      question: "Can I customize the generated code?",
      answer:
        "Absolutely! Tensorify gives you full access to the generated code. You can use it as a starting point and then customize it further for your specific needs. The visual interface stays synchronized with your code, giving you the best of both worlds."
    },
    {
      question: "Is Tensorify suitable for production use cases?",
      answer:
        "Yes, Tensorify generates production-ready code that follows best practices. It's designed to be part of your workflow from research to deployment, with optimizations built in."
    },
    {
      question: "How does pricing work?",
      answer:
        "Tensorify offers a free tier for individual researchers and developers to get started. For teams and organizations with more advanced needs, we offer Pro and Enterprise plans with additional features like team collaboration, private component libraries, and dedicated support."
    },
    {
      question: "Can I create custom components or nodes?",
      answer:
        "Yes! In addition to the standard library of components, you can create your own custom nodes to encapsulate your research or organization's specific needs. These can be shared across your team to promote code reuse and standardization."
    }
  ];

  return (
    <SectionWrapper id="faq">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
          Common{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-primary bg-[200%_auto] animate-gradient">
            Questions
          </span>
        </h2>
        <p className="max-w-[800px] text-lg sm:text-xl text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
          Everything you need to know about Tensorify and how it can transform your AI workflow
        </p>
      </div>
      
      <div className="mx-auto max-w-3xl animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="group relative border border-primary/10 hover:border-primary/30 rounded-2xl px-6 md:px-8 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=open]:border-primary/30 data-[state=open]:shadow-xl overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <AccordionTrigger className="relative text-left text-lg font-medium py-6 hover:no-underline group-hover:text-primary transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <HelpCircleIcon className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors duration-300" />
                  <span>{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="relative text-muted-foreground pb-6 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div className="mt-24 text-center animate-fade-in opacity-0" style={{ animationDelay: '1s' }}>
        <div className="inline-block rounded-2xl bg-gradient-to-br from-primary/5 via-background to-violet-500/5 border border-primary/20 p-6 md:p-8 backdrop-blur-sm">
          <p className="text-xl text-muted-foreground mb-6">
            Still have questions? We&apos;re here to help!
          </p>
          <Button 
            className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6"
            asChild
          >
            <a 
              href="mailto:support@tensorify.io" 
              className="inline-flex items-center gap-2"
            >
              <MailIcon className="h-5 w-5" />
              Contact our support team
            </a>
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
} 