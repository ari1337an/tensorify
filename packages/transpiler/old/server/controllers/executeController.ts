import { convertBythonToPython } from "@/engines/bython/engine";
import { formatPythonCode } from "@/engines/formatter/engine";
import translateJsonToBython from "@/engines/translator";
import { Request, Response } from "express";

export const generateCode = (req: Request, res: Response) => {
  const body = req.body;

  try {
    // Generate the code
    const code = translateJsonToBython(body);
    // let formattedCode = convertBythonToPython(code);
    let formattedCode = formatPythonCode(code, true);

    // Send success response with generated code
    res.json({ success: true, response: formattedCode });
  } catch (error) {
    // Send error response with error message
    res.json({ success: false, response: (error as Error).message });
  }
};
