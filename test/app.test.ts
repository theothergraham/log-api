import request from "supertest"

import dotenv from "dotenv";
dotenv.config({ path: 'test/files/test.env' });

import app from "../src/app"

describe("express app", () => {
  test("no route", async () => {
    const response = await request(app).get("/miss");
    expect(response.status).toEqual(500);
  });

  test("missing file", async () => {
    const response = await request(app).get("/log/missing_file");
    expect(response.status).toEqual(500);
    expect(response.text).toMatch(/no such file or directory/);
  });

  test("search", async () => {
    const response = await request(app).get("/log/cross_buffers.log?regex=u&maxCount=1");
    expect(response.status).toEqual(200);
    expect(response.body.results.length).toBe(1);
    expect(response.body.results[0]).toBe('This is in the first buffer.');
  });
});
