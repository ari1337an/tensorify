"use client";
import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { useNodeValidation } from "../hooks/useNodeValidation";

export default function ValidationAlert() {
  const { currentRouteValidation, isValid } = useNodeValidation();

  if (isValid && !currentRouteValidation.hasMultipleStartNodes) {
    return null;
  }

  // Priority order: missing start node (highest), multiple start nodes, missing end node (lowest)
  const getFirstError = () => {
    if (!currentRouteValidation.hasStartNode) {
      return {
        type: "missing-start",
        icon: XCircle,
        bgColor: "bg-red-50",
        borderColor: "border-red-100",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
        textColor: "text-red-700",
        title: "Missing Start Node",
        message:
          "Every workflow requires a start node to define the entry point. Add one to begin building your workflow.",
      };
    }

    if (currentRouteValidation.hasMultipleStartNodes) {
      return {
        type: "multiple-start",
        icon: AlertTriangle,
        bgColor: "bg-amber-50",
        borderColor: "border-amber-100",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
        textColor: "text-amber-800",
        subTextColor: "text-amber-700",
        title: "Multiple Start Nodes",
        message: `Found ${currentRouteValidation.startNodeCount} start nodes. Workflows can only have one start node per route.`,
        subMessage: "Remove extra start nodes to resolve this issue.",
      };
    }

    // TODO: bring this back at export button click
    // if (!currentRouteValidation.hasEndNode) {
    //   return {
    //     type: 'missing-end',
    //     icon: AlertTriangle,
    //     bgColor: 'bg-orange-50',
    //     borderColor: 'border-orange-100',
    //     iconColor: 'text-orange-600',
    //     titleColor: 'text-orange-900',
    //     textColor: 'text-orange-800',
    //     subTextColor: 'text-orange-700',
    //     title: 'Missing End Node',
    //     message: 'Add at least one end node to properly terminate your workflow and mark completion points.',
    //     subMessage: 'End nodes help define clear workflow outcomes.'
    //   };
    // }

    return null;
  };

  const error = getFirstError();

  if (!error) {
    return null;
  }

  const Icon = error.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4">
      <div
        className={`flex items-start gap-3 p-4 ${error.bgColor} rounded-lg border ${error.borderColor}`}
      >
        <Icon className={`h-5 w-5 ${error.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${error.titleColor} text-sm`}>
            {error.title}
          </h4>
          <p className={`${error.textColor} text-sm mt-1 leading-relaxed`}>
            {error.message}
          </p>
          {error.subMessage && (
            <p className={`${error.subTextColor} text-xs mt-2`}>
              {error.subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
