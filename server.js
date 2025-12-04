const express = require("express");
const redis = require("redis");

async function init() {
  const client = redis.createClient();
  await client.connect();
  const app = express();

  app.use(express.static("./static"));

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
