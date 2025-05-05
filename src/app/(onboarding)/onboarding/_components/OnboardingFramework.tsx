import { Button } from "@/app/_components/ui/button";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Label } from "@/app/_components/ui/label";
import { useState } from "react";

interface OnboardingFrameworkProps {
  onNext: () => void;
}

export function OnboardingFramework({ onNext }: OnboardingFrameworkProps) {
  const [selectedFrameworks, setSelectedFrameworks] = useState<Set<string>>(
    new Set()
  );
  const [otherFramework, setOtherFramework] = useState<string>("");

  const frameworks = [
    { id: "pytorch", label: "PyTorch" },
    { id: "tensorflow", label: "TensorFlow/Keras" },
    { id: "jax", label: "JAX" },
    { id: "huggingface", label: "Hugging Face (Transformers)" },
    { id: "other", label: "Other" },
  ];

  const handleFrameworkToggle = (frameworkId: string) => {
    const newSelected = new Set(selectedFrameworks);
    if (newSelected.has(frameworkId)) {
      newSelected.delete(frameworkId);
      if (frameworkId === "other") {
        setOtherFramework("");
      }
    } else {
      newSelected.add(frameworkId);
    }
    setSelectedFrameworks(newSelected);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-sm text-muted-foreground mb-4">
        Select all frameworks that you use
      </div>
      <div className="space-y-4">
        {frameworks.map((framework) => (
          <div key={framework.id} className="flex items-center space-x-3">
            <Checkbox
              id={framework.id}
              checked={selectedFrameworks.has(framework.id)}
              onCheckedChange={() => handleFrameworkToggle(framework.id)}
            />
            <Label
              htmlFor={framework.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {framework.label}
            </Label>
            {framework.id === "other" && selectedFrameworks.has("other") && (
              <input
                type="text"
                placeholder="Please specify"
                className="ml-2 px-3 py-1 rounded-md border border-input bg-background"
                value={otherFramework}
                onChange={(e) => setOtherFramework(e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={
          selectedFrameworks.size === 0 ||
          (selectedFrameworks.has("other") && !otherFramework)
        }
        className="w-full mt-6"
      >
        Continue
      </Button>
    </div>
  );
}
