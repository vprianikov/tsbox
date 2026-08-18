import { every } from "hono/combine";
import { requestId } from "hono/request-id";
import { appendTrailingSlash } from "hono/trailing-slash";

import logger from "@tsbox/logger";

const middlewares = every(
  logger("hello-api"),
  requestId(),
  appendTrailingSlash(),
);

export default middlewares;
