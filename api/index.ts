import type { Request, Response } from "express";

let appPromise: Promise<unknown> | null = null;

const loadApp = async () => {
  appPromise ??= import("../src/app").then((mod) => mod.default);
  return appPromise;
};

export default async function handler(req: Request, res: Response) {
  try {
    const app = (await loadApp()) as (req: Request, res: Response) => void;
    return app(req, res);
  } catch (error) {
    console.error("Failed to boot be-sadam serverless app", error);
    const message = error instanceof Error ? error.message : "Unknown server error";

    return res.status(500).json({
      success: false,
      message: "Backend gagal start di Vercel",
      error: message,
    });
  }
}
