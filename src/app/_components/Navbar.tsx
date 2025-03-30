import { Menu, History, MessageSquare, Share } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useSidebar } from "./Sidebar";
import { motion } from "framer-motion";

export function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="border-b border-border bg-background h-11 flex">
      {/* Left side - Burger menu & title */}
      <div className="flex items-center gap-2 px-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Always show the breadcrumb */}
        <div className="flex items-center">
          <div className="flex items-center gap-1">
            <span className="font-bold text-primary">AlphaWolf</span>
            <span className="text-muted-foreground">Ventures, Inc.</span>
          </div>
          
          <span className="text-muted-foreground mx-1">/</span>
          
          <div className="flex items-center gap-1">
            <span className="font-semibold">Projects</span>
          </div>
        </div>
      </div>
      
      {/* Spacer that grows/shrinks depending on sidebar state */}
      <div className="flex-1"></div>
      
      {/* Right side - Actions and user button (stays fixed) */}
      <div className="flex items-center gap-2 px-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" title="History">
          <History className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Comments">
          <MessageSquare className="h-4 w-4" />
        </Button>
        
        <Button variant="secondary" size="sm" className="h-8 px-3">
          <Share className="h-4 w-4 mr-1" />
          Share
        </Button>
        
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 hover:ring-primary/30 transition-colors duration-200",
            },
          }}
        />
      </div>
    </nav>
  );
}
