import { formatPythonCodeWithBlack } from "./with-black";

/**
 * Formats a Python code string to improve readability.
 * @param code - The unformatted Python code as a string.
 * @param maxLineLength - The maximum length of a line before it is broken into multiple lines.
 * @param indentLevel - The current indentation level (used in recursive calls).
 * @returns The formatted Python code.
 *
 * @version 0.0.3
 */
export function formatPythonCode(
  code: string,
  withBlack: boolean = true,
  maxLineLength: number = 80,
  indentLevel: number = 0
): string {
  // const indentSize = 4; // Number of spaces per indentation level
  // let formattedCode = "";
  // let index = 0;
  // let inString = false;
  // let stringChar = "";
  // let currentIndentLevel = indentLevel;
  // let newLine = true;

  // // Helper function to get current indentation
  // const getIndent = (level: number = currentIndentLevel) =>
  //   " ".repeat(level * indentSize);

  // while (index < code.length) {
  //   let char = code[index];

  //   // Handle new lines and indentation
  //   if (char === "\n") {
  //     formattedCode += char;
  //     newLine = true;
  //     index++;
  //     continue;
  //   }

  //   // Skip whitespace at the start of a new line
  //   if (newLine) {
  //     while (
  //       index < code.length &&
  //       (code[index] === " " || code[index] === "\t")
  //     ) {
  //       index++;
  //     }
  //     if (index >= code.length) break;
  //     char = code[index];

  //     // Check for dedent keywords
  //     const remainingCode = code.substring(index).trimStart();
  //     const dedentKeywords = ["else", "elif", "except", "finally"];
  //     const dedentRegex = new RegExp(`^(${dedentKeywords.join("|")})(\\s|:)`);

  //     if (dedentRegex.test(remainingCode)) {
  //       currentIndentLevel = Math.max(indentLevel, currentIndentLevel - 1);
  //     }

  //     formattedCode += getIndent();
  //     newLine = false;
  //   }

  //   // Handle strings
  //   if (inString) {
  //     formattedCode += char;
  //     if (char === "\\") {
  //       index++;
  //       if (index < code.length) {
  //         formattedCode += code[index];
  //         index++;
  //       }
  //       continue;
  //     } else if (char === stringChar) {
  //       inString = false;
  //       stringChar = "";
  //     }
  //     index++;
  //     continue;
  //   } else if (char === '"' || char === "'") {
  //     inString = true;
  //     stringChar = char;
  //     formattedCode += char;
  //     index++;
  //     continue;
  //   }

  //   // Handle comments
  //   if (char === "#") {
  //     // Add the rest of the line to the formatted code
  //     const endOfLine = code.indexOf("\n", index);
  //     if (endOfLine === -1) {
  //       formattedCode += code.substring(index);
  //       break;
  //     } else {
  //       formattedCode += code.substring(index, endOfLine + 1);
  //       index = endOfLine + 1;
  //       newLine = true;
  //       continue;
  //     }
  //   }

  //   // Handle colons indicating code blocks
  //   if (char === ":") {
  //     formattedCode += char;
  //     index++;
  //     // Increase indentation level for the new block
  //     currentIndentLevel++;
  //     continue;
  //   }

  //   // Copy other characters
  //   formattedCode += char;
  //   index++;
  // }

  // if (withBlack) return formatPythonCodeWithBlack(formattedCode.trim());
  // else return formattedCode.trim();
  return formatPythonCodeWithBlack(code.trim());
}
