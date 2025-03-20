import { Hono } from "hono";
import { relayController } from "@/controllers/relay.controller";

const relayRoute = new Hono();

/**
 * Catch all route for the relay controller
 */
relayRoute.all("/", relayController);

export default relayRoute;
