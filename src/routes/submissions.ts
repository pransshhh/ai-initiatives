import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";
import { z } from "zod/v4";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../db.js";
import { env } from "../env.js";

const router: Router = createRouter();

const submissionSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  company: z.string().min(1),
  project: z.string().min(1),
  description: z.string().min(1),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(30).default(10),
  cursor: z.string().optional(),
  search: z.string().optional(),
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: z.prettifyError(parsed.error) });
    return;
  }

  const { name, email, company, project, description } = parsed.data;

  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  try {
    await docClient.send(
      new PutCommand({
        TableName: env.DYNAMODB_TABLE,
        Item: {
          id,
          partition: "all",
          name: name.toLowerCase(),
          email,
          company,
          project,
          description,
          created_at,
        },
      })
    );

    res.status(201).json({ message: "Submission received.", id, created_at });
  } catch (err: unknown) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: z.prettifyError(parsed.error) });
    return;
  }

  const { limit, cursor, search } = parsed.data;

  let exclusiveStartKey: Record<string, any> | undefined;
  if (cursor) {
    try {
      exclusiveStartKey = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf-8")
      );
    } catch {
      res.status(400).json({ error: "Invalid cursor." });
      return;
    }
  }

  const exprAttrNames: Record<string, string> = {
    "#p": "partition",
  };

  const exprAttrValues: Record<string, any> = {
    ":p": "all",
  };

  let filterExpr: string | undefined;

  if (search) {
    exprAttrNames["#name"] = "name";
    exprAttrValues[":s"] = search.toLowerCase();

    filterExpr = "contains(#name, :s)";
  }

  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: env.DYNAMODB_TABLE,
        IndexName: "partition-created_at-index",
        KeyConditionExpression: "#p = :p",
        ...(filterExpr && { FilterExpression: filterExpr }),
        ExpressionAttributeNames: exprAttrNames,
        ExpressionAttributeValues: exprAttrValues,
        ScanIndexForward: false,
        Limit: limit,
        ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
      })
    );

    const nextCursor = result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64url")
      : null;

    res.json({
      items: result.Items?.map(({ partition, ...rest }) => rest) ?? [],
      count: result.Count ?? 0,
      next_cursor: nextCursor,
    });
  } catch (err: unknown) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
