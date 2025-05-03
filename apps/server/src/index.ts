import { Hono } from "hono";
// routes
import healthRoute from "@/routes/health.route";
import relayRoute from "@/routes/relay.route";
import { cors } from "hono/cors";

const app = new Hono();
app.use(
  cors({
    origin: "*", // allow all origins
  })
);

app.route("/health", healthRoute);
app.route("/relay", relayRoute);

export default { fetch: app.fetch };
