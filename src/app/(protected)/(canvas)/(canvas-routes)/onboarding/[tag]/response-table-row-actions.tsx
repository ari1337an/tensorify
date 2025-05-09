"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { FileText, Download, Clipboard, Trash } from "lucide-react";

import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { toast } from "sonner";
import { OnboardingResponse } from "./response-columns";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onViewDetails: (response: OnboardingResponse) => void;
}

export function DataTableRowActions<TData>({
  row,
  onViewDetails,
}: DataTableRowActionsProps<TData>) {
  const response = row.original as OnboardingResponse;

  const copyToClipboard = () => {
    const responseText = `
User: ${response.userName}
Email: ${response.email}
Date: ${new Date(response.createdAt).toLocaleString()}
Intent: ${response.intentTag || "Not specified"}
Organization Size: ${response.orgSizeBracket || "Not specified"}

Answers:
${response.answers
  .map((answer) => {
    let answerText = `- ${answer.questionTitle}: `;

    // Add selected options if they exist
    if (answer.selectedOptions && answer.selectedOptions.length > 0) {
      answerText += answer.selectedOptions
        .map((option) => option.optionLabel)
        .join(", ");
    }

    // Add custom value if it exists
    if (answer.customValue) {
      // If there were also selected options, add a separator
      if (answer.selectedOptions && answer.selectedOptions.length > 0) {
        answerText += "; ";
      }
      answerText += `Other: "${answer.customValue}"`;
    }

    return answerText;
  })
  .join("\n")}
`.trim();

    navigator.clipboard.writeText(responseText).then(() => {
      toast.success("Response copied to clipboard");
    });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(response, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `response-${response.id}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onViewDetails(response)}>
          <FileText className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          <Clipboard className="mr-2 h-4 w-4" />
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (response.isDummy) {
              toast.success("Test response deleted");
            } else {
              toast.error("Only test responses can be deleted");
            }
          }}
          disabled={!response.isDummy}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
