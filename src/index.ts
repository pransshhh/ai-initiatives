import cors from "cors";
import express from "express";
import { env } from "./env.js";
import submissionsRouter from "./routes/submissions.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://admin.ai-coe.net",
      "https://ai-coe.net",
      "https://www.ai-coe.net",
      "https://d1ackomvu4lvhs.cloudfront.net",
      "https://d1skojkc9916k4.cloudfront.net"
    ]
  })
);
app.use("/api/submissions", submissionsRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
