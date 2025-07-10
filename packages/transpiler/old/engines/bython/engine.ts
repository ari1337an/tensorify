/**
 * Converts Bython code (Python code with braces) into standard Python code with proper indentation.
 *
 * Typescript equivalent of ""https://github.com/mathialo/bython""
 *
 * @param bythonCode - The input code in Bython syntax.
 * @returns The equivalent code in standard Python syntax.
 * 
 * @version 0.0.1
 */
export function convertBythonToPython(bythonCode: string): string {
  const lines = bythonCode.split("\n");
  const pythonLines: string[] = [];
  const indentationStack: number[] = [];
  let currentIndentation = 0;
  const indentChar = "    "; // 4 spaces per indentation level

  // Regex patterns to handle comments and strings
  const commentPattern = /#.*$/;

  // Function to count the number of opening and closing braces in a line
  function countBraces(line: string): { open: number; close: number } {
    let open = 0;
    let close = 0;
    let inString = false;
    let stringChar = "";
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // Handle escape characters
      if (char === "\\" && !escaped) {
        escaped = true;
        continue;
      }

      if ((char === '"' || char === "'") && !inString && !escaped) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar && inString && !escaped) {
        inString = false;
        stringChar = "";
      } else if (!inString && !escaped) {
        if (char === "{") {
          open++;
        } else if (char === "}") {
          close++;
        }
      }

      // Reset escaped flag
      if (escaped && char !== "\\") {
        escaped = false;
      } else if (escaped && char === "\\") {
        escaped = false; // Escaped backslash
      }
    }
    return { open, close };
  }

  for (let rawLine of lines) {
    let line = rawLine;
    // Preserve original line for colon placement
    let originalLine = line;
    // Remove leading and trailing whitespace
    line = line.trim();

    // Skip empty lines
    if (line === "") {
      pythonLines.push("");
      continue;
    }

    // Handle comments
    const commentMatch = line.match(commentPattern);
    let comment = "";
    if (commentMatch) {
      comment = commentMatch[0];
      line = line.replace(commentPattern, "").trim();
      originalLine = originalLine.replace(commentPattern, "").trim();
    }

    // Remove semicolons at the end of the line
    line = line.replace(/;\s*$/, "");

    // Count braces
    const { open, close } = countBraces(line);

    // Determine if a colon is needed
    let needsColon = false;
    if (open > 0) {
      needsColon = true;
    }

    // Remove braces from line
    line = line.replace(/[\{\}]/g, "");

    // Add colon if needed
    if (needsColon && !line.endsWith(":")) {
      line += ":";
    }

    // Handle indentation decrease
    for (let i = 0; i < close; i++) {
      if (indentationStack.length > 0) {
        indentationStack.pop();
        currentIndentation--;
      } else {
        // Mismatched closing brace
        throw new Error("Mismatched closing brace detected.");
      }
    }

    // Add the line with current indentation
    pythonLines.push(
      indentChar.repeat(currentIndentation) +
        line +
        (comment ? " " + comment : "")
    );

    // Handle indentation increase
    for (let i = 0; i < open; i++) {
      indentationStack.push(currentIndentation);
      currentIndentation++;
    }
  }

  // Check for any unmatched opening braces
  if (indentationStack.length > 0) {
    throw new Error("Unmatched opening brace(s) detected.");
  }

  return pythonLines.join("\n");
}
