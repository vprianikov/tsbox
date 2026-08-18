import { Hono } from "hono";

import logger from "@tsbox/logger";

import hello from "./routes/hello";

const app = new Hono();

app.use(logger("hello-api"));

app.onError((_, c) => {
  return c.json(
    {
      errors: [
        {
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
