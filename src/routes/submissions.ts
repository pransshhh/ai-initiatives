import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";
import { z } from "zod/v4";
import pool from "../db.js";

const router: Router = createRouter();

const submissionSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  company: z.string().min(1),
  project: z.string().min(1),
  description: z.string().min(1),
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = submissionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: z.prettifyError(parsed.error) });
    return;
  }

  const { name, email, company, project, description } = parsed.data;

  try {
    const result = await pool.query(
      `INSERT INTO form_submissions (name, email, company, project, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [name, email, company, project, description]
    );

    res.status(201).json({
      message: "Submission received.",
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
    });
  } catch (err: any) {
    console.error("DB ERROR:", err);
    res.status(500).json({
      error: err.message,
      code: err.code,
      detail: err.detail,
    });
  }
});

export default router;
