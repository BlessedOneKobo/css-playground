import { createServer } from "node:http";
import { watch, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { WebSocketServer } from "ws";

const server = createServer(async (req, res) => {
  try {
    const filePath = resolve(req.url === "/" ? "./index.html" : `.${req.url}`);
    const content = await readFile(filePath, { encoding: "utf8" });
    res.statusCode = 200;
    res.end(content)
  } catch (err) {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("server: Listening on 127.0.0.1:3000");
});

const wss = new WebSocketServer({ port: 6969 })
wss.on("connection", async (ws) => {
  console.log("wss://connected");
  try {
    const watcher = watch("index.html");
    for await (const event of watcher) {
      if (event.eventType === "change") {
        console.log("server: restarting...")
        server.close(() => {
          server.listen(3000, "127.0.0.1", () => {
            console.log("server: Restarted ✅");
            ws.send("change")
          });
        })
      }
    }
  } catch (err) {
    throw err;
  }
});
