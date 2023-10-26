// vim: ts=2:sts=2:sw=2:et:ai

import express from "express";

const app = express();

// define a route handler for the default home page
app.get("/greeter", (req, res) => {
    let { name } = req.query;
    name ??= "API User";
    //res.send(`Hello, ${name}!`);
    res.send({ "greeting": "Hello", "target": name })
});

export default app;
