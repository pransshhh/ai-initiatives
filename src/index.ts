import express from "express";
import { env } from "./env.js";
import submissionsRouter from "./routes/submissions.js";

const app = express();

app.use(express.json());

app.use("/api/submissions", submissionsRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
