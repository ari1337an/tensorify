import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initServer } from "@ts-rest/express";
import { createExpressEndpoints } from "@ts-rest/express";
import { contracts, actions } from "./v1";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();

const router = s.router(contracts, actions);

createExpressEndpoints(contracts, router, app);

const port = process.env.port || 3001;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
