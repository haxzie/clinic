import { Hono } from "hono";
import run from "./server";
import { env } from "./utils/secrets";

// routes
import healthRoute from "@/routes/health.route";
import relayRoute from "@/routes/relay.route";

const app = new Hono();

app.route("/health", healthRoute);
app.route("/relay", relayRoute);

run(app, env.PORT);
