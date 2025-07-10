// nodes/PTReportLoss.ts
import { BaseNode, LayerSettings, NodeType } from "@tensorify.io/sdk";

interface ReportLossSettings extends LayerSettings {
  reportCondition: string; // The condition to check, e.g., "batch_no % 1000 == 999"
  reportStatements: string; // The code to execute when the condition is true
  resetRunningLoss: boolean; // Whether to reset running_loss to 0 after reporting
}

export default class PTReportLoss extends BaseNode<ReportLossSettings> {
  /** Name of the node */
  public readonly name: string = "PyTorch Report Loss";

  /** Template used for translation */
  public readonly translationTemplate: string = `
if {report_condition}:
{report_code}
{reset_code}
`;

  /** Number of input lines */
  public readonly inputLines: number = 0;

  /** Number of output lines */
  public readonly outputLinesCount: number = 0;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.CUSTOM; // Using CUSTOM for utility nodes

  /** Default settings for PTReportLoss */
  public readonly settings: ReportLossSettings = {
    reportCondition: "",
    reportStatements: "",
    resetRunningLoss: false,
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: ReportLossSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, [
      "reportCondition",
      "reportStatements",
    ]);

    const reportCode = this.indentCode(settings.reportStatements, 1);
    const resetCode = settings.resetRunningLoss
      ? this.indentCode("running_loss = 0.", 1)
      : "";

    return this.translationTemplate
      .replace("{report_condition}", settings.reportCondition)
      .replace("{report_code}", reportCode)
      .replace("{reset_code}", resetCode)
      .trim();
  }
}
