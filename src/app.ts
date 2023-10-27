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

app.get("/log", (req, res) => {
  const lr = new LogReader();
  // TODO ugly loop but can probably clean up with a proper iterator
  const lines = [];
  let line = lr.getNextLine();
  while (line) {
    lines.push(line);
    line = lr.getNextLine();
  }
  res.send({ results: lines });
});

export default app;
