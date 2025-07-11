"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deletePluginAction } from "@/server/actions/plugin-actions";

interface DeletePluginButtonProps {
  slug: string;
  pluginName: string;
}

export function DeletePluginButton({
  slug,
  pluginName,
}: DeletePluginButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== pluginName) {
      toast.error("Please type the plugin name correctly to confirm deletion");
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deletePluginAction(slug);

      if (result.error) {
        toast.error(result.error.message);
        setOpen(false);
        setIsDeleting(false);
        return;
      }

      toast.success("Plugin deleted successfully");
      setOpen(false);
      // Redirect to dashboard after successful deletion
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete plugin");
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmText("");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    toast.error("Pasting is not allowed. Please type the plugin name.");
  };

  // Determine if delete button should be disabled
  const isDeleteDisabled = isDeleting || confirmText !== pluginName;

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="flex items-center gap-2 transition-all duration-300"
        onClick={() => setOpen(true)}
        data-testid="delete-plugin-button"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete Plugin</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] ring-4 ring-purple-500/30 border border-border/40 bg-card/40 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 p-6 sm:p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <DialogHeader className="pb-4">
            <div className="mx-auto rounded-full bg-destructive/10 p-3 mb-5 ring-1 ring-destructive/30 shadow-[0_4px_12px_-4px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
              Delete Plugin
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {pluginName}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-700/10 border border-destructive/40 rounded-xl p-4 my-4 shadow-inner">
            <p className="text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-700" />
              <span>
                This action will permanently delete your plugin. This action
                cannot be undone.
              </span>
            </p>
          </div>

          <div className="space-y-3 pt-2 pb-4">
            <div className="text-sm font-medium">
              Please type <span className="font-bold" data-testid="delete-plugin-confirm-text">{pluginName}</span> to
              confirm deletion:
            </div>
            <div className="relative group">
              <input
                data-testid="delete-plugin-confirm-input"
                type="text"
                value={confirmText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmText(e.target.value)
                }
                onPaste={handlePaste}
                placeholder="Type plugin name here"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors duration-300 focus:ring-2 focus:ring-destructive/20 focus:border-destructive/30 focus:outline-none"
                autoComplete="off"
                spellCheck="false"
              />
              <div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{
                  width: `${(confirmText.length / pluginName.length) * 100}%`,
                  maxWidth: "100%",
                }}
              />
            </div>
            {confirmText && confirmText !== pluginName && (
              <p className="text-xs text-red-600 font-medium animate-pulse">
                Plugin name doesn&apos;t match.
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenChange(false);
              }}
              disabled={isDeleting}
              className={`z-10 relative w-full sm:w-auto transition-all duration-300 ${
                isDeleting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-muted/50 hover:cursor-pointer hover:border-border/80 active:scale-95"
              }`}
            >
              Cancel
            </Button>

            <div
              className={`relative z-10 ${
                isDeleteDisabled ? "cursor-not-allowed" : ""
              }`}
              style={{ cursor: isDeleteDisabled ? "not-allowed" : "pointer" }}
            >
              <Button
                data-testid="delete-plugin-button-confirm"
                variant="destructive"
                onClick={isDeleteDisabled ? undefined : handleDelete}
                disabled={isDeleteDisabled}
                className={`z-10 relative w-full sm:w-auto transition-all duration-300 !cursor-inherit ${
                  isDeleting ? "opacity-80" : ""
                } ${
                  confirmText !== pluginName
                    ? "opacity-50"
                    : "shadow-[0_2px_10px_-2px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_15px_-2px_rgba(239,68,68,0.4)] hover:cursor-pointer active:scale-95"
                }`}
                style={{ cursor: isDeleteDisabled ? "not-allowed" : "pointer" }}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-background/40 border-t-background/90 rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Plugin</span>
                  </div>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
