import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import middlewares from "./middlewares";
import hello from "./routes/hello";

const app = new Hono();

app.use(middlewares(app));

app.onError((error, c) => {
  const status = error instanceof HTTPException ? error.status : 500;
  const title =
    error instanceof HTTPException ? error.message : "Internal Server Error";

  return c.json(
    {
      errors: [
        {
          id: c.get("requestId"),
          status: status.toString(),
          title,
        },
      ],
    },
    status,
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
