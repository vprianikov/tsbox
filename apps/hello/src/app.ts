import { Hono } from "hono";

import hello from "./routes/hello";

const app = new Hono().basePath("/api/");

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

app.route("/hello/", hello);

export default app;
