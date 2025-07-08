import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initServer } from "@ts-rest/express";
import { createExpressEndpoints } from "@ts-rest/express";
import { contracts as v1Contracts, actions as v1Actions } from "./v1";
import { contracts as v2Contracts, actions as v2Actions } from "./v2";
import { initContract } from "@ts-rest/core";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();
const c = initContract();

// Create the main contract router with proper versioning
const allContracts = c.router(
  {
    v1: v1Contracts,
    v2: v2Contracts,
  },
  {
    pathPrefix: "/api",
    strictStatusCodes: true,
  }
);

// Create the actions router that matches the contract structure
const allActions = s.router(allContracts, {
  v1: v1Actions,
  v2: v2Actions,
});

createExpressEndpoints(allContracts, allActions, app);

// Add a simple health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 API Server listening at http://localhost:${port}`);
});
