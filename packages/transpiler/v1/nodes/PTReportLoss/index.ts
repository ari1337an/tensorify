// src/nodes/PTReportLoss.ts

import INode, { NodeType } from "@/interfaces/INode";

export default class PTReportLoss implements INode<PTReportLoss["settings"]> {
  name: string = "PyTorch Report Loss";

  translationTemplate: string = `
if {report_condition}:
{report_code}
{reset_code}
`;

  inputLines: number = 0;
  outputLinesCount: number = 0;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.REPORT;

  settings: {
    reportCondition: string; // The condition to check, e.g., "batch_no % 1000 == 999"
    reportStatements: string; // The code to execute when the condition is true
    resetRunningLoss: boolean; // Whether to reset running_loss to 0 after reporting
  } = {
    reportCondition: "",
    reportStatements: "",
    resetRunningLoss: false,
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    // Ensure that reportCondition and reportStatements are provided
    if (!settings.reportCondition) {
      throw new Error("Report condition must be provided in settings.");
    }
    if (!settings.reportStatements) {
      throw new Error("Report statements must be provided in settings.");
    }

    // Indent the report statements
    const indentedReportCode = this.indentCode(settings.reportStatements, 1);

    // Prepare reset code if needed
    let resetCode = "";
    if (settings.resetRunningLoss === false) {
    }else{
      resetCode = this.indentCode("running_loss = 0.", 1);
    }

    // Generate the code
    return this.translationTemplate
      .replace("{report_condition}", settings.reportCondition)
      .replace("{report_code}", indentedReportCode)
      .replace("{reset_code}", resetCode);
  }

  // Helper method to indent code by a given number of indent levels
  private indentCode(code: string, indentLevels: number): string {
    const indent = "    ".repeat(indentLevels); // 4 spaces per indent level
    return code
      .split("\n")
      .map((line) => (line.trim().length > 0 ? indent + line : line))
      .join("\n");
  }
}
