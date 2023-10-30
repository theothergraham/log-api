// vim: ts=2:sts=2:sw=2:et:ai

import express from "express";
import { LogReader } from "./LogReader";

const app = express();

// define a route handler for the default home page
app.get("/greeter", (req, res) => {
  let { name } = req.query;
  name ??= "API User";
  res.send({ "greeting": "Hello", "target": name })
});

app.get('/log/:logfile', (req, res) => {
  const lr = new LogReader(req.params.logfile);
  const lines = [];
  for (const line of lr) {
    lines.push(line);
  }
  res.send({ results: lines });
});

export default app;
