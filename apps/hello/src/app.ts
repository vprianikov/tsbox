import { Hono } from "hono";

import hello from "./routes/hello";

const app = new Hono().basePath("/api/");

app.route("/hello/", hello);

export default app;
