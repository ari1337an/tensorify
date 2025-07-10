import { Router } from "express";
import executeRoutes from "@/server/routes/execute";

const router = Router();

// Register each route
router.use("/execute", executeRoutes);

export default router;
