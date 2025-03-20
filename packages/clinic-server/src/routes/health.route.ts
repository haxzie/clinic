import { Hono } from "hono";

const health = new Hono();

health.get("/", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default health;
