import { Hono } from "hono";
import { requestId } from "hono/request-id";

import logger from "@tsbox/logger";

import hello from "./routes/hello";

const app = new Hono();

app.use(logger("hello-api"));
app.use(requestId());

app.onError((_, c) => {
  return c.json(
    {
      errors: [
        {
          id: c.get("requestId"),
          status: "500",
          title: "Internal Server Error",
        },
      ],
    },
    500,
  );
});

app.notFound((c) => {
  return c.json(
    {
      errors: [
        {
          id: c.get("requestId"),
          status: "404",
          title: "Not Found",
        },
      ],
    },
    404,
  );
});

app.route("/api/hello/", hello);

export default app;
