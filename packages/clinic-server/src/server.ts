import { serve } from "@hono/node-server";
import { Hono } from "hono";


async function run(app: Hono, port: number) {
  console.log(`🚀 Server running at http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default run;
