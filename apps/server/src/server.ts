import app from ".";
import run from "./utils/server";
import { env } from "./utils/secrets";

// Start the server
run(app, env.PORT);