const express = require("express");
const redis = require("redis");

async function init() {
  const client = redis.createClient();
  await client.connect();

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
        resolve(new Date.toString());
      }, 5000);
    });
    return promise;
  }

  const cachedFn = cache("expensive-query", 10, verySlowQuery);

  const app = express();

  app.use(express.static("./static"));

  app.get("/get", async (req, res) => {
    const data = cachedFn();

    res.json({
      status: "ok",
      data,
    });
  });

  app.get("/pageview", async (req, res) => {
    const view = await client.incr("pageviews");
    res.json({
      status: "ok",
      view,
    });
  });

  const PORT = 4000;
  app.listen(PORT);
  console.log(`running on http://localhost:${PORT}`);
}

init();
