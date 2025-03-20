import { Context } from "hono";

export const relayController = async (c: Context) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
