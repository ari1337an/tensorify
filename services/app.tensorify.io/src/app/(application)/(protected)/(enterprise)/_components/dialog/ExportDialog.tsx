import { useState, useEffect } from "react";
import { Check, Copy, Terminal, FileCode } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-python";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { cn } from "@/app/_lib/utils";
import styles from "./ExportDialog.module.css";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes?: any[];
  edges?: any[];
}

interface Artifact {
  id: string;
  endNodeId: string;
  label: string;
  code: string;
  path: string[];
}

const loadingSteps = [
  "Calculating Node Branches of Workflow",
  "Checking for variable scope mismatches",
  "Preparing & Executing Plugins",
  "Fetching final results from Server",
];

export function ExportDialog({
  isOpen,
  onClose,
  nodes,
  edges,
}: ExportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null
  );
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Progress and step animation
  useEffect(() => {
    if (!isLoading) return;

    // Reset states when loading starts
    setProgress(0);
    setCurrentStep(0);

    const progressPerStep = 100 / loadingSteps.length;
    const stepDuration = 2000; // 2 seconds per step
    const totalDuration = stepDuration * loadingSteps.length;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentStepIndex = Math.min(
        Math.floor(elapsed / stepDuration),
        loadingSteps.length - 1
      );

      setCurrentStep(currentStepIndex);
      setProgress(
        Math.min(
          (currentStepIndex +
            (elapsed >= (currentStepIndex + 1) * stepDuration ? 1 : 0)) *
            progressPerStep,
          100
        )
      );

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
      }
    }, 16); // ~60fps

    return () => {
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  // Typing effect for loading messages
  useEffect(() => {
    if (isLoading && currentStep < loadingSteps.length) {
      const text = loadingSteps[currentStep];
      let index = 0;

      const typingInterval = setInterval(() => {
        if (index <= text.length) {
          setTypedText(text.slice(0, index));
          index++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [isLoading, currentStep]);

  // Highlight code when it changes
  useEffect(() => {
    if (selectedArtifact && !isLoading) {
      Prism.highlightAll();
    }
  }, [selectedArtifact, isLoading]);

  // API call to export workflow
  useEffect(() => {
    if (isOpen && !artifacts.length && nodes && edges) {
      setIsLoading(true);
      setError(null);
      setSelectedArtifact(null);

      const exportWorkflow = async () => {
        try {
          console.log("Exporting workflow with:", { nodes, edges });
          // Get the correct API base URL based on environment
          const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api";

          const exportUrl = `${apiBaseUrl}/v1/export`;
          console.log("Making request to:", exportUrl);
          console.log("Window location:", window.location.href);
          console.log("Hostname detected:", window.location.hostname);

          const response = await fetch(exportUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ nodes, edges }),
          });

          console.log("Export response status:", response.status);

          if (!response.ok) {
            const errorData = await response.text();
            console.error("Error response:", errorData);
            throw new Error(
              `Export failed: ${response.status} ${response.statusText}`
            );
          }

          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          console.log("Response content-type:", contentType);

          if (!contentType || !contentType.includes("application/json")) {
            const htmlData = await response.text();
            console.error(
              "Received HTML instead of JSON:",
              htmlData.substring(0, 200)
            );
            throw new Error(
              "Server returned HTML instead of JSON. Check if the API endpoint is correctly configured."
            );
          }

          const data = await response.json();
          console.log("Export response data:", data);

          if (data.artifacts) {
            const artifactsList = Object.entries(data.artifacts).map(
              ([endNodeId, code]) => ({
                id: crypto.randomUUID(),
                endNodeId,
                label: `Artifact: ${endNodeId}`,
                code: code as string,
                path: data.paths?.[endNodeId] || [],
              })
            );

            setArtifacts(artifactsList);
            if (artifactsList.length > 0) {
              setSelectedArtifact(artifactsList[0]);
            }
          }
        } catch (err: any) {
          console.error("Export failed:", err);

          let errorMessage = "Failed to export workflow";
          if (err.message) {
            errorMessage = err.message;
          }

          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

      // Start export immediately
      exportWorkflow();
    }
  }, [isOpen, nodes, edges, artifacts.length]);

  const handleCopy = async () => {
    if (selectedArtifact) {
      await navigator.clipboard.writeText(selectedArtifact.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setArtifacts([]);
    setSelectedArtifact(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Export Workflow
          </DialogTitle>
          <DialogDescription>
            Select an artifact to view the generated code for that execution
            path.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="grid grid-rows-[1fr_auto] gap-8 min-h-[450px] rounded-lg p-8">
              {/* Top section with spinner */}
              <div className="flex items-center justify-center relative">
                <div className="flex flex-col items-center gap-16">
                  {/* Spinner */}
                  <div className="relative">
                    <div className="absolute inset-0 h-[120px] w-[120px] bg-primary/20 rounded-full animate-ping" />
                    <div className="relative h-[120px] w-[120px] rounded-full border-4 border-primary border-dashed animate-spin" />
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-md space-y-6">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                      <div
                        className="h-full bg-gradient-to-r from-primary/40 to-primary transition-all duration-500 ease-in-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom section with text and steps */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-lg font-medium min-h-[28px] flex items-center justify-center">
                  <span className="inline-block min-w-0 overflow-hidden whitespace-nowrap border-r-2 border-primary animate-typing">
                    {typedText}
                  </span>
                </div>
                <div className="flex gap-2 items-center justify-center">
                  {loadingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-2 w-2 rounded-full transition-all duration-300",
                        index === currentStep
                          ? "bg-primary w-4"
                          : index < currentStep
                            ? "bg-primary/60"
                            : "bg-muted-foreground/20"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[450px]">
              <div className="text-center space-y-2">
                <div className="text-destructive text-lg">Export Failed</div>
                <div className="text-muted-foreground">{error}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[250px_1fr] gap-4 h-[70vh]">
              {/* Artifacts List */}
              <div className="border rounded-lg p-4 overflow-y-auto">
                <h3 className="font-medium mb-3">Artifacts (Branch Paths)</h3>
                <div className="space-y-2">
                  {artifacts.map((artifact) => (
                    <button
                      key={artifact.id}
                      onClick={() => setSelectedArtifact(artifact)}
                      className={cn(
                        "w-full text-left p-3 rounded-md transition-colors",
                        selectedArtifact?.id === artifact.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium text-sm truncate">
                            {artifact.label}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {artifact.path.length} nodes
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Display */}
              {selectedArtifact ? (
                <div className="relative group">
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                    <div
                      className={cn(
                        "text-xs text-muted-foreground opacity-0 transition-opacity duration-200",
                        isCopied && "opacity-100"
                      )}
                    >
                      Copied!
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopy}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="relative rounded-lg border bg-[#1a1a1a] overflow-hidden h-full">
                    <div
                      className={cn(
                        "px-4 py-4 h-full overflow-auto",
                        styles.codeContainer
                      )}
                    >
                      <pre className={cn("!bg-transparent !m-0", styles.code)}>
                        <code className="language-python">
                          {selectedArtifact.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center border rounded-lg">
                  <div className="text-muted-foreground">
                    Select an artifact to view its code
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
