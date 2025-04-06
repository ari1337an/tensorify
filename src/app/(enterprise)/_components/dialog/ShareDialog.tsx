import { useState } from "react";
import { Check, Copy, LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ isOpen, onClose }: ShareDialogProps) {
  const shareLink = "https://app.tensorify.io/share/1234";
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Share Workflow
          </DialogTitle>
          <DialogDescription>
            Share your workflow with external viewers
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <div className="space-y-6 py-4">
            {/* Share link with copy button */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Share link (view only)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input value={shareLink} readOnly className="pr-24" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={handleCopy}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
