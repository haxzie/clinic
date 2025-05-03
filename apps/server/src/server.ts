import run from "./utils/server";
import { env } from "./utils/secrets";
import app from ".";

// Start the server
run(app, env.PORT);
