import { Hono } from "hono";

const startRoute = new Hono();

startRoute.get("/", (c) => {
  return c.json({
    message: "Hey, welcome to API Clinic!",
    instructions: "To get started, create a new API or collection.",
    documentation: "https://docs.clinic.sh",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default startRoute;
