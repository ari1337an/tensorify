import { Router } from "express";
import { generateCode } from "@/server/controllers/executeController";

const router = Router();

router.post("/", generateCode); // POST /api/users

export default router;
