import { Hono } from "hono";
// routes
import healthRoute from "@/routes/health.route";
import relayRoute from "@/routes/relay.route";
import startRoute from "@/routes/start.route";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();
app.use(logger());
app.use(
  cors({
    origin: "*", // allow all origins
  })
);

app.route("/health", healthRoute);
app.route("/relay", relayRoute);
app.route("/start", startRoute);

export default app;
