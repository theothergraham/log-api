import request from "supertest"

import app from "../src/app"

describe("Test app.ts", () => {
  test("greeter without name", async () => {
    const response = await request(app).get("/greeter");
    expect(response.status).toEqual(200);
    expect(response.body.target).toEqual("API User");
  });

  test("greeter with name", async () => {
    const response = await request(app).get("/greeter?name=John%20Doe");
    expect(response.status).toEqual(200);
    expect(response.body.target).toEqual("John Doe");
  });
});
