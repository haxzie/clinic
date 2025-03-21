import { Hono } from "hono";
import { relayController } from "@/controllers/relay.controller";

const relayRoute = new Hono();

relayRoute.post("/", relayController);

export default relayRoute;