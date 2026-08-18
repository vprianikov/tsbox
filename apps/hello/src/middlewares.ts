import { every } from "hono/combine";
import { requestId } from "hono/request-id";

import logger from "@tsbox/logger";

const middlewares = every(logger("hello-api"), requestId());

export default middlewares;
