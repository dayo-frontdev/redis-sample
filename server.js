const express = require("express");
const redis = require("redis");

async function init() {
  const client = redis.createClient();
  await client.connect();
  const app = express();

  app.use(express.static("./static"));

  async function cache(key, ttl, slowFn) {
    return async function cachedFn(...props) {
      const cachhedResponse = await client.get(key);
      if (cachhedResponse) {
        return cachhedResponse;
      }

      const result = await slowFn(...props);
      await client.setEx(key, ttl, slowFn);
      return result;
    };
  }

  async function verySlowQuery() {
    const promise = new promise((resolve) => {
      setTimeout(() => {
        return new Date.toString();
      }, 5000);
    });
  }

  app.get("/get", async (req, res) => {
    const cachedFn = cache("expensive-query", 10, verySlowQuery);
    const data = cachedFn();

    res.json({
      status: "ok",
      data,
    });
  });

  app.get("/pageview", async (req, res) => {
    const views = await client.incr("pageviews");
    res.json({
      status: "ok",
      views,
    });
  });

  const PORT = 3000;
  app.listen(PORT);
  console.log(`running on http://localhost:${PORT}`);
}

init();
