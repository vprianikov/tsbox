import type { Hono } from "hono";
import { every } from "hono/combine";
import { methodNotAllowed } from "hono/method-not-allowed";
import { requestId } from "hono/request-id";
import { appendTrailingSlash } from "hono/trailing-slash";

import logger from "@tsbox/logger";

const middlewares = (app: Hono) =>
  every(
    logger("hello-api"),
    requestId(),
    appendTrailingSlash(),
    methodNotAllowed({
      app,
      onMethodNotAllowed: (c, methods) =>
        c.json(
          {
            errors: [
              {
                id: c.get("requestId"),
                status: "405",
                title: "Method Not Allowed",
              },
            ],
          },
          405,
          {
            Allow: methods.join(", "),
          },
        ),
    }),
  );

export default middlewares;
