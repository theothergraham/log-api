// vim: ts=2:sts=2:sw=2:et:ai

import express, { Request, Response, RequestHandler } from "express";
import { LogReader } from "./LogReader";
import { LogFilter } from "./LogFilter";

const app = express();

// define a route handler for the default home page
app.get("/greeter", (req, res) => {
  let { name } = req.query;
  name ??= "API User";
  res.send({ "greeting": "Hello", "target": name })
});

app.get('/log/:logfile', (async (req, res, next) => {
  try {
    const lr = LogReader(req.params.logfile);
    const filter = new LogFilter(lr, req.query);
    const lines = [];
    for await (const line of filter) {
      lines.push(line);
    }
    res.send({ success: true, results: lines });
  } catch (e) {
    next(e);
  }
}) as RequestHandler);

// error handler
app.use((err: Error, req: Request, res: Response) => {
  res.status(500).json({
    error: err.message,
    success: false,
  });
});

export default app;
