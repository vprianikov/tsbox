import { Hono } from "hono";

const hello = new Hono();

hello.get("/", (c) => {
  return c.json({
    data: {
      message: "Hello, world!",
      method: "GET",
    },
  });
});

hello.put("/", (c) => {
  return c.json({
    data: {
      message: "Hello, world!",
      method: "PUT",
    },
  });
});

hello.get("/:name/", (c) => {
  const name = c.req.param("name");

  return c.json({
    data: {
      message: `Hello, ${name}!`,
    },
  });
});

export default hello;
