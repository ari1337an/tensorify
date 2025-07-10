import { convertBythonToPython } from "./engines/bython/engine";
import { formatPythonCode } from "./engines/formatter/engine";
import translateJsonToBython from "./engines/translator";

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
