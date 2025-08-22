import React, { useRef } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Textarea } from "@/app/_components/ui/textarea";
import { Variable } from "lucide-react";

// Monaco Editor - dynamically imported to avoid SSR issues
const MonacoEditor = React.lazy(() =>
  import("@monaco-editor/react").then((module) => ({
    default: module.default,
  }))
);

export interface AvailableVariable {
  name: string;
  type: string;
  sourceNode: string;
  sourceNodeId: string;
}

interface IntelligentCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  availableVariables?: AvailableVariable[];
  placeholder?: string;
  height?: string;
  showVariableHelper?: boolean;
  language?: string;
  className?: string;
  customVariablePattern?: string;
  hasValidationErrors?: boolean;
  validationErrorMessage?: string;
}

export function IntelligentCodeEditor({
  value,
  onChange,
  availableVariables = [],
  placeholder = "# Write your Python code here...\n# Use $variable_name to reference upstream variables",
  height = "300px",
  showVariableHelper = true,
  language = "python",
  className = "",
  customVariablePattern,
  hasValidationErrors = false,
  validationErrorMessage = "",
}: IntelligentCodeEditorProps) {
  // Editor ref for Monaco instance
  const editorRef = useRef<any>(null);

  // Insert variable into code
  const insertVariable = (variableName: string) => {
    const newCode = value + `$${variableName}`;
    onChange(newCode);
  };

  const handleCodeChange = (newValue: string | undefined) => {
    onChange(newValue || "");
  };

  return (
    <div className={className}>
      {/* Available Variables Helper */}
      {showVariableHelper && availableVariables.length > 0 && (
        <div className="mb-4 p-3 bg-muted/30 rounded-md border">
          <Label className="text-xs font-medium mb-2 block">
            Available Variables (click to insert)
          </Label>
          <div className="flex flex-wrap gap-1">
            {availableVariables.map((variable, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => insertVariable(variable.name)}
              >
                <Variable className="h-3 w-3 mr-1" />${variable.name}
                <span className="ml-1 text-muted-foreground">
                  ({variable.type})
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {hasValidationErrors && validationErrorMessage && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-destructive-foreground text-xs font-bold">
                !
              </span>
            </div>
            <Label className="text-xs font-medium text-destructive">
              Validation Error
            </Label>
          </div>
          <p className="text-xs text-destructive mt-1">
            {validationErrorMessage}
          </p>
        </div>
      )}

      {/* Monaco Editor */}
      <div
        className={`border rounded-md overflow-hidden ${hasValidationErrors ? "border-destructive" : ""}`}
      >
        <React.Suspense
          fallback={
            <Textarea
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="min-h-[300px] font-mono text-sm resize-none"
            />
          }
        >
          <MonacoEditor
            height={height}
            language={language}
            value={value}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              theme: "vs-dark",
              automaticLayout: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              parameterHints: { enabled: true },
            }}
            onMount={(editor, monaco) => {
              // Store editor reference
              editorRef.current = editor;

              // Register variable autocomplete provider
              monaco.languages.registerCompletionItemProvider(language, {
                triggerCharacters: ["$"],
                provideCompletionItems: (model, position) => {
                  const word = model.getWordUntilPosition(position);
                  const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                  };

                  // Check if we're after a $ symbol
                  const lineContent = model.getLineContent(position.lineNumber);
                  const charBeforeWord = lineContent.charAt(
                    word.startColumn - 2
                  );

                  if (charBeforeWord === "$") {
                    // Provide variable suggestions
                    const suggestions = availableVariables.map((variable) => ({
                      label: variable.name,
                      kind: monaco.languages.CompletionItemKind.Variable,
                      insertText: variable.name,
                      documentation: `Type: ${variable.type}\nFrom: ${variable.sourceNode || "Class Node"}`,
                      detail: `$${variable.name}`,
                      range: range,
                    }));
                    return { suggestions };
                  }

                  return { suggestions: [] };
                },
              });

              // Register hover provider for variables
              monaco.languages.registerHoverProvider(language, {
                provideHover: (model, position) => {
                  const lineContent = model.getLineContent(position.lineNumber);

                  // Check for both $self.param and $param patterns
                  const patterns = [
                    /\$self\.[a-zA-Z_][a-zA-Z0-9_]*/g,
                    /\$[a-zA-Z_][a-zA-Z0-9_]*/g,
                  ];

                  for (const pattern of patterns) {
                    pattern.lastIndex = 0; // Reset regex state
                    let match;
                    while ((match = pattern.exec(lineContent)) !== null) {
                      const matchStart = match.index + 1; // +1 for 1-based indexing
                      const matchEnd = match.index + match[0].length + 1;

                      if (
                        position.column >= matchStart &&
                        position.column <= matchEnd
                      ) {
                        // Extract variable name (remove $ prefix)
                        const fullVariable = match[0].substring(1);
                        const variable = availableVariables.find(
                          (v) => v.name === fullVariable
                        );
                        if (variable) {
                          return {
                            range: new monaco.Range(
                              position.lineNumber,
                              matchStart,
                              position.lineNumber,
                              matchEnd
                            ),
                            contents: [
                              { value: `**Variable:** ${variable.name}` },
                              { value: `**Type:** ${variable.type}` },
                              {
                                value: `**Source:** ${variable.sourceNode || "Class Node"}`,
                              },
                              {
                                value: `**Node ID:** ${variable.sourceNodeId}`,
                              },
                            ],
                          };
                        }
                      }
                    }
                  }

                  // Check for @classnodeself hover
                  if (lineContent.includes("@classnodeself")) {
                    const classNodeStart =
                      lineContent.indexOf("@classnodeself");
                    const classNodeEnd =
                      classNodeStart + "@classnodeself".length;

                    if (
                      position.column >= classNodeStart + 1 &&
                      position.column <= classNodeEnd + 1
                    ) {
                      return {
                        range: new monaco.Range(
                          position.lineNumber,
                          classNodeStart + 1,
                          position.lineNumber,
                          classNodeEnd + 1
                        ),
                        contents: [
                          {
                            value: `**@classnodeself** decorator`,
                          },
                          {
                            value:
                              "Marks the following self.property assignment as a dynamic class property that will be available in method intellisense.",
                          },
                        ],
                      };
                    }
                  }

                  return null;
                },
              });

              // Add custom token provider for $variable highlighting
              monaco.languages.setMonarchTokensProvider(language, {
                tokenizer: {
                  root: [
                    // Variable references - both self.params and regular params
                    [/\$[a-zA-Z_][a-zA-Z0-9_]*/, "variable.custom"],

                    // Keep existing Python tokens
                    [/#.*$/, "comment"],
                    [/".*?"/, "string"],
                    [/'.*?'/, "string"],
                    [
                      /\b(def|class|if|else|elif|while|for|try|except|finally|with|as|import|from|return|yield|lambda|global|nonlocal|pass|break|continue|raise|assert|del|and|or|not|in|is)\b/,
                      "keyword",
                    ],
                    [/\b(True|False|None)\b/, "constant"],
                    [/\b\d+\.?\d*\b/, "number"],
                    [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],
                  ],
                },
              });

              // Define custom theme with variable highlighting
              monaco.editor.defineTheme("custom-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  {
                    token: "variable.custom",
                    foreground: "#4FC3F7",
                    fontStyle: "bold",
                  }, // Light blue for variables
                  {
                    token: "variable.dynamic",
                    foreground: "#FFA726",
                    fontStyle: "bold",
                  }, // Orange for dynamic parameters
                ],
                colors: {},
              });

              // Apply the custom theme
              monaco.editor.setTheme("custom-dark");

              // Add CSS for @classnodeself highlighting
              if (!document.getElementById("monaco-classnodeself-styles")) {
                const style = document.createElement("style");
                style.id = "monaco-classnodeself-styles";
                style.textContent = `
                          .monaco-classnodeself-decorator {
                            background-color: rgba(255, 167, 38, 0.15) !important;
                            color: #FFA726 !important;
                            font-weight: bold !important;
                            border-radius: 3px !important;
                          }
                          .monaco-classnodeself-assignment {
                            background-color: rgba(255, 167, 38, 0.15) !important;
                            color: #FFA726 !important;
                            font-weight: bold !important;
                            border-radius: 3px !important;
                          }
                        `;
                document.head.appendChild(style);
              }

              // Add custom highlighting for @classnodeself using decorations
              const updateDecorations = () => {
                if (!editorRef.current) return;

                const model = editorRef.current.getModel();
                if (!model) return;

                const decorations: any[] = [];
                const text = model.getValue();
                const lines = text.split("\n");

                lines.forEach((line: string, lineIndex: number) => {
                  // Find @classnodeself patterns
                  const classNodeMatch = line.match(/@classnodeself/g);
                  if (classNodeMatch) {
                    const startIndex = line.indexOf("@classnodeself");
                    if (startIndex !== -1) {
                      decorations.push({
                        range: new monaco.Range(
                          lineIndex + 1,
                          startIndex + 1,
                          lineIndex + 1,
                          startIndex + "@classnodeself".length + 1
                        ),
                        options: {
                          inlineClassName: "monaco-classnodeself-decorator",
                        },
                      });
                    }
                  }

                  // Find self.param assignments that IMMEDIATELY follow @classnodeself
                  const selfParamMatch = line.match(
                    /self\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=/
                  );
                  if (selfParamMatch && lineIndex > 0) {
                    // Check if the IMMEDIATELY previous non-empty line has @classnodeself
                    let foundClassNodeSelf = false;
                    for (
                      let i = lineIndex - 1;
                      i >= Math.max(0, lineIndex - 3);
                      i--
                    ) {
                      const prevLine = lines[i].trim();
                      if (prevLine === "") {
                        // Skip empty lines
                        continue;
                      }
                      if (prevLine === "@classnodeself") {
                        foundClassNodeSelf = true;
                        break;
                      } else {
                        // If we encounter any non-empty, non-@classnodeself line, stop
                        break;
                      }
                    }

                    if (foundClassNodeSelf) {
                      const startIndex = line.indexOf(selfParamMatch[0]);
                      const endIndex =
                        startIndex + selfParamMatch[0].indexOf("=");
                      decorations.push({
                        range: new monaco.Range(
                          lineIndex + 1,
                          startIndex + 1,
                          lineIndex + 1,
                          endIndex + 1
                        ),
                        options: {
                          inlineClassName: "monaco-classnodeself-assignment",
                        },
                      });
                    }
                  }
                });

                editorRef.current.deltaDecorations([], decorations);
              };

              // Update decorations when content changes
              editorRef.current.onDidChangeModelContent(() => {
                updateDecorations();
              });

              // Initial decoration update
              updateDecorations();
            }}
          />
        </React.Suspense>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        <p>
          • Use <code>$variable_name</code> syntax to reference upstream
          variables
        </p>
        <p>
          • Use <code>@classnodeself</code> decorator to create dynamic class
          properties (constructor only):
          <br />
          &nbsp;&nbsp;<code>@classnodeself</code>
          <br />
          &nbsp;&nbsp;<code>self.property_name = value</code>
        </p>
        <p>
          • Code completion triggered automatically when typing <code>$</code>
        </p>
        <p>• Hover over variables for type information</p>
      </div>
    </div>
  );
}
