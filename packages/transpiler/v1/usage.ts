import { convertBythonToPython } from "./core/engines/bython/engine";
import { formatPythonCode } from "./core/engines/formatter/engine";
import translateJsonToBython from "./core/engines/translator";
import { Command } from "commander";
import fs from "fs";

export const generateCode = (body: any) => {
  try {
    // Generate the code
    const code = translateJsonToBython(body);
    // let formattedCode = convertBythonToPython(code);
    let formattedCode = formatPythonCode(code, true);

    return formattedCode;
  } catch (error) {
    throw error;
  }
};

// CLI setup
if (require.main === module) {
  const program = new Command();

  program
    .name("transpiler")
    .version("0.0.1")
    .description("Transpile JSON model to formatted Python code")
    .requiredOption("-f, --file <path>", "Path to the input JSON file")
    .showHelpAfterError(true)
    .action(() => {
      const { file } = program.opts();

      let jsonStr;
      try {
        jsonStr = fs.readFileSync(file, "utf-8");
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
        process.exit(1);
      }

      let body;
      try {
        body = JSON.parse(jsonStr);
      } catch (err) {
        console.error("Error parsing JSON:", err);
        process.exit(1);
      }

      try {
        const code = generateCode(body);
        console.log(code);
      } catch (err) {
        console.error("Error generating code:", err);
        process.exit(1);
      }
    });

  program.parse(process.argv);
}
